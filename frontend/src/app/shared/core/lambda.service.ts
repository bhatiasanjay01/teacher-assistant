import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { VERSION } from '../../../version';
import {
  AbstractBackend,
  ModifiedBackendItems,
} from '../../core/abstract-contract';
import { ObjectUtils } from '../utils/object-utils';
import { HttpOptions } from './http-options';

@Injectable({
  providedIn: 'root',
})
export class LambdaService {
  private loadingSubject = new BehaviorSubject<boolean>(false);

  private _currentResourceName?: string;
  private readonly _url = environment.lambdaWebsiteUrl;
  private readonly _publicUrl = environment.lambdaWebsitePublicUrl;
  private readonly _openaiUrl = environment.openaiUrl;

  get isLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  get isLoading() {
    return this.loadingSubject.value;
  }

  get currentResourceName(): string | undefined {
    return this._currentResourceName;
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  run$(
    resource: string,
    action: string,
    payload?: AbstractBackend | AbstractBackend[] | ModifiedBackendItems | any,
    config?: {
      notChangeLoadingStatus?: boolean;
      isPublicUrl?: boolean;
      isOpenaiPrivate?: boolean;
    }
  ): Observable<any> {
    this._currentResourceName = resource;

    const headers = {
      resource,
      action,
      clientVersion: VERSION,
      'accept-encoding': 'gzip',
    };

    this.removePayloadUnusedFields(payload);

    let urlPrefix = config?.isPublicUrl ? this._publicUrl : this._url;

    if (config?.isOpenaiPrivate) {
      urlPrefix = environment.openaiUrl;
    }

    const url = `${urlPrefix}?resourceName=${resource}&action=${action}&hasPayload=${!!payload}`;

    let tempConfig = config;
    // if (this._currentResourceName === ResourceName.visited) {
    //   tempConfig = {
    //     ...config,
    //     notChangeLoadingStatus: true,
    //   };
    // }
    return this.callWebsiteLambda$(url, headers, payload, tempConfig);
  }

  private callWebsiteLambda$(
    url: string,
    headers: any,
    payload: any,
    config?: {
      notChangeLoadingStatus?: boolean;
      isPublicUrl?: boolean;
    }
  ): Observable<any> {
    if (!!config?.isPublicUrl) {
      // No accessToken
      return this.callWebsiteLambdaUrl$(url, headers, payload, config);
    }

    if (environment.isE2e) {
      const cypressAccessToken =
        window.localStorage.getItem('CypressAccessToken');

      if (cypressAccessToken) {
        environment.accessToken = cypressAccessToken;
      }

      return this.callWebsiteLambdaUrl$(url, headers, payload, {
        ...config,
        accessToken: environment.accessToken,
      });
    }

    return this.authService.getAccessTokenSilently().pipe(
      mergeMap((accessToken) => {
        return this.callWebsiteLambdaUrl$(url, headers, payload, {
          ...config,
          accessToken,
        });
      })
    );
  }

  private callWebsiteLambdaUrl$(
    url: string,
    headers: any,
    payload: any,
    config?: {
      accessToken?: string;
      notChangeLoadingStatus?: boolean;
      isPublicUrl?: boolean;
    }
  ) {
    if (!config?.notChangeLoadingStatus) {
      this.loadingSubject.next(true);
    }

    const body = { headers, payload };

    const httpOptions = HttpOptions.getOptions();

    if (config?.accessToken) {
      httpOptions.headers = httpOptions.headers.set(
        'Authorization',
        'Bearer ' + config.accessToken
      );
    }
    return this.http.post<any>(url, JSON.stringify(body), httpOptions).pipe(
      tap((e) => {
        this.ngZone.runTask(() => {
          this.loadingSubject.next(false);
          this._currentResourceName = undefined;
        });
      }),
      catchError((err) => {
        this.loadingSubject.next(false);
        this._currentResourceName = undefined;
        return throwError(() => err);
      })
    );
  }

  removePayloadUnusedFields(
    payload?: AbstractBackend | AbstractBackend[] | ModifiedBackendItems
  ): void {
    if (!payload) {
      return;
    }

    ObjectUtils.removeUndefined(payload);

    // Remove unused fields
    if (payload instanceof Array) {
      payload.forEach((onePayload) => {
        this.removeBackendItemUnusedFields(onePayload);
      });
    } else if ((payload as ModifiedBackendItems).addedAllBackendItems) {
      const modifiedAllItems = payload as ModifiedBackendItems;
      modifiedAllItems.addedAllBackendItems.forEach((onePayload) =>
        this.removeBackendItemUnusedFields(onePayload)
      );
      modifiedAllItems.updatedAllBackendItems.forEach((onePayload) =>
        this.removeBackendItemUnusedFields(onePayload)
      );
    } else {
      this.removeBackendItemUnusedFields(payload as AbstractBackend);
    }
  }

  private removeBackendItemUnusedFields(backend: AbstractBackend): void {
    if (!backend || !environment.isConnectToBackend) {
      return;
    }
    if (backend.lastModifiedTimeStr) {
      backend.lastModifiedTimeStr = undefined;

      backend.createdById = undefined;
      (backend as any)['createdBy'] = undefined;
      (backend as any)['lastModifiedBy'] = undefined;
      backend.lastModifiedById = undefined;
    }
  }
}
