import { LoginProduct } from '../../../../../frontend/src/app/core/auth/user';
import { UserAuth0Backend, VerifiedType } from '../../../../../frontend/src/app/core/user/user-auth0';
import { BasicAction } from '../../basic-action';
import { CountResponse, GetByEmailRequest, SuccessResponse } from '../../request-response';
import { ResourceName } from '../../resource-name';

// tslint:disable: variable-name
export const UserAuth0Gate = {
  resource: ResourceName.userAuth0,
  actions: {
    getMy: BasicAction.getMy,
    getByEmail: 'get-by-email',
    updateMy: BasicAction.updateMy,
    updateVerifiedType: 'update-verified-type',
    getUserCount: 'get-user-count',
    sendVerificationEmail: 'send-verification-email',
    unlinkAccount: 'unlink-account',
    grantGooglePermission: 'grant-google-permission',
  },
};

export type UserAuth0GateActionTypes = {
  getMy: {
    request: undefined;
    response: UserAuth0Backend;
  };
  getByEmail: {
    request: GetByEmailRequest;
    response: UserAuth0Backend;
  };
  updateMy: {
    request: UserAuth0Backend;
    response: UserAuth0Backend;
  };
  updateVerifiedType: {
    request: UpdateVerifiedTypeRequest;
    response: UpdateVerifiedTypeResponse;
  };
  getUserCount: {
    request: GetByEmailRequest;
    response: CountResponse;
  };
  sendVerificationEmail: {
    request: undefined;
    response: undefined;
  };
  unlinkAccount: {
    request: UnlinkAccountRequest;
    response: SuccessResponse;
  };
  grantGooglePermission: {
    request: GrantGooglePermissionRequest;
    response: SuccessResponse;
  };
};

export interface UpdateVerifiedTypeRequest {
  email: string;
  verifiedType: VerifiedType;
}

export interface UpdateVerifiedTypeResponse {}

export interface GrantGooglePermissionRequest {
  loginProduct: LoginProduct;
}

export interface UnlinkAccountRequest {
  primaryUserId: string;
  provider: string;
  secondaryUserId: string | number;
}
