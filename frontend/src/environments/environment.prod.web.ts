import { StageType } from './stage-type';

export const environment = {
  production: true,
  isConnectToBackend: true,
  isDebugMode: false,
  stageType: StageType.staging,

  isE2e: false,

  textFieldDebounceTime: 32,

  enableNextTaskDetail: true,

  accessToken: '',

  domain: 'https://webapp.mindcraftsmart.com',

  lambdaWebsiteUrl:
    'https://6keb5ryvzzn4jvtop3j7rfrmli0lqmnw.lambda-url.us-east-2.on.aws/',
  lambdaWebsitePublicUrl:
    'https://4uy2st3ymsfgdodrmjh3imqlom0pmaau.lambda-url.us-east-2.on.aws/',
  openaiUrl:
    'https://snfdtwnx5yue5vxp453urhhzmy0bebuz.lambda-url.us-east-2.on.aws/',

  lambdaWebSocketUrl:
    'wss://nzuc9v5gs1.execute-api.us-east-2.amazonaws.com/prod',

  // Auth0
  auth0: {
    domain: 'teaching-assistant-prod.us.auth0.com',
    clientId: 'mXyZNW9V71W70zAwYiRyl7EopatxUciA',
    audience: 'https://teaching-assistant-prod.us.auth0.com/api/v2/',
    redirectUrl: '/',
  },
};
