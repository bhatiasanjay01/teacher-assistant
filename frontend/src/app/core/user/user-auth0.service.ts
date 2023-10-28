import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Observable, of } from 'rxjs';
import { catchError, first, tap } from 'rxjs/operators';
import { ResourceName } from '../../../../../backend/src/core/resource-name';
import {
  UnlinkAccountRequest,
  UpdateVerifiedTypeRequest,
  UserAuth0Gate,
} from '../../../../../backend/src/core/user/auth0/user-auth0.gate';
import { environment } from '../../../environments/environment';
import { LambdaService } from '../../shared/core/lambda.service';
import { LoginedUserService } from '../auth/logined-user.service';
import { LinkedAccountBackend, UserAuth0Backend } from './user-auth0';

@Injectable({
  providedIn: 'root',
})
export class UserAuth0Service {
  constructor(
    private loginedUserService: LoginedUserService,
    private lambdaService: LambdaService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  private _resourceName = ResourceName.userAuth0;

  sendVerificationEmail$() {
    return this.lambdaService.run$(this._resourceName, UserAuth0Gate.actions.sendVerificationEmail);
  }

  updateVerifiedType$(reqeust: UpdateVerifiedTypeRequest) {
    return this.lambdaService.run$(this._resourceName, UserAuth0Gate.actions.updateVerifiedType, reqeust);
  }

  getMy$() {
    let observable: Observable<UserAuth0Backend>;

    if (environment.isConnectToBackend) {
      observable = this.lambdaService.run$(this._resourceName, UserAuth0Gate.actions.getMy);
    } else {
      observable = of({} as any);
    }

    return observable.pipe(
      tap((data) => {
        const userAuth0 = data as UserAuth0Backend;
        this.loginedUserService.user.userAuth0 = userAuth0;
      }),
      catchError((err) => {
        console.log('------ err:', err);
        window.location.reload();
        return of(err);
      })
    );
  }

  getUserByEmailFromServer$(email: string): Observable<UserAuth0Backend | undefined> {
    if (environment.isConnectToBackend) {
      return this.lambdaService.run$(this._resourceName, UserAuth0Gate.actions.getByEmail, { email });
    } else {
      return of({} as any);
    }
  }

  grantGooglePermission$() {
    if (environment.isConnectToBackend) {
      return this.lambdaService.run$(this._resourceName, UserAuth0Gate.actions.grantGooglePermission);
    }
    return of(true);
  }

  updateMy$() {
    const user = this.loginedUserService.user.userAuth0;
    if (environment.isConnectToBackend) {
      return this.lambdaService.run$(this._resourceName, UserAuth0Gate.actions.updateMy, user);
    }

    return of(user);
  }

  unlinkAccount$(linkedAccount: LinkedAccountBackend) {
    const user = this.loginedUserService.user.userAuth0;
    const request: UnlinkAccountRequest = {
      primaryUserId: user.id,
      provider: linkedAccount.provider,
      secondaryUserId: linkedAccount.user_id,
    };

    return this.lambdaService.run$(this._resourceName, UserAuth0Gate.actions.unlinkAccount, request);
  }

  linkAccount() {
    this.authService
      .getAccessTokenSilently()
      .pipe(first())
      .subscribe((accessToken) => {
        this.authService.user$.pipe(first()).subscribe((user) => {
          this.authService
            .loginWithPopup({
              authorizationParams: {
                max_age: 0,
                scope: 'openid',
              },
            })
            .pipe(first())
            .subscribe(() => {
              // { __raw: targetUserIdToken, email_verified, email }
              this.authService.idTokenClaims$.pipe(first()).subscribe((data) => {
                if (!data!.email_verified) {
                  // [potato:544]
                  throw new Error(
                    `Account linking is only allowed to a verified account. Please verify your email ${data!.email}.`
                  );
                }

                const body = JSON.stringify({
                  link_with: data!['__raw'],
                });

                const headers = {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                };

                this.http
                  .post(`https://${environment.auth0.domain}/api/v2/users/${user!.sub}/identities`, body, { headers })
                  .pipe(first())
                  .subscribe(() => {
                    location.reload();
                  });
              });
            });
        });
      });
  }
}
