import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { PopupLoginOptions } from '@auth0/auth0-spa-js';
import * as Rx from 'rxjs';
import { of } from 'rxjs';
import * as RxOps from 'rxjs/operators';
import { distinctUntilChanged, first, mergeMap } from 'rxjs/operators';
import { ResourceName } from '../../../../../backend/src/core/resource-name';
import {
  GrantGooglePermissionRequest,
  UserAuth0Gate,
} from '../../../../../backend/src/core/user/auth0/user-auth0.gate';
import { Auth0ClientErrors } from '../../../../../frontend/src/app/core/auth/auth0.error';
import { LambdaService } from '../../shared/core/lambda.service';
import { GlobalError } from '../../shared/global-error/global-error';

import { ConnectionType } from '../user/user-auth0';
import { LoginProduct, User } from './user';

@Injectable({
  providedIn: 'root',
})
export class LoginedUserService {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private lambdaService: LambdaService,
    private authService: AuthService,
    @Inject(DOCUMENT) public document: Document
  ) {}

  user: User = {} as User;

  redirectUrl?: string;
  errorMessage?: string;

  get isAuthenticated$() {
    return this.authService.isAuthenticated$;
  }

  get hasGoogleAccount() {
    return (
      this.user.userAuth0?.connection === ConnectionType.google ||
      this.user.userAuth0?.identities.some((c) => c.connection === ConnectionType.google)
    );
  }

  get calendarGoogleList() {
    return [];
    //return this.user.userAuth0?.user_metadata?.calendar_google_list;
  }

  signOut(returnTo?: string) {
    if (!returnTo) {
      this.authService.logout({ logoutParams: { returnTo: document.location.origin } });
    } else {
      this.authService.logout({ logoutParams: { returnTo } });
    }
  }

  socialSignIn$(
    options: PopupLoginOptions = {},
    connection_scope?: string,
    source?: LoginSource,
    product?: LoginProduct
  ) {
    options.authorizationParams = {};

    options.authorizationParams['access_type'] = 'offline';
    options.authorizationParams['approval_prompt'] = 'force';

    if (connection_scope) {
      options.authorizationParams.scope = connection_scope;
    }

    if (source === LoginSource.google) {
      options.authorizationParams.connection = 'google-oauth2';
    }

    return this.authService.loginWithPopup(options).pipe(
      RxOps.catchError((e: Error) => {
        if ((e.message ?? '').includes('Popup closed')) {
          return Rx.throwError(() => new GlobalError({ ...Auth0ClientErrors.loginPopupClosed, causedBy: e }));
        }

        return Rx.throwError(() => new GlobalError({ ...Auth0ClientErrors.unexpectedLoginPopupError, causedBy: e }));
      }),
      mergeMap((e) => {
        return this.authService.user$.pipe(distinctUntilChanged()).pipe(
          mergeMap((user) => {
            if (!user) {
              return Rx.throwError(() => new Error('User not found'));
            }

            return this.lambdaService
              .run$(ResourceName.userAuth0, UserAuth0Gate.actions.getUserCount, {
                email: user.email,
              })
              .pipe(
                mergeMap((response) => {
                  const count = response.count as number;

                  if (count > 1) {
                    // [potato:544]
                    // The email count is more than 1, the user needs to link the account. -> link account.
                    window.location.href = '/app';
                  }

                  if (source === LoginSource.google) {
                    const request: GrantGooglePermissionRequest = {
                      loginProduct: product!,
                    };

                    return this.lambdaService.run$(
                      ResourceName.userAuth0,
                      UserAuth0Gate.actions.grantGooglePermission,
                      request
                    );
                  } else {
                    return of(undefined);
                  }
                })
              );
          })
        );
      })
    );
  }

  socialSignIn(
    options: PopupLoginOptions = {},
    connection_scope?: string,
    source?: LoginSource,
    product?: LoginProduct
  ) {
    const state = this.route.snapshot.queryParamMap.get('state');

    options.authorizationParams = {};

    try {
      options.authorizationParams['access_type'] = 'offline';
      options.authorizationParams['approval_prompt'] = 'force';

      if (connection_scope) {
        options.authorizationParams.scope = connection_scope;
      }

      if (source === LoginSource.google) {
        options.authorizationParams.connection = 'google-oauth2';
      }

      /*
      https://www.googleapis.com/auth/calendar.calendarlist.readonly
      https://www.googleapis.com/auth/calendar.events.owned
      */

      /*
      options.connection_scope =
        'openid,https://www.googleapis.com/auth/calendar.app.created,https://www.googleapis.com/auth/calendar.calendarlist.readonly,https://www.googleapis.com/auth/calendar.events.freebusy,https://www.googleapis.com/auth/calendar.events.public.readonly,https://www.googleapis.com/auth/calendar.freebusy,https://www.googleapis.com/auth/drive.file,https://www.googleapis.com/auth/drive.appdata,https://www.googleapis.com/auth/drive.install';
      */
      this.authService
        .loginWithPopup(options)
        .pipe(
          RxOps.catchError((error) => {
            return of('stop');
          }),
          first()
        )
        .subscribe((e) => {
          if (e === 'stop') {
            return;
          }
          // .loginWithRedirect({ appState: { target: `/${environment.auth0.redirectUrl}` } }).subscribe(() => {
          this.authService.user$.pipe(distinctUntilChanged(), first()).subscribe((user) => {
            if (user) {
              this.lambdaService
                .run$(ResourceName.userAuth0, UserAuth0Gate.actions.getUserCount, {
                  email: user.email,
                })
                .pipe(first())
                .subscribe((response) => {
                  const count = response.count as number;

                  if (count > 1) {
                    // [potato:544]
                    // The email count is more than 1, the user needs to link the account. -> link account.
                    window.location.href = '/app';
                  }

                  if (source === LoginSource.google) {
                    const request: GrantGooglePermissionRequest = {
                      loginProduct: product!,
                    };

                    this.lambdaService
                      .run$(ResourceName.userAuth0, UserAuth0Gate.actions.grantGooglePermission, request)
                      .pipe(first())
                      .subscribe();
                  }
                });
            } else {
              window.location.href = '/app';
            }
          });
          if (!state) {
            this.router.navigate(['/app']);
          } else {
            this.router.navigate([state]);
          }
        });
    } catch (e) {
      window.location.href = '/app';
    }
  }
}

export enum LoginSource {
  google = 'google',
}
