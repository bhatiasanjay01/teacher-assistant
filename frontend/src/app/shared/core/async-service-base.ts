import { HttpClient } from '@angular/common/http';
import { DateTime } from 'luxon';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BasicAction } from '../../../../../backend/src/core/basic-action';
import { Id } from '../../../../../frontend/src/app/shared/id/id';
import { environment } from '../../../environments/environment';
import { AbstractBackend, ModifiedBackendItems } from '../../core/abstract-contract';
import { LoginedUserService } from '../../core/auth/logined-user.service';
import { AbstractFrontend, ModifiedAllItems } from './abstract-prototype-object';
import { LambdaService } from './lambda.service';
import { ReadonlyAsyncServiceBase } from './readonly-async-service-base';

export abstract class AsyncServiceBase<Backend extends AbstractBackend, Frontend extends AbstractFrontend> extends ReadonlyAsyncServiceBase<
  Backend,
  Frontend
> {
  constructor(
    protected override _http: HttpClient,
    protected override _lambdaService: LambdaService,
    protected _loginedUserService: LoginedUserService,
    resourceName: string,
    isPublic = false,
    notUpdateFromBackendSet = new Set<string>()
  ) {
    super(_http, _lambdaService, resourceName, isPublic, notUpdateFromBackendSet);
  }

  /**
   * Used to post a new item list to the backend.
   */
  abstract convertFromFrontendToBackend(frontend: Partial<Frontend>): Backend;

  abstract afterAddItem(frontend: Frontend): void;
  abstract afterDeleteItem(frontend: Frontend): void;

  addItemPrivate$(item: Partial<Frontend>, callLambda = true, id?: string): Observable<Frontend> {
    if (!this._itemOrItemList) {
      this._itemOrItemList = [];
    }

    if (!(this._itemOrItemList instanceof Array)) {
      throw new Error('Single item could not add item.');
    }

    const backend = this.convertFromFrontendToBackend(item);

    if (callLambda && environment.isConnectToBackend) {
      return this._lambdaService.run$(this._resourceName, BasicAction.add, backend).pipe(
        map((data) => {
          return this.addBackendToService(data);
        }),
        catchError(this.handleError$<Frontend>('addItem'))
      );
    } else if (!callLambda && environment.isConnectToBackend) {
      return of(backend).pipe(
        map((data) => {
          return this.addBackendToService(data);
        }),
        catchError(this.handleError$<Frontend>('addItem'))
      );
    } else {
      backend.id = id ? id : Id.autoIncrement.generate();
      backend.lastModifiedById = this._loginedUserService.user.userAuth0.id;
      backend.createdById = this._loginedUserService.user.userAuth0.id;
      backend.createdTimeStr = DateTime.utc().toISO();
      backend.lastModifiedTimeStr = DateTime.utc().toISO();

      return this._http.post<Backend>(`api/${this._resourceName}`, backend, this._httpOptions).pipe(
        map((data) => {
          return this.addBackendToService(data);
        }),
        catchError(this.handleError$<Frontend>('addItem'))
      );
    }
  }

  updateItemPrivate$(
    frontend: Frontend,
    updateAction: string = BasicAction.updateMy,
    callLambda = true,
    notChangeLoadingStatus = false
  ): Observable<Frontend> {
    const backend = this.convertFromFrontendToBackend(frontend);
    if (callLambda && environment.isConnectToBackend) {
      return this.updateDataToService$(this._lambdaService.run$(this._resourceName, updateAction, backend, { notChangeLoadingStatus }));
    } else if (!callLambda && environment.isConnectToBackend) {
      return this.updateDataToService$(of(backend));
    } else {
      backend.lastModifiedById = frontend.lastModifiedBy?.id;
      backend.lastModifiedTimeStr = DateTime.utc().toISO();
      return this.updateDataToService$(
        this._http.put<Backend>(`api/${this._resourceName}`, backend, this._httpOptions).pipe(map(() => backend))
      );
    }
  }

  deleteItemPrivate$(
    frontend: Frontend,
    deleteAction: string = BasicAction.deleteMy,
    callLambda = true,
    resourceName?: string
  ): Observable<Frontend> {
    const backend = this.convertFromFrontendToBackend(frontend);

    let currentResourceName = resourceName;
    if (!resourceName) {
      currentResourceName = this._resourceName;
    }

    if (callLambda && environment.isConnectToBackend) {
      return this._lambdaService.run$(currentResourceName!, deleteAction, backend).pipe(
        map((data) => {
          return this.deleteBackendToServicePrivate(data!)!;
        })
      );
    } else if (!callLambda && environment.isConnectToBackend) {
      return of(backend).pipe(
        map((data) => {
          return this.deleteBackendToServicePrivate(data)!;
        })
      );
    } else {
      const url = `${`api/${currentResourceName}`}/${frontend.id}`;
      return this._http.delete<Backend>(url, this._httpOptions).pipe(
        map(() => {
          return this.deleteBackendToServicePrivate(backend)!;
        })
      );
    }
  }

  modifyAllItemsOnFrontend$(modifiedAllItems: ModifiedAllItems<Frontend>): Observable<any> {
    const { addedAllItems, updatedAllItems, deletedAllItems } = modifiedAllItems;
    const addedObervables = addedAllItems.map((frontend) => this.addItemPrivate$(frontend, false, frontend.id));
    const updatedObervables = updatedAllItems.map((frontend) => this.updateItemPrivate$(frontend, '', false));
    const deletedObervables = deletedAllItems.map((frontend) => this.deleteItemPrivate$(frontend, '', false));

    return forkJoin([...addedObervables, ...updatedObervables, ...deletedObervables]);
  }

  convertAllItemsFromBackend(modifiedBackendItems: ModifiedBackendItems): ModifiedAllItems<Frontend> {
    const addedAllItems = modifiedBackendItems.addedAllBackendItems.map((c) => this.convertFromBackendToFrontend(c as Backend));

    const updatedAllItems = modifiedBackendItems.updatedAllBackendItems.map((c) => this.convertFromBackendToFrontend(c as Backend));

    const deletedAllItems = modifiedBackendItems.deletedAllBackendItemIds.map((c) => this.getItem(c)!);

    return {
      getAllItems: [],
      addedAllItems,
      updatedAllItems,
      deletedAllItems,
    };
  }

  private addBackendToService(backend: Backend): Frontend {
    const item = this.convertFromBackendToFrontend(backend);
    if (item && this._itemOrItemList instanceof Array) {
      this._itemOrItemList.push(item);
      this._idAndItem.set(item.id, item);
    }
    this.afterAddItem(item);
    return item;
  }

  deleteBackendToServicePrivate(idItem: { id: string }): Frontend | null {
    let managedFrontend: Frontend;
    if (this._itemOrItemList instanceof Array) {
      managedFrontend = this.getItem(idItem.id)!;
    } else {
      managedFrontend = this._itemOrItemList as Frontend;
    }

    if (!managedFrontend) {
      return null;
    }

    if (this._itemOrItemList instanceof Array) {
      const index = this._itemOrItemList.indexOf(managedFrontend);
      this._itemOrItemList.splice(index, 1);
      this._idAndItem.delete(managedFrontend.id);
    }
    this.afterDeleteItem(managedFrontend);
    return managedFrontend;
  }

  /*
   * MARK - for frontend temporary changes
   */
  addItemInFrontend(item: Frontend): Frontend {
    item.isFrontendTemp = true;
    (item as any)['id'] = Id.autoIncrement.generate();
    const backendItem = this.convertFromFrontendToBackend(item);
    this.setOneItemToCacheData(backendItem);
    this.setData([backendItem], false);
    return this.getItem(item.id) as Frontend;
  }

  deleteItemInFrontend(item: Frontend) {
    this.deleteItemPrivate$(item, BasicAction.delete, false);
  }
}
