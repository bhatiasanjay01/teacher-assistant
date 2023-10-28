import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { injectable } from 'inversify';
import { environment } from '../../environments/environment';
import { WebSocketResponse } from './websocket.gate';

@injectable()
export default class WebSocketService {
  private client = new ApiGatewayManagementApiClient({
    region: 'us-east-2',
    endpoint: environment.lambdaWebSocketConnectionUrl,
  });

  async postToConnection(connectionId: string, sendMessageResponse: WebSocketResponse) {
    try {
      const command = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify(sendMessageResponse)),
      });

      await this.client.send(command);
    } catch (err) {
      if (err.statusCode === 410) {
        // await this.deleteAirClickWebSocket(connectionId);
      }
    }
  }
}
