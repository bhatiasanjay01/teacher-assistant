import {
  AppMetadata,
  GetUsersData,
  ManagementClient,
  ManagementClientOptions,
  ObjectWithId,
  UnlinkAccountsParams,
  UnlinkAccountsParamsProvider,
  UpdateUserData,
  User,
  UserMetadata,
  VerifyEmail,
} from 'auth0';
import { injectable } from 'inversify';
import { DateTime } from 'luxon';
import { ConnectionType, GenderType, UserAuth0Backend, VerifiedType } from '../../../../../frontend/src/app/core/user/user-auth0';
import { environment } from '../../../environments/environment';
import { monitorExecution } from '../../../shared/execution-history/execution-monitor.decorator';
import { GlobalAssertion } from '../../../shared/global-assertion/global-assertion';
import { ErrorLocation, ValueConstraintError } from '../../../shared/global-assertion/global-assertion.error';
import { UnlinkAccountRequest } from './user-auth0.gate';

@injectable()
export class UserAuth0Repository {
  private options: ManagementClientOptions = {
    domain: environment.auth0.domain,
    clientId: environment.auth0.clientId,
    clientSecret: environment.auth0.clientSecret,
    audience: environment.auth0.audience,
    tokenProvider: {
      enableCache: true,
      cacheTTLInSeconds: 10,
    },
  };

  private idAndUserAuth0Backend = new Map<string, UserAuth0Backend>();

  private idAndCachedTime = new Map<string, DateTime>();

  private cachedSeconds = !environment.isProd ? 300 : 3;

  private _managementClient = new ManagementClient<AppMetadata, AirClickUserMetaData>(this.options);

  async unlinkAccount(params: UnlinkAccountRequest) {
    const unlinkParams: UnlinkAccountsParams = {
      id: params.primaryUserId,
      provider: params.provider as UnlinkAccountsParamsProvider,
      user_id: `${params.secondaryUserId}`,
    };

    try {
      const result = await this._managementClient.unlinkUsers(unlinkParams);
      return result;
    } catch (err) {
      GlobalAssertion.assertTrue({ value: false, message: err.message });
    }
  }

  async getUserList(query: string) {
    // Example: https://auth0.com/docs/users/user-search/retrieve-users-with-get-users-endpoint

    const getUsersData: GetUsersData = {
      q: query,
    };

    const result = await this._managementClient.getUsers(getUsersData);

    if (result.length > 0) {
      const auth0BackendList = result.map((c) => this.convertRawToBackend(c));
      return auth0BackendList;
    }

    return [];
  }

  async getUserByAuth0UserId(auth0UserId: Auth0UserId): Promise<UserAuth0Backend | undefined> {
    const userList = await this.getUserList(`identities.provider:"${auth0UserId.provider}" AND identities.user_id:"${auth0UserId.userId}"`);

    if (userList.length === 0) {
      return undefined;
    }

    GlobalAssertion.oldAssertTrue(
      userList.length === 1,
      ValueConstraintError.of({
        message: `Two or more accounts are connected into one user id:${auth0UserId}`,
        location: ErrorLocation.database,
      })
    );

    return userList[0];
  }

  async getUserByUserId(userId: string, needRefresh?: boolean): Promise<UserAuth0Backend | undefined> {
    /*
      // openid
      // ./auth/userinfo.profile
      // .../auth/userinfo.email
      // scope: 'https://www.googleapis.com/auth/calendar.app.created'
      // ./auth/calendar.calendarlist.readonly
      // ./auth/calendar.events.freebusy
      // ./auth/calendar.events.public.readonly
      // ./auth/calendar.freebusy
      // .../auth/calendar.settings.readonly
    */

    const resultFromCache = (() => {
      if (needRefresh) {
        return null;
      }
      const cachedTime = this.idAndCachedTime.get(userId);
      if (!cachedTime) {
        return null;
      }

      if (cachedTime < DateTime.local()) {
        return null;
      }
      const cachedAuth0Backend = this.idAndUserAuth0Backend.get(userId);
      if (!cachedAuth0Backend.emailVerified) {
        return null;
      }

      return cachedAuth0Backend;
    })();

    if (resultFromCache) {
      return resultFromCache;
    }

    const objectWithId: ObjectWithId = {
      id: userId,
    };
    const result = await this._managementClient.getUser(objectWithId);
    const userAuth0Backend = this.convertRawToBackend(result);

    this.idAndUserAuth0Backend.set(userId, userAuth0Backend);
    this.idAndCachedTime.set(userId, DateTime.utc().plus({ seconds: this.cachedSeconds }));

    return userAuth0Backend;
  }

  @monitorExecution()
  async getUserCountByEmail(email: string): Promise<number> {
    const resultList = await this._managementClient.getUsersByEmail(email);
    return resultList ? resultList.length : 0;
  }

  async getUserByIdentitiesUserId(userId: string) {
    const result = await this._managementClient.getUsers({ q: `identities.user_id = ${userId}` });

    if (result.length === 0) {
      return undefined;
    }

    GlobalAssertion.assertTrue({
      value: result.length < 2,
      message: `Two or more accounts are connected into one user id: ${userId}`,
    });

    return this.convertRawToBackend(result[0]);
  }

  async getUserByEmail(email: string): Promise<UserAuth0Backend | undefined> {
    const result = await this._managementClient.getUsersByEmail(email);

    if (result.length === 0) {
      return undefined;
    }

    GlobalAssertion.oldAssertTrue(
      result.length < 2,
      ValueConstraintError.of({
        message: `Two or more accounts are connected into one email:${email}`,
        location: ErrorLocation.database,
      })
    );

    return this.convertRawToBackend(result[0]);
  }

  async sendVerificationEmail(userId: string) {
    const userIdParams: VerifyEmail = { user_id: userId };
    this._managementClient.sendEmailVerification(userIdParams);
  }

  async updateUser(userAuth0Backend: UserAuth0Backend) {
    const objectWithId = { id: userAuth0Backend.id };
    const updateUserData: UpdateUserData = {
      user_metadata: {
        ...userAuth0Backend.user_metadata,
      },
    };
    const result = await this._managementClient.updateUser(objectWithId, updateUserData);
    return this.convertRawToBackend(result);
  }

  async updateUserData(userAuth0Id: string, updateUserData: UpdateUserData) {
    const objectWithId = { id: userAuth0Id };
    const result = await this._managementClient.updateUser(objectWithId, updateUserData);
    return this.convertRawToBackend(result);
  }

  private convertRawToBackend(userAuth0Raw?: User<AppMetadata, AirClickUserMetaData>): UserAuth0Backend | undefined {
    if (!userAuth0Raw) {
      return undefined;
    }

    const auth0Id = userAuth0Raw.user_id;
    const connection = auth0Id.split('|')[0] as ConnectionType;

    return {
      id: auth0Id,
      connection,
      email: userAuth0Raw.email,
      emailVerified: userAuth0Raw.email_verified,
      identities: userAuth0Raw.identities as any[],
      createdTimeStr: userAuth0Raw.created_at,
      user_metadata: userAuth0Raw.user_metadata,
    };
  }
}

interface AirClickUserMetaData extends UserMetadata {
  gender: GenderType;
  verifiedType: VerifiedType;

  portrait_url?: string;
}

export interface Auth0UserId {
  provider: string;
  userId: string;
}
