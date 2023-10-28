/**
 * TODO: oncallEmailSender and oncallList should be moved to the other place like a email service in the future.
 */
export const environment = {
  isProd: false,

  awsSecretName: 'arn:aws:secretsmanager:us-east-2:778684586574:secret:staging/teacher-assistant-TDM0yv',

  environmentName: '',

  oncallEmailSender: 'Tickent Backend Alarm <airclickid@gmail.com>',
  oncallList: ['peikang.hu@gmail.com'],

  systemLogS3Bucket: 'agile-planning-tool-log',

  recently: { months: 3 },

  lambdaWebSocketConnectionUrl: 'https://omvn8eke0l.execute-api.us-east-2.amazonaws.com/staging',

  loadFileUrl: 'files-staging.mindcraftsmart.com',

  eventBridgeArn: 'arn:aws:lambda:us-east-2:778684586574:function:staging-eventBridge-task-ai',
  eventBridgeRoleArn: 'arn:aws:iam::778684586574:role/service-role/Amazon_EventBridge_Scheduler_LAMBDA_e628799e0a',

  openSearch: {
    host: 'get-from-aws-secret',
    accessKeyId: 'get-from-aws-secret',
    secretAccessKey: 'get-from-aws-secret',
  },

  filestack: {
    secret: 'get-from-aws-secret',
  },

  slack: {
    airClickAppName: 'AirClick - staging',
    clientId: 'get-from-aws-secret',
    clientSecret: 'get-from-aws-secret',
    signingSecret: 'get-from-aws-secret',
    returnUrl: 'get-from-aws-secret',
  },

  domain: 'https://localhost:4200',

  auth0: {
    audience: 'https://dev-45jp68lg3nmhsd50.us.auth0.com/api/v2/',
    domain: 'get-from-aws-secret',
    clientId: 'get-from-aws-secret',
    clientSecret: 'get-from-aws-secret',
  },

  airtable: {
    key: 'get-from-aws-secret',
  },

  github: {
    appId: 'get-from-aws-secret',
    clientId: 'get-from-aws-secret',
    clientSecret: 'get-from-aws-secret',
    webhookSecret: 'get-from-aws-secret',
    privateKey: 'get-from-aws-secret',
  },

  google: {
    clientId: 'get-from-aws-secret',
    clientSecret: 'get-from-aws-secret',
  },

  whatsapp: {
    phoneNumberId: 'get-from-aws-secret',
    verifyToken: 'get-from-aws-secret',
    token: 'get-from-aws-secret',
  },

  openai: {
    secretKey: 'get-from-aws-secret',
  },

  sfExpress: {
    customerCode: 'get-from-aws-secret',
    sandboxCode: 'get-from-aws-secret',
    productionCode: 'get-from-aws-secret',
  },

  stripe: {
    secretKey: 'get-from-aws-secret',
    webhookSecretKey: 'get-from-aws-secret',
  },
};
