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

  domain: 'https://beta.mindcraftsmart.com/',

  lambdaWebsiteUrl:
    'https://gihy5xk56edpy7mi33ijam377u0yljba.lambda-url.us-east-2.on.aws/',
  lambdaWebsitePublicUrl:
    'https://ldrebs4mrakazduk56qnxjzvpe0knlpp.lambda-url.us-east-2.on.aws/',
  openaiUrl:
    'https://6aqpn45v7lybe3opq6itsd3oo40tyebv.lambda-url.us-east-2.on.aws/',

  lambdaWebSocketUrl:
    'wss://omvn8eke0l.execute-api.us-east-2.amazonaws.com/staging',

  // Auth0
  auth0: {
    domain: 'teaching-assistant-staging.us.auth0.com',
    clientId: 'Oct7WlvF0GzJW2M8AmGRCDOhtFJYLVjG',
    audience: 'https://teaching-assistant-staging.us.auth0.com/api/v2/',
    redirectUrl: '/',
  },
};
