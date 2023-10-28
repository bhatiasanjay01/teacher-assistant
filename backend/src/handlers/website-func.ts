import { GlobalError } from '../../../frontend/src/app/shared/global-error/global-error';
import { GlobalReflect } from '../../../frontend/src/app/shared/global-reflect/global-reflect';
import { UnexpectedError } from '../core/error/error';
import { container } from '../core/inversify.config';
import { EndType, OncallService, SourceType } from '../core/oncall/oncall.service';
import { PerRequestLogService } from '../core/per-request-log/per-request-log.service';
import { ExecutionHistory } from '../shared/execution-history/execution-history';
import { compress } from '../shared/http-api/compression';
import { StatusCode } from '../shared/status-code/status-code';
import { WebsiteRequest, WebsiteResponse } from './website.model';

function eventToRequest(event): WebsiteRequest {
  // IMPORTANT: need to add `isLambdaConsoleTest` in the Lambda Console test.
  if (event.isLambdaConsoleTest) {
    return event;
  }

  const httpHeaders = event.headers;

  const httpBody = JSON.parse(event.body);
  const headers = httpBody.headers;

  headers.host = event.headers.host;
  headers.path = event.requestContext.path;
  headers.httpMethod = event.requestContext.httpMethod;
  headers.userAgent = event.requestContext.userAgent;
  headers.requestId = event.requestContext.requestId;
  headers.amazonTraceId = httpHeaders['x-amzn-trace-id'];
  headers.queryStringParameters = event.rawQueryString;
  headers.isBase64Encoded = event.isBase64Encoded;

  const websiteRequest = {
    headers,
    payload: httpBody.payload,
  } as WebsiteRequest;

  return websiteRequest;
}

async function writeLogAndAlarmOncallIfNeeded({
  request,
  response,
  userId,
  clientVersion,
  err,
}: {
  request?: WebsiteRequest;
  response?: any;
  userId?: string;
  clientVersion?: string;
  err?: GlobalError;
}) {
  const write = async () => {
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

    if (err) {
      if (err.skipOnCall) {
        return;
      }

      const errorTitle = (() => {
        const parts: any[] = [];
        parts.push(GlobalReflect.className(err));
        if (err.key) {
          parts.push(`[${err.key} ${err.message}]`);
        }
        return parts.join('');
      })();

      const oncallService = container.get<OncallService>(OncallService);
      await oncallService.sendEmail({
        log,
        err: errorTitle,
        sourceType: SourceType.Website,
        endType: EndType.backend,
      });
    }
  };

  if (err) {
    await write();
  } else {
    setTimeout(() => write(), 1);
  }
}

async function safelyExecute(exection: () => any): Promise<{ result?: any; err?: GlobalError }> {
  try {
    const result = await exection();
    return { result };
  } catch (caughtErr) {
    return { err: wrapIfNotGlobalError(caughtErr) };
  }
}

function wrapIfNotGlobalError(err: Error) {
  if (err instanceof GlobalError) {
    return err;
  }
  return new UnexpectedError({ causedBy: err });
}

function makeResponse({ result, err }: { result?: any; err?: GlobalError }) {
  if (err) {
    return wrapToWebsiteResponse({
      statusCode: StatusCode.error,
      data: {
        key: err.key,
        message: err.message,
      },
    });
  } else {
    return wrapToWebsiteResponse({ statusCode: StatusCode.success, data: result });
  }
}

const wrapToWebsiteResponse = ({ statusCode, data }: WebsiteResponse): WebsiteResponse => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    data,
  };
};

function serializeResponse(response: WebsiteResponse, headers: any): WebsiteResponse {
  const { body, data, ...rest } = response;
  let _body = '';
  if (data !== undefined) {
    _body = JSON.stringify(data);
  }

  const compressedResponse = compress(_body, headers);

  return {
    ...rest,
    statusCode: response.statusCode,
    body: compressedResponse.data?.toString('base64'),
    headers: {
      ...response.headers,
      'content-encoding': compressedResponse.contentEncoding,
    },
    isBase64Encoded: true,
  };
}

export const WebsiteFuncs = {
  eventToRequest,
  safelyExecute,
  makeResponse,
  writeLogAndAlarmOncallIfNeeded,
  serializeResponse,
};
