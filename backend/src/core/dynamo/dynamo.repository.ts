import { QueryInput } from '@aws-sdk/client-dynamodb';
import { inject, injectable } from 'inversify';
import * as lodash from 'lodash';
import { DateTime } from 'luxon';
import { gzip, ungzip } from 'node-gzip';
import { AbstractBackend } from '../../../../frontend/src/app/core/abstract-contract';
import { Checker } from '../../../../frontend/src/app/shared/checker/checker';
import { Id } from '../../../../frontend/src/app/shared/id/id';
import { SharedIndex } from '../../../cdk/lib/tables/shared';
import { DynamoService, ModifyListInput, ModifyListInputConfig } from '../../core/dynamo/dynamo.service';
import { monitorExecution } from '../../shared/execution-history/execution-monitor.decorator';
import { GlobalAssertion } from '../../shared/global-assertion/global-assertion';
import { ErrorLocation, ValueConstraintError } from '../../shared/global-assertion/global-assertion.error';
import UserAuth0Service from '../user/auth0/user-auth0.service';
import { GlobalField } from './../../../../frontend/src/app/shared/global-field/global-field';
import { ObjectUtils } from './../../../../frontend/src/app/shared/utils/object-utils';
import { DynamoCannotDeleteMyItemBecauseCurrentUserDoesNotOwnIt, DynamoNoUpdateValueOnAttributesError } from './dynamo.error';

@injectable()
export abstract class DynamoRepository<Item extends AbstractBackend> {
  abstract get tableName(): string;
  abstract get rangeKey(): null | string;
  abstract get whitelistForZipSet(): Set<string>;

  @inject(UserAuth0Service)
  protected userAuth0Service: UserAuth0Service;

  @inject(DynamoService)
  protected dynamoService: DynamoService;

  // Default cache period
  protected _timeToLiveSeconds = 2;

  // Always expired at the beginning.
  private _expiredTime = DateTime.utc().minus({ seconds: this._timeToLiveSeconds });

  private _filterAndItemList = new Map<string, Item[]>();
  private _filterAndExpiredTime = new Map<string, DateTime>();

  private _singleIdAndItem = new Map<string, ItemAndExpiredTime<Item>>();

  /*
   * MARK - get all items
   */
  private _idAndItem = new Map<string, Item>();
  private _itemList: Item[] = [];

  async zip(itemList: Item[]) {
    if (this.whitelistForZipSet.size > 0) {
      for (const item of itemList) {
        if (!item) {
          continue;
        }

        const { id, version, lastModifiedById, lastModifiedTimeStr, createdById, createdTimeStr, errorType, zippedData, ...rest } = item;

        for (const whitelistKey of this.whitelistForZipSet) {
          delete rest[whitelistKey];
        }

        if (rest) {
          const restStr = JSON.stringify(rest);
          const zippedRestStr = await gzip(restStr);

          if (restStr.length > zippedRestStr.length + 5) {
            item.zippedData = zippedRestStr;
            for (const restKey of Object.keys(rest)) {
              delete item[restKey];
            }
          }
        }
      }
    }
  }

  async unzip(itemList: Item[]) {
    if (this.whitelistForZipSet.size > 0) {
      const needToUnZipPromiseList = itemList.map((c) => {
        if (!c?.zippedData) {
          return Promise.resolve(null);
        }
        return ungzip(c.zippedData);
      });
      const resultList = await Promise.all(needToUnZipPromiseList);

      for (let i = 0; i < itemList.length; i++) {
        if (resultList[i]) {
          if (itemList[i]) {
            const tempItem = JSON.parse(resultList[i].toString());
            delete itemList[i].zippedData;
            Object.assign(itemList[i], tempItem);
          }
        }
      }
    }
  }

  public async getItemListByIdWithoutCache(id: string) {
    const result = await this.getByPartiQL({ whereClause: `"id"='${id}'` });
    return result ?? [];
  }

  public async getByPartiQLWhereInWithoutCache(
    whereInName: string,
    whereInArray: string[],
    config?: { indexName?: string; otherWhereClause?: string; selectClause?: string; loadCount?: number }
  ) {
    if (whereInArray.length === 0) {
      return [];
    }
    const result = await this.dynamoService.getByPartiQLWhereIn(
      { name: this.tableName, indexName: config?.indexName },
      whereInName,
      whereInArray,
      config?.otherWhereClause,
      config?.selectClause,
      config?.loadCount
    );

    await this.unzip(result);
    return result;
  }

  public async getByPartiQL(config?: {
    indexName?: string;
    whereClause?: string;
    selectClause?: string;
    loadCount?: number;
    noCache?: boolean;
  }): Promise<Partial<Item>[]> {
    const paramsStr = JSON.stringify({ tableName: this.tableName, indexName: config?.indexName, config });

    if (!config?.noCache) {
      if (this._filterAndItemList.has(paramsStr)) {
        if (!this.isGetItemListCacheExpired(paramsStr)) {
          return Promise.resolve(this._filterAndItemList.get(paramsStr));
        }
      }
    }

    const result = (await this.dynamoService.getByPartiQL(
      { name: this.tableName, indexName: config?.indexName },
      config.whereClause,
      config.selectClause,
      config.loadCount
    )) as Item[];

    await this.unzip(result);

    this._filterAndItemList.set(paramsStr, result);
    this._filterAndExpiredTime.set(paramsStr, DateTime.utc().plus({ seconds: this._timeToLiveSeconds }));
    return result;
  }

  private setBackendForUpdate(backend: Partial<Item>) {
    ObjectUtils.removeUndefined(backend);
  }

  public async getAllItems(): Promise<Item[]> {
    if (!this.isGetAllItemsCacheExpired()) {
      return Promise.resolve(this._itemList);
    }

    this._itemList = await (this.dynamoService.getAllItems({ TableName: this.tableName }) as Promise<Item[]>);

    await this.unzip(this._itemList);

    this._idAndItem.clear();
    this._itemList.forEach((item) => {
      this._idAndItem.set(item.id, item);
    });

    this._expiredTime = DateTime.utc().plus({ seconds: this._timeToLiveSeconds });

    return this._itemList;
  }

  public async getIdAndItem() {
    if (this.isGetAllItemsCacheExpired()) {
      const itemList = await this.getAllItems();
      if (itemList) {
        return this._idAndItem;
      }
    } else {
      return this._idAndItem;
    }
  }

  public isGetAllItemsCacheExpired() {
    return this._expiredTime < DateTime.utc();
  }

  public isGetItemListCacheExpired(paramsStr: string) {
    return this._filterAndExpiredTime.has(paramsStr) && this._filterAndExpiredTime.get(paramsStr) < DateTime.utc();
  }

  /*
   * MARK - get all items - with query
   */
  public async getAllItemsByUserId(userId: string): Promise<Item[]> {
    const expressionAttributeValues = {
      ':createdById': userId,
    } as any;

    const paramsCreatedBy = {
      TableName: this.tableName,
      IndexName: SharedIndex.createdByIdCreatedTimeStrIndex,
      KeyConditionExpression: `createdById = :createdById`,
      ExpressionAttributeValues: expressionAttributeValues,
    } as QueryInput;

    const paramsStr = JSON.stringify(paramsCreatedBy);

    if (this._filterAndItemList.has(paramsStr)) {
      if (!this.isGetItemListCacheExpired(paramsStr)) {
        return Promise.resolve(this._filterAndItemList.get(paramsStr));
      }
    }

    const result = (await this.dynamoService.getAllQueryItemList(paramsCreatedBy)) as Item[];

    await this.unzip(result);

    this._filterAndItemList.set(paramsStr, result);
    this._filterAndExpiredTime.set(paramsStr, DateTime.utc().plus({ seconds: this._timeToLiveSeconds }));
    return result;
  }

  public async getAllItemsByName(name: string): Promise<Item[]> {
    const params = {
      TableName: this.tableName,
      FilterExpression: `#name1 = :name`,
      ExpressionAttributeNames: {
        '#name1': 'name',
      } as any,
      ExpressionAttributeValues: {
        ':name': name,
      } as any,
    };

    const paramsStr = JSON.stringify(params);

    if (this._filterAndItemList.has(paramsStr)) {
      if (!this.isGetItemListCacheExpired(paramsStr)) {
        return Promise.resolve(this._filterAndItemList.get(paramsStr));
      }
    }

    const result = (await this.dynamoService.getAllItems(params)) as Item[];

    await this.unzip(result);

    this._filterAndItemList.set(paramsStr, result);
    this._filterAndExpiredTime.set(paramsStr, DateTime.utc().plus({ seconds: this._timeToLiveSeconds }));
    return result;
  }

  public async getAllItemsByIdListWithoutCache(
    idList: string[],
    rangeKeyValueList?: string[],
    attributesToGet?: string[]
  ): Promise<Item[]> {
    if (Checker.arrayIsEmpty(idList)) {
      return [];
    }

    let attributesToGetReal = attributesToGet;

    if (attributesToGetReal) {
      if (!attributesToGetReal.every((c) => this.whitelistForZipSet.has(c))) {
        attributesToGetReal = undefined;
      }
    }

    const keys = idList.map((id) => ({ id }));

    if (rangeKeyValueList) {
      GlobalAssertion.oldAssertTrue(
        idList.length === rangeKeyValueList.length,
        new ValueConstraintError({
          message: `Partition Key (count: ${idList.length}) and Sort Key (count: ${rangeKeyValueList.length}) should have the same length.`,
          data: { location: ErrorLocation.database },
        })
      );
      for (let i = 0; i < keys.length; i++) {
        keys[i][this.rangeKey] = rangeKeyValueList[i];
      }
    }

    let result = (await this.dynamoService.getAllItemsByIdList(this.tableName, keys, attributesToGetReal)) as Item[];

    await this.unzip(result);

    if (attributesToGet && !attributesToGetReal) {
      const tempResult = [];
      result.forEach((item) => {
        const tempOneItem = {};
        attributesToGet.forEach((attribute) => {
          tempOneItem[attribute] = item[attribute];
        });
        tempResult.push(tempOneItem);
      });

      result = tempResult;
    }

    return result ?? [];
  }

  public async getItemList(params: QueryInput): Promise<Item[]> {
    const paramsStr = JSON.stringify(params);
    if (this._filterAndItemList.has(paramsStr)) {
      if (!this.isGetItemListCacheExpired(paramsStr)) {
        return Promise.resolve(this._filterAndItemList.get(paramsStr));
      }
    }

    const result = (await this.dynamoService.getAllQueryItemList(params)) as Item[];

    await this.unzip(result);

    this._filterAndItemList.set(paramsStr, result);
    this._filterAndExpiredTime.set(paramsStr, DateTime.utc().plus({ seconds: this._timeToLiveSeconds }));
    return result ?? [];
  }

  /**
   * Need Index: createdByIdIndex and createdBy as an attribute
   *
   * @param {tableNames} tableName
   * @memberof DynamoService
   */
  public getAllMyItems(): Promise<Item[]> {
    return this.getAllItemsByUserId(this.userAuth0Service.loginedUserId);
  }

  /*
   * MARK - get item
   */
  @monitorExecution()
  public async getItem(id: string, sortKeyValue?: string) {
    const key = `${id}_${sortKeyValue}`;
    if (this._singleIdAndItem.has(key) && this._singleIdAndItem.get(key).expiredTime > DateTime.utc()) {
      return Promise.resolve(this._singleIdAndItem.get(key).item);
    } else {
      const expiredTime = DateTime.utc().plus({ seconds: this._timeToLiveSeconds });
      const item = await this.getItemWithoutCache(id, sortKeyValue);

      this._singleIdAndItem.set(key, {
        item,
        expiredTime,
      });
      return item;
    }
  }

  @monitorExecution()
  public async getItemWithoutCache(id: string, sortKeyValue?: string) {
    const item = (await this.dynamoService.getItem(this.tableName, id, {
      name: this.rangeKey,
      value: sortKeyValue,
    })) as Item;

    if (item) {
      await this.unzip([item]);
    }

    return item;
  }

  /*
   * MARK - add item
   */
  @monitorExecution()
  protected async addItem(backend: any, id?: string, createdById?: string, createdTimeStr?: string): Promise<Item> {
    await this.zip([backend]);

    const result = await (this.dynamoService.addItem(this.tableName, backend, id, createdById, createdTimeStr) as Promise<Item>);

    await this.unzip([result]);

    this.cleanCache();
    return result;
  }

  @monitorExecution()
  protected async putItem(backend: any, createdById?: string) {
    const result = await this.addItem(backend, backend.id, createdById);
    this.cleanCache();
    return result;
  }

  @monitorExecution()
  protected async putItemPure(backend: any) {
    const rawBackend = lodash.cloneDeep(backend);
    await this.zip([backend]);
    await this.dynamoService.putItemPure(this.tableName, backend);
    this.cleanCache();
    return rawBackend;
  }

  /**
   * @deprecated Use `batchWriteItemList(...)` instead.
   */
  @monitorExecution()
  protected async addItemList(backendList: any[], createdById?: string): Promise<Item[]> {
    const result = await this.batchWriteItemList({ addList: backendList }, { add: { createdById } });
    this.cleanCache();
    return result.addedItemList as Item[];
  }

  @monitorExecution()
  protected async batchWriteItemList(
    modifyList: ModifyListInput,
    config?: ModifyListInputConfig
  ): Promise<{ addedItemList: Item[]; updatedItemList: Item[]; deletedItemList: Item[] }> {
    if (modifyList.addList) {
      await this.zip(modifyList.addList as Item[]);
    }

    if (modifyList.updateList) {
      await this.zip(modifyList.updateList as Item[]);
    }

    const result = await this.dynamoService.batchWriteItemList(this.tableName, modifyList, config);

    await this.unzip(result.addedItemList as Item[]);
    await this.unzip(result.updatedItemList as Item[]);

    this.cleanCache();
    return result as { addedItemList: Item[]; updatedItemList: Item[]; deletedItemList: Item[] };
  }

  /*
   * MARK - update item
   */
  @monitorExecution()
  protected async updateItem(item: Item, fields: GlobalField[], lastModifiedById?: string): Promise<Item> {
    GlobalAssertion.oldAssertTrue(Checker.arrayIsNotEmpty(fields), new DynamoNoUpdateValueOnAttributesError());

    this.setBackendForUpdate(item);

    const fromDatabase = await this.getItemWithoutCache(item.id, item[this.rangeKey]);

    GlobalAssertion.assertTrue({
      value: fromDatabase.version === item.version,
      message: `Version does not match. Database: ${fromDatabase.version}, coming version: ${item.version}`,
      location: ErrorLocation.database,
    });

    await this.unzip([fromDatabase]);

    fields.forEach((field) => {
      fromDatabase[field.name] = item[field.name];
    });

    fromDatabase.version = Id.uuid.generateInBase62();

    await this.dynamoService.updateItem(this.tableName, fromDatabase, { lastModifiedById });

    this.cleanCache(item.id, item[this.rangeKey]);

    return fromDatabase;
  }

  @monitorExecution()
  protected async updateMyItem(item: Item, fields: GlobalField[]): Promise<Item> {
    GlobalAssertion.oldAssertTrue(
      this.userAuth0Service.loginedUserId === item.createdById,
      ValueConstraintError.of({
        message: `User id ${item.createdById} does not equal to the logined user id ${this.userAuth0Service.loginedUserId}.`,
        location: ErrorLocation.database,
      })
    );
    return this.updateItem(item, fields, item.createdById);
  }

  /*
   * MARK - delete item
   */
  @monitorExecution()
  protected async deleteItem(backend: { id: string; sk?: string; sortKey?: string }): Promise<Item> {
    const result = await (this.dynamoService.deleteItem(this.tableName, backend) as Promise<Item>);
    this.cleanCache(backend.id, backend[this.rangeKey]);
    return result;
  }

  /**
   * @deprecated Use `batchWriteItemList(...)` instead.
   */
  @monitorExecution()
  protected async deleteItemList(backendIdList: string[]): Promise<string[]> {
    const result = await this.batchWriteItemList({
      deleteList: backendIdList.map((c) => ({ id: c })),
    });

    backendIdList.forEach((c) => {
      this.cleanCache(c, c[this.rangeKey]);
    });
    return result.deletedItemList.map((c) => c.id);
  }

  @monitorExecution()
  protected async deleteMyItem(backend: Item): Promise<Item> {
    const item = await this.getItem(backend.id);
    if (item.createdById !== this.userAuth0Service.loginedUserId) {
      throw new DynamoCannotDeleteMyItemBecauseCurrentUserDoesNotOwnIt();
    }

    this.cleanCache(backend.id, backend[this.rangeKey]);
    return this.dynamoService.deleteMyItem(this.tableName, backend) as Promise<Item>;
  }

  protected cleanCache(itemId?: string, sortKeyValue?: string) {
    const key = `${itemId}_${sortKeyValue}`;
    this._expiredTime = DateTime.utc().minus({ day: 1 });
    if (key && this._singleIdAndItem.has(key)) {
      this._singleIdAndItem.delete(key);
    }

    this._filterAndExpiredTime.clear();
    this._filterAndItemList.clear();

    this._idAndItem.delete(key);
  }
}

interface ItemAndExpiredTime<Item extends AbstractBackend> {
  item: Item;
  expiredTime: DateTime;
}
