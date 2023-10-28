import { GlobalError } from '../../../frontend/src/app/shared/global-error/global-error';
import { initSecrets } from '../core/_secret/secret';
import { initTableNames } from '../core/dynamo/table-names';
import { UnexpectedError } from '../core/error/error';
import { container } from '../core/inversify.config';
import { ResourceName } from '../core/resource-name';
import UserAuth0Service from '../core/user/auth0/user-auth0.service';
import { WebSocketController } from '../core/websocket/websocket.controller';
import { ExecutionHistory } from '../shared/execution-history/execution-history';
import { Router } from '../shared/routing/routing';
import { StatusCode } from '../shared/status-code/status-code';
import { WebsiteResponse, WebsiteSocketRequest, WebSocketRequestHeaders } from './website.model';

export const handler = async (event, context) => {
  /*
  const identitiesForMasterLog = {
    requestId: event.requestContext.requestId,
    awsRequestId: context.awsRequestId,
  };
  console.info('EJU26WSY: handler start', identitiesForMasterLog, event);
  */
  let response: WebsiteResponse;
  let request: WebsiteSocketRequest;
  let err: Error;
  let clientVersion: string;
  ExecutionHistory.shared = new ExecutionHistory();

  try {
    initTableNames();
    await initSecrets();

    request = initRequest(event);
    clientVersion = 'web-socket';

    let accessToken: string;
    if (event.isLambdaConsoleTest) {
      accessToken = event.accessToken;
    } else {
      accessToken = request?.headers?.accessToken;
    }

    const userAuth0Service = container.get<UserAuth0Service>(UserAuth0Service);
    if (accessToken) {
      await userAuth0Service.setLoginedUserIdByAuth0(accessToken, event.isLambdaConsoleTest);
    }

    const result = await execute(request);
    response = makeResponse({ statusCode: StatusCode.success, data: result });
  } catch (caughtErr) {
    console.info(caughtErr);
    err = wrapIfNotGlobalError(caughtErr);
    response = makeResponse({
      statusCode: StatusCode.error,
    });
  }

  // LAZY: should reorganize the code below
  /*
  let userId: string;
  setTimeout(async () => {
    // console.info('P67W5YDP - 1: async log', identitiesForMasterLog);
    const perRequestLogService = container.get<PerRequestLogService>(PerRequestLogService);
    const log = perRequestLogService.toPrettyString({
      request,
      history: ExecutionHistory.shared,
      error: err,
      response,
      userId,
      clientVersion,
    });
    if (err) {
      console.error(log);
    } else {
      console.info(log);
    }

    // console.info('P67W5YDP - 2: async log', identitiesForMasterLog);
    if (err) {
      const oncallService = container.get<OncallService>(OncallService);
      await oncallService.sendEmail(log, err, SourceType.Website);
    }
    // console.info('P67W5YDP - 3: async log', identitiesForMasterLog);
  }, 1);
  */
  // console.info('7QHZ5WTX: handler end', identitiesForMasterLog);
  return response;
};

const initRequest = (event): WebsiteSocketRequest => {
  // IMPORTANT: need to add `isLambdaConsoleTest` in the Lambda Console test.
  if (event.isLambdaConsoleTest) {
    return event;
  }

  let httpBody = { payload: {}, headers: {} };

  if (event.body) {
    httpBody = JSON.parse(event.body);
  }

  const headers: Partial<WebSocketRequestHeaders> = httpBody.headers;

  headers.host = event.headers?.Host;
  headers.routeKey = event.requestContext.routeKey;
  headers.connectionId = event.requestContext.connectionId;
  headers.userAgent = event.requestContext.identity.userAgent;
  headers.sourceIp = event.requestContext.identity.sourceIp;
  headers.requestId = event.requestContext.requestId;
  headers.isBase64Encoded = event.isBase64Encoded;

  if (!headers.action) {
    headers.action = event.requestContext.routeKey;
  }

  if (!headers.resource) {
    headers.resource = ResourceName.websocket;
  }

  const websiteSocketRequest = {
    headers,
    payload: httpBody.payload,
  } as WebsiteSocketRequest;

  return websiteSocketRequest;
};

const execute = async (request: WebsiteSocketRequest): Promise<any> => Router.of([container.get(WebSocketController)]).execute(request);

const wrapIfNotGlobalError = (err: Error) => {
  if (err instanceof GlobalError) {
    return err;
  }
  return new UnexpectedError({ causedBy: err });
};

const makeResponse = ({ statusCode, data }: WebsiteResponse): WebsiteResponse => {
  return {
    statusCode,
    body: JSON.stringify(data),
  };
};
