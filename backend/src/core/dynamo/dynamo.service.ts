import { QueryInput, ScanInput } from '@aws-sdk/client-dynamodb';

import { inject, injectable } from 'inversify';
import { DateTime } from 'luxon';
import { AbstractBackend } from '../../../../frontend/src/app/core/abstract-contract';
import { Id } from '../../../../frontend/src/app/shared/id/id';
import { ObjectUtils } from '../../../../frontend/src/app/shared/utils/object-utils';
import { dynamoReservedWordSet } from '../../shared/dynamo-reserved-words';
import { monitorExecution } from '../../shared/execution-history/execution-monitor.decorator';
import { GlobalAssertion } from '../../shared/global-assertion/global-assertion';
import { ErrorLocation, ValueShouldNotExistButExistError } from '../../shared/global-assertion/global-assertion.error';
import { isEmpty } from '../../shared/objects/object-utility';
import { wait } from '../../shared/promise/promise';
import UserAuth0Service from '../user/auth0/user-auth0.service';
import { DynamoNativeService } from './dynamo-native.service';
import { DynamoTooManyItemsError } from './dynamo.error';

export interface RangeKey {
  name: string;
  value: any;
}

@injectable()
export class DynamoService {
  @inject(UserAuth0Service)
  private userAuth0Service: UserAuth0Service;

  @inject(DynamoNativeService)
  dynamoNativeService: DynamoNativeService;

  private readonly mostLoadCount = 10;

  private readonly maxLoadItemCountForPartiQL = 49;

  async getByPartiQLWhereIn(
    table: { name: string; indexName?: string },
    whereInName: string,
    whereInArray: string[],
    otherWhereClause?: string,
    selectClause = '*',
    loadCount = this.mostLoadCount
  ) {
    const copiedWhereInArray = [...whereInArray];
    let curWhereInArray = copiedWhereInArray.splice(0, this.maxLoadItemCountForPartiQL);

    let itemList = [];
    while (curWhereInArray.length > 0) {
      const whereClause = `${whereInName} IN ['${curWhereInArray.join("','")}']${otherWhereClause}`;

      const result = await this.getByPartiQL(table, whereClause, selectClause, loadCount);
      itemList = itemList.concat(result);

      curWhereInArray = copiedWhereInArray.splice(0, this.maxLoadItemCountForPartiQL);
    }
    return itemList;
  }

  async getByPartiQL(
    table: { name: string; indexName?: string },
    whereClause?: string,
    selectClause = '*',
    loadCount = this.mostLoadCount
  ) {
    let itemList = [];
    let result = await this.dynamoNativeService.getByPartiQL(table, whereClause, selectClause);

    itemList = itemList.concat(result.Items);

    let curCount = 1;

    while (curCount <= loadCount && result.NextToken) {
      result = await this.dynamoNativeService.getByPartiQL(table, whereClause, selectClause, result.NextToken);
      itemList = itemList.concat(result.Items);
      curCount++;
    }

    if (result.NextToken) {
      // TODO: Need a monitor for this.
      console.error(`ERROR: Too many items for: ${JSON.stringify(table)}. ${whereClause}`);
    }

    return itemList;
  }

  async getByPartiQLOnce(
    table: { name: string; indexName?: string },
    config?: {
      whereClause?: string;
      selectClause?: string;
      nextToken?: string;
    }
  ): Promise<{ items: AbstractBackend[]; nextToken?: string }> {
    const result = await this.dynamoNativeService.getByPartiQL(table, config?.whereClause, config?.selectClause, config?.nextToken);

    const items = result.Items as AbstractBackend[];

    return {
      items,
      nextToken: result.NextToken,
    };
  }

  async deleteByPartiQL(tableName: String, id: string) {
    const query = `DELETE FROM "${tableName}" WHERE "id" = '${id}'`;
    return this.dynamoNativeService.runPartiQL(query);
  }

  @monitorExecution()
  async getItem(tableName: string, id: string, rangeKey?: RangeKey): Promise<AbstractBackend> {
    const key = { id };
    if (rangeKey) {
      key[rangeKey.name] = rangeKey.value;
    }

    const data = await this.dynamoNativeService.get({
      TableName: tableName,
      Key: key as any,
      ConsistentRead: true,
    });

    return data.Item as any as AbstractBackend;
  }

  async getAllItems(params: ScanInput): Promise<AbstractBackend[]> {
    // SOFT-DUPLICATION: 277164
    let result: AbstractBackend[] = [];
    let loadCount = 0;
    while (true) {
      const data = await this.dynamoNativeService.scan(params);
      loadCount++;
      const itemList = (data.Items || []) as any as AbstractBackend[];
      result = result.concat(itemList);
      if (!data.LastEvaluatedKey) {
        break;
      }
      params.ExclusiveStartKey = data.LastEvaluatedKey;
      if (loadCount >= this.mostLoadCount) {
        throw new DynamoTooManyItemsError();
      }
    }
    return result;
  }

  async getAllItemsByIdList(tableName: string, keys: any[], attributesToGet?: string[]): Promise<AbstractBackend[]> {
    const queryParams = { RequestItems: {} };

    const dynamoDBItemLimit = 100;

    let result: AbstractBackend[] = [];
    for (let i = 0; i < keys.length; i += dynamoDBItemLimit) {
      const slicedKeyList = keys.slice(i, Math.min(i + dynamoDBItemLimit, keys.length));

      if (attributesToGet) {
        queryParams.RequestItems[tableName] = {
          Keys: slicedKeyList,
          AttributesToGet: attributesToGet,
        };
      } else {
        queryParams.RequestItems[tableName] = {
          Keys: slicedKeyList,
        };
      }

      let data = await this.dynamoNativeService.batchGet(queryParams);
      result = result.concat(data.Responses[tableName] as any as AbstractBackend[]);

      // A single operation can retrieve up to 16 MB of data.
      // If 100 items are larger than 16 mb, need to retrive multiple times.
      while (data.UnprocessedKeys[tableName]?.Keys.length > 0) {
        queryParams.RequestItems[tableName] = {
          Keys: data.UnprocessedKeys[tableName]?.Keys,
        };

        data = await this.dynamoNativeService.batchGet(queryParams);
        result = result.concat(data.Responses[tableName] as any as AbstractBackend[]);
      }
    }

    return result;
  }

  async getQueryItemListFirstBatch(params: QueryInput): Promise<AbstractBackend[]> {
    const data = await this.dynamoNativeService.query(params);
    return (data.Items || []) as any as AbstractBackend[];
  }

  async getAllQueryItemList(params: QueryInput): Promise<AbstractBackend[]> {
    // SOFT-DUPLICATION: 277164
    let result: AbstractBackend[] = [];
    let loadCount = 0;
    while (true) {
      const data = await this.dynamoNativeService.query(params);
      loadCount++;
      const itemList = (data.Items || []) as any as AbstractBackend[];
      result = result.concat(itemList);
      if (!data.LastEvaluatedKey) {
        break;
      }
      params.ExclusiveStartKey = data.LastEvaluatedKey;
      if (loadCount >= this.mostLoadCount) {
        throw new DynamoTooManyItemsError();
      }
    }
    return result;
  }

  @monitorExecution()
  async addItem(tableName: string, backend: any, id?: string, createdById?: string, createdTimeStr?: string) {
    this.setBackendForAdd(backend as AbstractBackend, id, createdById, createdTimeStr);

    await this.dynamoNativeService.put({
      TableName: tableName,
      Item: backend,
    });

    return backend;
  }

  @monitorExecution()
  putItemPure(tableName: string, backend: any) {
    return this.dynamoNativeService.put({
      TableName: tableName,
      Item: backend,
    });
  }

  @monitorExecution()
  updateItem(tableName: string, backend: any, config?: { lastModifiedById?: string; lastModifiedTimeStr?: string }) {
    this.setBackendForUpdate(backend, config?.lastModifiedById, config?.lastModifiedTimeStr);
    return this.putItemPure(tableName, backend);
  }

  @monitorExecution()
  async batchWriteItemList(tableName: string, modifyList: ModifyListInput, config?: ModifyListInputConfig) {
    const addList: AbstractBackend[] = (modifyList.addList as AbstractBackend[]) ?? [];
    const updateList = modifyList.updateList ?? [];
    const deleteList = modifyList.deleteList ?? [];

    addList.forEach((c) => {
      let createdTimeStr = DateTime.utc().toISO();

      if (config?.add?.useSelfCreatedTimeStr) {
        createdTimeStr = c.createdTimeStr;
      } else if (config?.add?.createdTimeStr) {
        createdTimeStr = config?.add?.createdTimeStr;
      }

      this.setBackendForAdd(c, c.id, config?.add?.createdById, createdTimeStr);
    });

    updateList.forEach((c) => {
      if (config?.update?.isModifiedBySystem) {
        this.setBackendForUpdate(c, c.lastModifiedById, config?.update?.lastModifiedTimeStr);
      } else {
        this.setBackendForUpdate(c, config?.update?.lastModifiedById, config?.update?.lastModifiedTimeStr);
      }
    });

    if (!config?.update?.notVerifyVersion) {
      const keyList = updateList.map((c) => ({ id: c.id, sk: c.sk, sortKey: c.sortKey }));
      const currentItemList = await this.getAllItemsByIdList(tableName, keyList, ['version']);

      for (const a of updateList) {
        for (const b of currentItemList) {
          if (a.id === b.id) {
            GlobalAssertion.assertTrue({
              value: a.version === b.version,
              message: `The version does not match. ${a.id} is ${a.version} but in the database: ${b.version}`,
            });
          }
        }
      }
    }

    // Delete first, then add, update
    const allList: AbstractBackend[] | { id: string }[] = deleteList.concat(addList).concat(updateList);
    const removedItemCount = deleteList.length;

    const oneTimeMostItemCount = 25;

    let oneTimeArray = [];
    for (let i = 0; i < allList.length; i++) {
      const backend: {
        id: string;
        sk?: string;
        sortKey?: string;
        createdTimeStr?: string;
        lastModifiedTimeStr?: string;
      } = allList[i];

      let item: any = {
        DeleteRequest: {
          Key: { id: backend.id },
        },
      };

      if (backend.sk) {
        item.DeleteRequest.Key.sk = backend.sk;
      }

      if (backend.sortKey) {
        item.DeleteRequest.Key.sortKey = backend.sortKey;
      }

      if (!backend.sk && !backend.sortKey && backend.createdTimeStr) {
        item.DeleteRequest.Key.createdTimeStr = backend.createdTimeStr;
      }

      if (i >= removedItemCount) {
        item = {
          PutRequest: {
            Item: backend,
          },
        };
      }

      oneTimeArray.push(item);

      if (oneTimeArray.length === oneTimeMostItemCount) {
        await this.batchWriteOneArray(tableName, oneTimeArray);

        oneTimeArray = [];
      }

      await wait(1);
    }

    if (oneTimeArray.length > 0) {
      await this.batchWriteOneArray(tableName, oneTimeArray);
    }

    // TODO: It does not handle the unprocessed item list.
    return {
      updatedItemList: updateList,
      addedItemList: addList,
      deletedItemList: deleteList,
    };
  }

  private async batchWriteOneArray(tableName: string, oneArray: any[]) {
    const params = {
      RequestItems: {},
    };

    params.RequestItems[tableName] = oneArray;

    let oneResult = await this.dynamoNativeService.batchWrite(params);

    const retryTimes = 3;
    let currentRetryTime = 1;
    while (currentRetryTime <= retryTimes && oneResult.UnprocessedItems && Object.keys(oneResult.UnprocessedItems).length !== 0) {
      // There are unprocessed items: oneResult.UnprocessedItems
      await wait(50 * currentRetryTime);
      params.RequestItems = oneResult.UnprocessedItems;
      oneResult = await this.dynamoNativeService.batchWrite(params);

      currentRetryTime++;
    }

    if (oneResult.UnprocessedItems && Object.keys(oneResult.UnprocessedItems).length !== 0) {
      const unprocessedItemsCount = Object.keys(oneResult.UnprocessedItems).length;
      GlobalAssertion.oldAssertTrue(
        unprocessedItemsCount !== 0,
        ValueShouldNotExistButExistError.of({
          message: `${tableName}: unprocesed items count: ${unprocessedItemsCount}. params: ${params}`,
          location: ErrorLocation.database,
        })
      );
    }

    return oneResult;
  }

  private setBackendForAdd(backend: Partial<AbstractBackend>, id?: string, createdById?: string, createdTimeStr?: string) {
    backend.id = id ?? Id.uuid.generateInBase62();

    if (createdById) {
      backend.createdById = createdById;
    } else {
      backend.createdById = this.userAuth0Service.loginedUserId;
    }

    backend.createdTimeStr = createdTimeStr ?? DateTime.utc().toISO();

    backend.lastModifiedById = backend.createdById;
    backend.lastModifiedTimeStr = backend.createdTimeStr;

    backend.version = Id.uuid.generateInBase62();

    ObjectUtils.removeUndefined(backend);
  }

  private setBackendForUpdate(backend: Partial<AbstractBackend>, lastModifiedById?: string, lastModifiedTimeStr?: string) {
    if (lastModifiedById) {
      backend.lastModifiedById = lastModifiedById;
    } else {
      backend.lastModifiedById = this.userAuth0Service.loginedUserId;
    }

    if (lastModifiedTimeStr) {
      backend.lastModifiedTimeStr = lastModifiedTimeStr;
    } else {
      backend.lastModifiedTimeStr = DateTime.utc().toISO();
    }

    ObjectUtils.removeUndefined(backend);
  }

  /*
  @monitorExecution()
  async updateItem(
    tableName: string,
    id: string,
    rangeKey: string | null,
    rangeValue: string | null,
    curVersion: string,
    attributeNameAndValue: Map<string, any>,
    lastModifiedById?: string,
  ) {
    const conditionExpression = 'version = :oldVersion';
    return this.updateQuery(
      tableName,
      id,
      rangeKey,
      rangeValue,
      curVersion,
      attributeNameAndValue,
      conditionExpression,
      lastModifiedById,
    );
  }
  */

  @monitorExecution()
  async updateMyItem(
    tableName: string,
    id: string,
    rangeKey: string | null,
    rangeValue: string | null,
    curVersion: string,
    attributeNameAndValue: Map<string, any>,
    createdById?: string
  ) {
    const conditionExpression = 'version = :oldVersion AND createdById=:createdById';

    if (createdById) {
      attributeNameAndValue.set('createdById', createdById);
    } else {
      attributeNameAndValue.set('createdById', this.userAuth0Service.loginedUserId);
    }

    return this.updateQuery(tableName, id, rangeKey, rangeValue, curVersion, attributeNameAndValue, conditionExpression, createdById);
  }

  @monitorExecution()
  private async updateQuery(
    tableName: string,
    id: string,
    rangeKey: string | null,
    rangeValue: string | null,
    curVersion: string,
    attributeNameAndValue: Map<string, any>,
    conditionExpression: string,
    lastModifiedById?: string
  ) {
    if (!lastModifiedById) {
      lastModifiedById = this.userAuth0Service.loginedUserId ?? 'system';
    }

    let updateExpression = 'set ';
    const expressionAttributeNames = {};
    const expressionAttributeValues = {
      ':oldVersion': curVersion,
      ':newVersion': Id.uuid.generateInBase62(),
      ':lastModifiedById': lastModifiedById,
      ':lastModifiedTimeStr': DateTime.utc().toISO(),
    };

    const removeAttributeList = [];

    attributeNameAndValue.forEach((value, key) => {
      if (value === undefined || value === null) {
        if (!dynamoReservedWordSet.has(key.toUpperCase())) {
          removeAttributeList.push(key);
        } else {
          removeAttributeList.push(`#${key}1`);
          expressionAttributeNames[`#${key}1`] = key;
        }
      } else {
        if (dynamoReservedWordSet.has(key.toUpperCase())) {
          updateExpression += `#${key}1=:${key},`;
          expressionAttributeNames[`#${key}1`] = key;
        } else {
          updateExpression += `${key}=:${key},`;
        }

        if (key !== 'version') {
          expressionAttributeValues[`:${key}`] = value;
        }
      }
    });

    updateExpression += `version=:newVersion, lastModifiedById=:lastModifiedById, lastModifiedTimeStr=:lastModifiedTimeStr`;

    if (removeAttributeList.length > 0) {
      updateExpression += ` REMOVE ${removeAttributeList.join(',')}`;
    }

    let params;

    const keyParams = { id };

    if (rangeKey) {
      keyParams[rangeKey] = rangeValue;
    }

    if (!isEmpty(expressionAttributeNames)) {
      params = {
        TableName: tableName,
        Key: keyParams,
        UpdateExpression: updateExpression,
        ConditionExpression: conditionExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      };
    } else {
      params = {
        TableName: tableName,
        Key: keyParams,
        UpdateExpression: updateExpression,
        ConditionExpression: conditionExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      };
    }
    const data = await this.dynamoNativeService.update(params);
    return data.Attributes as any as AbstractBackend;
  }

  @monitorExecution()
  async deleteItem(tableName: string, item: { id: string; sk?: string; sortKey?: string }) {
    const request = {
      TableName: tableName,
      Key: {
        id: item.id,
        sk: undefined,
        sortKey: undefined,
      } as any,
      ReturnValues: 'ALL_OLD',
    };

    if (item.sk) {
      request.Key.sk = item.sk;
    }

    if (item.sortKey) {
      request.Key.sortKey = item.sortKey;
    }

    const data = await this.dynamoNativeService.delete(request);
    return data.Attributes as any as AbstractBackend;
  }

  @monitorExecution()
  async deleteMyItem(tableName: string, item: AbstractBackend) {
    const data = await this.dynamoNativeService.delete({
      TableName: tableName,
      Key: {
        id: item.id,
      } as any,
      ConditionExpression: 'createdById = :createdById AND id = :id1',
      ExpressionAttributeValues: {
        ':createdById': this.userAuth0Service.loginedUserId,
        ':id1': item.id,
      } as any,
      ReturnValues: 'ALL_OLD',
    });
    return data.Attributes as any as AbstractBackend;
  }
}

export interface ModifyListInput {
  addList?: {
    id?: string;
    sk?: string;
    sortKey?: string;
    createdById?: string;
    createdTimeStr?: string;
  }[];
  updateList?: {
    id: string;
    sk?: string;
    sortKey?: string;
    lastModifiedById?: string;
    lastModifiedTimeStr?: string;
    version: string;
  }[];
  deleteList?: { id: string }[];
}

export interface ModifyListInputConfig {
  add?: {
    createdById?: string;
    createdTimeStr?: string;
    useSelfCreatedTimeStr?: boolean;
  };
  update?: {
    lastModifiedById?: string;
    lastModifiedTimeStr?: string;
    notVerifyVersion?: boolean;
    isModifiedBySystem?: boolean;
  };
}

/*
    Demo params:
    const params = {
    TableName: tableName,
    Key: {
        "id": item.id
    },
    UpdateExpression: `set  #name1 = :name,
                            imageUrl = :imageUrl,
                            top=:top,
                            #left1=:left,
                            width=:width,
                            height=:height,
                            version=:newVersion,
                            #no1=:no`,
    ConditionExpression: "version = :oldVersion",
    ExpressionAttributeNames: {
        "#name1": "name",
        "#left1": "left",
        "#no1": "no"
    },
    ExpressionAttributeValues: {
        ":name": device.name,
        ":imageUrl": device.imageUrl,
        ":top": device.top,
        ":left": device.left,
        ":width": device.width,
        ":height": device.height,
        ":no": device.no,
        ":oldVersion": device.version,
        ":newVersion": uuid.v4()
    },
    ReturnValues: "ALL_NEW"
};
*/
