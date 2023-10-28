import { WebsiteRequest, WebsiteResponse } from '../../handlers/website.model';
import { ExecutionHistory } from '../../shared/execution-history/execution-history';

export type PerRequestLog = {
  request?: WebsiteRequest;
  history?: ExecutionHistory;
  error?: Error;
  response?: WebsiteResponse;
  userId?: string;
  clientVersion?: string;
};
