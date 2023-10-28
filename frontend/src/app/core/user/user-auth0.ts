export interface UserAuth0Backend {
  id: string;
  email: string;
  emailVerified?: boolean;
  connection: ConnectionType;

  createdTimeStr: string;
  user_metadata?: UserMetadata;
  identities: LinkedAccountBackend[];
}

export interface UserMetadata {
  gender?: GenderType;
  verifiedType?: VerifiedType;

  portrait_url?: string;
}

export enum GenderType {
  male = 'male',
  female = 'female',
  noTell = 'no-tell',
}

export enum VerifiedType {
  notVerified = 'not-verified',
  idVerified = 'id-verified',
  powerSeller = 'power-seller',
  feiable = 'feiable',
}

export interface LinkedAccountBackend {
  provider: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user_id: number;
  connection: ConnectionType;
  isSocial: boolean;
}

export enum ConnectionType {
  email = 'email',
  slack = 'slack-oauth-2',
  google = 'google-oauth2',
  microsoft = 'windowslive',
  github = 'github',
}
