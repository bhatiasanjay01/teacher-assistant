import { inject, injectable } from 'inversify';
import { UserAuth0Backend } from '../../../../../frontend/src/app/core/user/user-auth0';
import { monitorExecution } from '../../../shared/execution-history/execution-monitor.decorator';
import { GlobalAssertion } from '../../../shared/global-assertion/global-assertion';
import { action, payload, resource } from '../../../shared/routing/routing.decorator';
import { CountResponse, GetByEmailRequest, SuccessResponse } from '../../request-response';
import { UnlinkAccountRequest, UpdateVerifiedTypeRequest, UserAuth0Gate } from './user-auth0.gate';
import UserAuth0Service from './user-auth0.service';

@resource(UserAuth0Gate.resource)
@injectable()
export class UserAuth0Controller {
  @inject(UserAuth0Service)
  private userAuth0Service: UserAuth0Service;

  @action(UserAuth0Gate.actions.sendVerificationEmail)
  @monitorExecution()
  public async sendVerificationEmail() {
    await this.userAuth0Service.sendVerificationEmail();
  }

  @action(UserAuth0Gate.actions.getMy)
  @monitorExecution()
  public async getMy(): Promise<UserAuth0Backend> {
    const loginedUser = await this.userAuth0Service.getLoginedUser();

    loginedUser.identities.forEach((c) => {
      delete c.access_token;
      delete c.refresh_token;
    });

    // delete loginedUser.user_metadata?.google_refresh_token;
    // delete loginedUser.user_metadata?.google_drive_refresh_token;
    // delete loginedUser.user_metadata?.google_calendar_refresh_token;

    delete loginedUser.identities;

    return loginedUser;
  }

  @action(UserAuth0Gate.actions.getByEmail)
  @monitorExecution()
  public async getByEmail(@payload() request: GetByEmailRequest): Promise<UserAuth0Backend> {
    const email = request.email.toLowerCase().trim();

    const user = await this.userAuth0Service.getUserByEmail(email);

    delete user.identities;
    delete user.createdTimeStr;
    delete user.connection;

    return user;
  }

  @action(UserAuth0Gate.actions.updateMy)
  @monitorExecution()
  public async updateMy(@payload() request: UserAuth0Backend): Promise<UserAuth0Backend> {
    GlobalAssertion.assertExistInInput(request, 'request');
    const user = await this.userAuth0Service.updateUser(request);

    delete user.identities;

    return user;
  }

  @action(UserAuth0Gate.actions.updateVerifiedType)
  @monitorExecution()
  async updateVerifiedType(@payload() request: UpdateVerifiedTypeRequest) {
    const user = await this.userAuth0Service.getUserByEmail(request.email);

    if (!user.user_metadata) {
      user.user_metadata = {};
    }

    user.user_metadata.verifiedType = request.verifiedType;

    const updatedUser = await this.userAuth0Service.updateUser(user);

    delete updatedUser.identities;

    return updatedUser;
  }

  @action(UserAuth0Gate.actions.getUserCount)
  @monitorExecution()
  public async getUserCount(@payload() request: GetByEmailRequest): Promise<CountResponse> {
    GlobalAssertion.assertExistInInput(request, 'request');
    const result = await this.userAuth0Service.getUserCountByEmail(request.email.toLowerCase().trim());

    return {
      count: result,
    };
  }

  @action(UserAuth0Gate.actions.unlinkAccount)
  @monitorExecution()
  async unlinkAccount(@payload() request: UnlinkAccountRequest): Promise<SuccessResponse> {
    GlobalAssertion.assertExistInInput(request, 'request');
    await this.userAuth0Service.unlinkAccount(request);
    return {
      isSuccess: true,
    };
  }
}
