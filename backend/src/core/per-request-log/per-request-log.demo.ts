import { GlobalError } from '../../../../frontend/src/app/shared/global-error/global-error';
import { ExecutionHistory } from '../../shared/execution-history/execution-history';
import { monitorExecution } from '../../shared/execution-history/execution-monitor.decorator';
import { StatusCode } from '../../shared/status-code/status-code';
import { PerRequestLogService } from './per-request-log.service';

class DemoError extends GlobalError {}

class Cla1 {
  @monitorExecution()
  func1(p3, p4) {
    throw new DemoError({ message: 'error message 1' });
  }
}

class Cla2 {
  @monitorExecution()
  func1(p1, p2) {
    new Cla1().func1({ a: 1, b: 2 }, 6);
    return 1;
  }
}

let err;
try {
  new Cla2().func1(1, 2);
} catch (caught) {
  err = caught;
}

const service = new PerRequestLogService();

const log = service.toPrettyString({
  request: {
    headers: {
      path: '/',
      httpMethod: 'GET',
      userAgent: '',
      origin: '',
      referer: '',
      amazonCfId: '',
      amazonTraceId: '',
      queryStringParameters: '',
      isBase64Encoded: false,
      resource: 'r',
      action: 'a',
      host: '',
      requestId: '',
    },
    payload: {},
  },
  error: err,
  history: ExecutionHistory.shared,
  response: {
    statusCode: StatusCode.success,
  },
  userId: 'userIduserIduserId',
  clientVersion: '0.1.2',
});

console.info(log);
