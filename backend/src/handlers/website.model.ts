import { Request } from '../shared/routing/routing.model';
import { StatusCode } from '../shared/status-code/status-code';

export type WebsiteRequestHeaders = {
  host: string;
  path: string;
  httpMethod: string;
  userAgent: string;
  origin: string;
  referer: string;
  amazonCfId: string;
  amazonTraceId: string;
  queryStringParameters: string;
  isBase64Encoded: boolean;
  clientVersion?: string;
  requestId: string;
};

export type WebSocketRequestHeaders = {
  host?: string;
  routeKey: string;
  connectionId: string;
  userAgent: string;
  sourceIp: string;
  requestId: string;
  isBase64Encoded: boolean;
  action?: string;
  resource?: string;
  accessToken?: string;
};

export type WebsiteRequest = Request<WebsiteRequestHeaders>;
export type WebsiteSocketRequest = Request<WebSocketRequestHeaders>;

export type WebsiteResponse = {
  statusCode: StatusCode;
  headers?: any;
  body?: string;
  data?: any;
  isBase64Encoded?: boolean;
};
