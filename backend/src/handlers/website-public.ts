import { initSecrets } from '../core/_secret/secret';
import { initTableNames } from '../core/dynamo/table-names';
import EmailPublicController from '../core/email/email.public.controller';
import { FileController } from '../core/file/file.controller';
import { container } from '../core/inversify.config';
import LangchainPublicController from '../core/langchain/langchain.public.controller';
import OpenaiPublicController from '../core/openai/openai.public.controller';
import { TestController } from '../core/test/test.controller';
import { ExecutionHistory } from '../shared/execution-history/execution-history';
import { Router } from '../shared/routing/routing';
import { WebsiteFuncs } from './website-func';
import { WebsiteRequest } from './website.model';

export const handler = async (event) => {
  let request: WebsiteRequest;
  let clientVersion: string;
  ExecutionHistory.shared = new ExecutionHistory();

  let userId: string;

  const { result, err } = await WebsiteFuncs.safelyExecute(async () => {
    initTableNames();
    await initSecrets();

    request = WebsiteFuncs.eventToRequest(event);
    clientVersion = request.headers.clientVersion;

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
  Router.of([
    container.get(TestController),
    container.get(OpenaiPublicController),
    container.get(EmailPublicController),
    container.get(LangchainPublicController),
    container.get(FileController),
  ]).execute(request);
