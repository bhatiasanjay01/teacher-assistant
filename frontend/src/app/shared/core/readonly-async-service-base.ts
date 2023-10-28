import { HttpClient } from '@angular/common/http';
import { DateTime } from 'luxon';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BasicAction } from '../../../../../backend/src/core/basic-action';
import { environment } from '../../../environments/environment';
import { AbstractBackend } from '../../core/abstract-contract';
import { GlobalJson } from '../global-json/global-json';
import { AbstractFrontend } from './abstract-prototype-object';
import { HttpOptions } from './http-options';
import { LambdaService } from './lambda.service';

declare const ga: any;

export enum DynamoDBException {
  conditionalCheckFailedException = 'ConditionalCheckFailedException',
}

// LAZY: Need to solve the out of date data ------- need to refresh based on the different services?
export abstract class ReadonlyAsyncServiceBase<
  Backend extends AbstractBackend,
  Frontend extends AbstractFrontend
> {
  private _needRefresh = true;
  protected _itemOrItemList?:
    | Frontend[]
    | Frontend
    | undefined
    | (Frontend | undefined)[];
  protected _idAndItem = new Map<string, Frontend>();
  protected _resourceName = '';
  protected _httpOptions?: HttpOptions;

  protected _getAction?: string;
  protected _payload: any;

  // redundant to speed up the compare with the payload input.
  protected _payloadStr?: string;

  protected _isPublic?: boolean;

  protected _notUpdateFromBackendSet: Set<string>;

  /**
   * Creates an instance of ReadonlyAsyncServiceBase.
   *
   * _http
   * @param  prefix the url prefix
   * @param  resourceName Lambda function name
   */
  constructor(
    protected _http: HttpClient,
    protected _lambdaService: LambdaService,
    resourceName: string,
    isPublic = false,
    notUpdateFromBackendSet = new Set<string>()
  ) {
    this._resourceName = resourceName;
    this._isPublic = isPublic;
    this._notUpdateFromBackendSet = notUpdateFromBackendSet;
  }

  /**
   * Used to load from backend.
   * For example: convert startStr: string to startTime: DateTime
   */
  abstract convertFromBackendToFrontend(backend: Backend): Frontend;

  /**
   * clean the data before refresh() happens.
   */
  abstract cleanTempData(payload?: any): void;

  cleanCache() {
    this._itemOrItemList = undefined;
    this._idAndItem = new Map<string, Frontend>();
    this.cleanTempData();
  }

  set needRefresh(value: boolean) {
    this._needRefresh = value;
  }

  getItemOrItemListByAction$(getAction: string, payload: any | null = null) {
    const payloadStr = JSON.stringify(payload);

    if (
      this._needRefresh ||
      this._getAction !== getAction ||
      payloadStr !== this._payloadStr
    ) {
      this._getAction = getAction;
      this._payload = payload;
      this._payloadStr = payloadStr;
      return this.refreshBase$(payload);
    } else {
      return of(this._itemOrItemList);
    }
  }

  getItemByAction$(
    getAction: string = BasicAction.getItem,
    getRequest?: { id?: string },
    config?: {
      resourceName?: string;
      noNeedToChangeLoadingStatus?: boolean;
      forceToLoadFromBackend?: boolean;
      isPublic?: boolean;
    }
  ): Observable<Frontend | undefined> {
    this._isPublic = config?.isPublic;
    const resourceName = config?.resourceName ?? this._resourceName;
    if (
      getRequest?.id &&
      !config?.forceToLoadFromBackend &&
      this._idAndItem.get(getRequest.id)
    ) {
      return of(this._idAndItem.get(getRequest.id));
    } else {
      if (environment.isConnectToBackend) {
        return this._lambdaService
          .run$(resourceName, getAction, getRequest, {
            notChangeLoadingStatus: config?.noNeedToChangeLoadingStatus,
            isPublicUrl: this._isPublic,
          })
          .pipe(
            map((response) => {
              return this.setOneItemToCacheData(response, true);
            })
          );
      } else {
        const url = getRequest?.id
          ? `api/${resourceName}/${getRequest.id}`
          : `api/${resourceName}/${resourceName}`;
        return this._http.get<Backend[] | Backend>(url, this._httpOptions).pipe(
          map((data) => {
            return this.setOneItemToCacheData(data as Backend);
          })
        );
      }
    }
  }

  getItem(id?: string): Frontend | undefined {
    if (!id) {
      return undefined;
    }
    return this._idAndItem.get(id);
  }

  getItemWithoutCache$(
    id: string,
    getAction: string = BasicAction.getItem
  ): Observable<Frontend | undefined> {
    if (!environment.isConnectToBackend) return of(this.getItem(id));
    return this._lambdaService
      .run$(this._resourceName, getAction, id, { isPublicUrl: this._isPublic })
      .pipe(
        map((c) => {
          if (this.getItem(id)) {
            this.updateFrontendFromBackend(this.getItem(id), c, true);
            return this.getItem(id);
          }

          return this.convertFromBackendToFrontend(c);
        })
      );
  }

  getFirstOrSingleItem(): Frontend | undefined {
    if (this._itemOrItemList instanceof Array) {
      if (this._itemOrItemList.length === 0) {
        return undefined;
      }
      return this._itemOrItemList[0];
    } else {
      return this._itemOrItemList;
    }
  }

  private refreshBase$(payload?: any) {
    return this.refresh$(payload);
  }

  private getItemList$(
    getAction: null | string = null,
    payload: null | any = null,
    needToChangeLoadingStatus = true
  ) {
    if (environment.isConnectToBackend) {
      if (!getAction) {
        return of(undefined);
      }
      return this._lambdaService.run$(this._resourceName, getAction, payload, {
        notChangeLoadingStatus: !needToChangeLoadingStatus,
        isPublicUrl: this._isPublic,
      });
    } else {
      let filterStr = '';
      payload &&
        Reflect.ownKeys(payload).forEach((key) => {
          filterStr += `&${String(key)}=${encodeURIComponent(payload[key])}`;
        });
      filterStr = filterStr ? `?${filterStr}` : '';
      return this._http
        .get<Backend[] | Backend>(
          `api/${this._resourceName}${filterStr}`,
          this._httpOptions
        )
        .pipe(
          map((data) => {
            if (!data) {
              return [];
            } else {
              return data;
            }
          })
        );
    }
  }

  getItemOrItemListWithNoCache$(
    getAction: string,
    payload?: any,
    needToChangeLoadingStatus = true
  ) {
    return this.getItemList$(
      getAction,
      payload,
      needToChangeLoadingStatus
    ).pipe(
      map((data) => {
        return this.setData(data, false);
      })
    );
  }

  removeFrontendCacheById(id: string) {
    if (this._itemOrItemList instanceof Array) {
      const index = this._itemOrItemList.findIndex((c) => c?.id);
      this._itemOrItemList.splice(index, 1);
      this._idAndItem.delete(id);
    }
  }

  refresh$(payload?: any) {
    this.cleanTempData(payload);
    this._needRefresh = true;
    return this.getItemList$(this._getAction, this._payload).pipe(
      map((data) => {
        return this.setData(data, true);
      })
    );
  }

  refreshItem$(item: Frontend) {
    if (!environment.isConnectToBackend) return of(item);
    return this.updateDataToService$(
      this._lambdaService.run$(
        this._resourceName,
        BasicAction.getItem,
        item.id,
        { isPublicUrl: this._isPublic }
      )
    );
  }

  protected updateFrontendFromBackend(
    frontend?: Frontend,
    backend?: Backend,
    forceUpdate = false
  ): void {
    if (!frontend || !backend) {
      return;
    }

    if (!forceUpdate && !this.needToReplaceFrontend(frontend, backend)) {
      return;
    }

    const newFrontend = this.convertFromBackendToFrontend(backend);
    getUpdatedOldObj(frontend, newFrontend, this._notUpdateFromBackendSet);
  }

  protected updateDataToService$(observable: Observable<Backend>) {
    return observable.pipe(
      map((backend) => {
        if (backend && backend.errorType) {
          if (
            backend.errorType ===
            DynamoDBException.conditionalCheckFailedException
          ) {
            // someone changes this before I change.
            throw new Error(DynamoDBException.conditionalCheckFailedException);
          }
          throw new Error('Other reasons');
        } else {
          let managedFrontend;
          if (this._itemOrItemList instanceof Array) {
            managedFrontend = this.getItem(backend.id)!;
          } else {
            managedFrontend = this._itemOrItemList as Frontend;
          }

          this.updateFrontendFromBackend(managedFrontend, backend, true);
          this.afterUpdateItem(managedFrontend!);
          return managedFrontend;
        }
      }),
      catchError(this.handleError$<Frontend>('updateItem'))
    );
  }

  private needToReplaceFrontend(
    frontend: Frontend | undefined,
    backend: Backend
  ) {
    if (backend.version && frontend?.version) {
      if (backend.version === frontend?.version) {
        return false;
      }
    }
    return true;
  }

  abstract afterUpdateItem(frontend: Frontend): void;

  protected setOneItemToCacheData(backend?: Backend, forceUpdate = false) {
    if (!backend) {
      return undefined;
    }

    if (this._idAndItem.has(backend.id)) {
      const frontend = this._idAndItem.get(backend.id);

      this.updateFrontendFromBackend(frontend, backend, forceUpdate);
      const b = this._idAndItem.get(backend.id);
      return b;
    }

    const item = this.convertFromBackendToFrontend(backend);
    if (item) {
      if (!this._itemOrItemList) {
        this._itemOrItemList = [];
      }
      (this._itemOrItemList as Array<Frontend>).push(item);
      this._idAndItem.set(backend.id, item);
    }

    this.handleSuccessResponse();
    return item;
  }

  setData(response: Backend[] | Backend, needReplaceItemList = true) {
    if (!response) {
      return undefined;
    }

    if (needReplaceItemList) {
      this._idAndItem.clear();
    }

    let result: Frontend[] | Frontend | undefined | (Frontend | undefined)[];

    if (response instanceof Array) {
      const backends = response as Backend[];

      result = backends.map((backend) => {
        if (this._idAndItem.has(backend.id)) {
          const frontend = this._idAndItem.get(backend.id);

          if (!this.needToReplaceFrontend(frontend, backend)) {
            return frontend;
          }
        }

        const item = this.convertFromBackendToFrontend(backend);

        if (item) {
          if (!needReplaceItemList && !this._idAndItem.has(item.id)) {
            if (!this._itemOrItemList) {
              this._itemOrItemList = [];
            }
            (this._itemOrItemList as any).push(item);
          }
          this._idAndItem.set(item.id, item);
        }

        return item;
      });
    } else {
      const backend = response as Backend;

      if (backend) {
        if (
          this.needToReplaceFrontend(this._itemOrItemList as Frontend, backend)
        ) {
          result = this.convertFromBackendToFrontend(backend);
        } else {
          result = this._itemOrItemList;
        }
      }
    }

    if (needReplaceItemList) {
      this._itemOrItemList = result;
    }

    this.handleSuccessResponse();
    return result;
  }

  private handleSuccessResponse(): void {
    this._needRefresh = false;
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  protected handleError$<ErrorT>(
    operation = 'operation',
    result?: ErrorT
  ): (error: any) => Observable<ErrorT> {
    return (error: any): Observable<ErrorT> => {
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as ErrorT);
    };
  }
}

/**
 * Update the nested object.
 * 1. Only can update the nested array item with the id.
 * 2. Compare with GlobalJson.toJson to get the deep equal of the object.
 * @param newObj
 * @param oldObj
 * @returns
 */
export function getUpdatedOldObj(
  oldObj: any,
  newObj: any,
  notUpdateFromBackendSet: Set<string>
) {
  if (typeof oldObj !== 'object' || typeof newObj !== 'object') {
    return newObj;
  }

  if (!oldObj) {
    return newObj;
  }

  if (!newObj) {
    return newObj;
  }

  if (
    oldObj === newObj ||
    GlobalJson.toJson(oldObj) === GlobalJson.toJson(newObj)
  ) {
    return oldObj;
  }

  const ownKeys = Reflect.ownKeys(newObj);
  const oldOwnKeys = Reflect.ownKeys(oldObj);

  for (const oldKey of oldOwnKeys) {
    if (!notUpdateFromBackendSet.has(oldKey.toString())) {
      if (newObj[oldKey] === null || newObj[oldKey] === undefined) {
        delete oldObj[oldKey];
      }
    }
  }

  for (const key of ownKeys) {
    if (notUpdateFromBackendSet.has(key as string)) {
      continue;
    }

    if (newObj[key] instanceof Map) {
      const refOldMap = (oldObj[key] as Map<any, any>) ?? new Map();
      const oldMap = new Map(refOldMap ?? new Map());
      const newMap = newObj[key] as Map<any, any>;

      for (const newMapItem of newMap) {
        if (!newMapItem) {
          continue;
        }

        const newKey = newMapItem[0];
        const newValue = newMapItem[1];

        const oldValue = oldMap.get(newKey);
        if (oldValue) {
          if (
            newValue === oldValue ||
            GlobalJson.toJson(newValue) === GlobalJson.toJson(oldValue)
          ) {
            continue;
          } else {
            const updatedOldObj = getUpdatedOldObj(
              oldValue,
              newValue,
              notUpdateFromBackendSet
            );
            refOldMap.set(newKey, updatedOldObj);
          }
        } else {
          refOldMap.set(newKey, newValue);
        }
      }
      Reflect.set(oldObj, key, refOldMap);
    } else if (newObj[key] instanceof Set) {
      const refOldSet = (oldObj[key] as Set<any>) ?? new Set();
      const oldSet = new Set(refOldSet ?? new Set());

      const newSet = newObj[key] as Set<any>;

      for (const newSetItem of newSet) {
        if (!newSetItem) {
          continue;
        }

        let oldTempItem;
        let needGoDeep = true;

        for (const oldSetItem of oldSet) {
          if (!oldSetItem) {
            needGoDeep = false;
            oldTempItem = undefined;
            continue;
          }

          if (
            oldSetItem === newSetItem ||
            GlobalJson.toJson(oldSetItem) === GlobalJson.toJson(newSetItem)
          ) {
            needGoDeep = false;
            oldTempItem = oldSetItem;
            break;
          }

          if (
            (oldSetItem as any).id &&
            (oldSetItem as any).id === (newSetItem as any).id
          ) {
            needGoDeep = true;
            oldTempItem = oldSetItem;
            break;
          }
        }

        let updatedOldObj;

        if (needGoDeep) {
          updatedOldObj = getUpdatedOldObj(
            oldTempItem,
            newSetItem,
            notUpdateFromBackendSet
          );
        } else {
          updatedOldObj = oldTempItem;
        }
        refOldSet.add(updatedOldObj);
      }

      Reflect.set(oldObj, key, refOldSet);
    } else if (newObj[key] instanceof Array) {
      const refOldArray = (oldObj[key] as Array<any>) ?? [];
      const oldArray = refOldArray?.splice(0, refOldArray.length) ?? [];

      const newArray = newObj[key] as Array<any>;

      for (const newArrayItem of newArray) {
        if (!newArrayItem) {
          continue;
        }

        let oldTempItem;
        let needGoDeep = true;

        for (const oldArrayItem of oldArray) {
          if (!oldArrayItem) {
            needGoDeep = false;
            oldTempItem = oldArrayItem;
            continue;
          }

          if (
            oldArrayItem === newArrayItem ||
            GlobalJson.toJson(oldArrayItem) === GlobalJson.toJson(newArrayItem)
          ) {
            needGoDeep = false;
            oldTempItem = oldArrayItem;
            break;
          }

          if (oldArrayItem.id && oldArrayItem.id === newArrayItem.id) {
            needGoDeep = true;
            oldTempItem = oldArrayItem;
            break;
          }
        }

        let updatedOldObj;

        if (needGoDeep) {
          updatedOldObj = getUpdatedOldObj(
            oldTempItem,
            newArrayItem,
            notUpdateFromBackendSet
          );
        } else {
          updatedOldObj = oldTempItem;
        }
        refOldArray.push(updatedOldObj);
      }

      Reflect.set(oldObj, key, refOldArray);
    } else {
      if (oldObj[key] === null || oldObj[key] === undefined) {
        Reflect.set(oldObj, key, newObj[key]);
      } else if (
        oldObj[key] === newObj[key] ||
        GlobalJson.toJson(oldObj[key]) === GlobalJson.toJson(newObj[key])
      ) {
        // odjObj and newObj are the same. No need to do anything.
      } else if (oldObj[key] instanceof DateTime) {
        // Is singleton, directly replace the whole item.
        Reflect.set(oldObj, key, newObj[key]);
        //
      } else {
        if (oldObj[key].id && oldObj[key].version) {
          // it is the managed backend item, replace the reference.
          Reflect.set(oldObj, key, newObj[key]);
        } else {
          const updatedOldObj = getUpdatedOldObj(
            oldObj[key],
            newObj[key],
            notUpdateFromBackendSet
          );
          Reflect.set(oldObj, key, updatedOldObj);
        }
      }
    }
  }

  return oldObj;
}
