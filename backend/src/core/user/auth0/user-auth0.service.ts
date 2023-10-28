import { inject, injectable } from 'inversify';
import jwt_decode from 'jwt-decode';
import { DateTime } from 'luxon';
import { UserAuth0Backend } from '../../../../../frontend/src/app/core/user/user-auth0';
import { GlobalAssertion } from '../../../shared/global-assertion/global-assertion';
import { environment } from './../../../environments/environment';
import { UnlinkAccountRequest } from './user-auth0.gate';
import { Auth0UserId, UserAuth0Repository } from './user-auth0.repository';

@injectable()
export default class UserAuth0Service {
  @inject(UserAuth0Repository)
  private userAuth0Repository: UserAuth0Repository;

  private _loginedUserId: string | undefined;

  private _loginedSlackUserId: string;

  public get loginedUserId() {
    return this._loginedUserId;
  }

  setLoginedUserIdFromSlack(loginedUserId: string) {
    this._loginedUserId = loginedUserId;
  }

  public get loginedSlackUserId(): string | undefined {
    return this._loginedSlackUserId;
  }

  unlinkAccount(params: UnlinkAccountRequest) {
    return this.userAuth0Repository.unlinkAccount(params);
  }

  public sendVerificationEmail() {
    return this.userAuth0Repository.sendVerificationEmail(this.loginedUserId);
  }

  async setLoginedUserIdByAuth0(accessToken: string, isLambdaConsoleTest: boolean = false) {
    const decodedAccessToken = jwt_decode(accessToken) as any;
    const auth0Id = decodedAccessToken.sub;

    GlobalAssertion.assertTrue({
      value: decodedAccessToken.iss.includes(environment.auth0.domain),
      message: `The Token should be issued by ${decodedAccessToken.iss} but it is issued by ${environment.auth0.domain}`,
    });

    if (!isLambdaConsoleTest) {
      const expiredDate = DateTime.fromSeconds(decodedAccessToken.exp);
      GlobalAssertion.assertTrue({
        value: expiredDate >= DateTime.now(),
        message: `The access token is expired at: ${expiredDate.toISO()}`,
      });
    }
    this._loginedUserId = auth0Id;
  }

  async setLoginedUserIdBySlack(slackTeamId: string, slackUserId: string) {
    this._loginedUserId = await this.getLoginedAuth0UserIdBySlack(slackTeamId, slackUserId);
  }

  async getLoginedAuth0UserIdBySlack(slackTeamId: string, slackUserId: string) {
    this._loginedSlackUserId = slackUserId;
    const auth0UserId = this.getAuth0IdBySlack(slackTeamId, slackUserId);
    const auth0User = await this.userAuth0Repository.getUserByAuth0UserId(auth0UserId);
    return auth0User?.id;
  }

  private getAuth0IdBySlack(slackTeamId: string, slackUserId: string): Auth0UserId {
    return {
      provider: 'oauth2',
      userId: `slack-oauth-2|${slackTeamId}-${slackUserId}`,
    };
  }

  public async getUserListByIdList(idList: string[]) {
    const query = `user_id:("${idList.join('" OR "')}")`;
    return this.userAuth0Repository.getUserList(query);
  }

  public async getLoginedUser(needRefresh?: boolean) {
    return this.userAuth0Repository.getUserByUserId(this._loginedUserId, needRefresh);
  }

  public getGoogleAccount(user: UserAuth0Backend) {
    return user.identities.find((c) => c.provider === 'google-oauth2');
  }

  getGitHubAccount(user: UserAuth0Backend) {
    return user.identities.find((c) => c.provider === 'github');
  }

  getUserByIdentitiesUserId(userId: string) {
    return this.userAuth0Repository.getUserByIdentitiesUserId(userId);
  }

  public async getUserByEmail(email: string) {
    return this.userAuth0Repository.getUserByEmail(email.toLowerCase());
  }

  public async getUserCountByEmail(email: string): Promise<number> {
    return this.userAuth0Repository.getUserCountByEmail(email.toLowerCase());
  }

  public async updateUser(userAuth0Backend: UserAuth0Backend) {
    return this.userAuth0Repository.updateUser(userAuth0Backend);
  }
}
