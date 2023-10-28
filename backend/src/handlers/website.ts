import { initSecrets } from '../core/_secret/secret';
import { initTableNames } from '../core/dynamo/table-names';
import { FileController } from '../core/file/file.controller';
import { container } from '../core/inversify.config';
import UserAuth0Service from '../core/user/auth0/user-auth0.service';
import { ExecutionHistory } from '../shared/execution-history/execution-history';
import { UserAuth0Controller } from './../core/user/auth0/user-auth0.controller';
import { Router } from './../shared/routing/routing';
import { WebsiteFuncs } from './website-func';
import { WebsiteRequest } from './website.model';

export const handler = async (event) => {
  let request: WebsiteRequest | undefined;
  let clientVersion: string | undefined;
  ExecutionHistory.shared = new ExecutionHistory();

  let userId: string | undefined;

  const { result, err } = await WebsiteFuncs.safelyExecute(async () => {
    initTableNames();
    await initSecrets();

    request = WebsiteFuncs.eventToRequest(event);
    clientVersion = request.headers.clientVersion;

    let accessToken: string;
    if (event.isLambdaConsoleTest) {
      if (!event.accessToken) {
        throw new Error('Need to provide `accessToken`');
      }
      accessToken = event.accessToken;
    } else {
      accessToken = event.headers.authorization.substring(7);
    }

    const userAuth0Service = container.get<UserAuth0Service>(UserAuth0Service);
    await userAuth0Service.setLoginedUserIdByAuth0(accessToken, event.isLambdaConsoleTest);
    userId = userAuth0Service.loginedUserId;

    return execute(request);
  });

  const response = WebsiteFuncs.makeResponse({ result, err });
  await WebsiteFuncs.writeLogAndAlarmOncallIfNeeded({ request, response, userId, clientVersion, err });

  if (result) {
    return result;
  }

  return err;
};

const execute = async (request: WebsiteRequest): Promise<any> =>
  Router.of([container.get(UserAuth0Controller), container.get(FileController)]).execute(request);
