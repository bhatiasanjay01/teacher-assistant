import { inject, injectable } from 'inversify';
import { action, headers, resource } from '../../shared/routing/routing.decorator';
import { WebSocketGate } from './websocket.gate';
import WebSocketService from './websocket.service';

@resource(WebSocketGate.resource)
@injectable()
export class WebSocketController {
  @inject(WebSocketService)
  private webSocketService: WebSocketService;

  @action(WebSocketGate.actions.connect)
  connect() {}

  @action(WebSocketGate.actions.disconnect)
  async disconnect(@headers('connectionId') connectionId: string) {
    // const currentWorkspaceId = (await this.airClickWebSocketService.getItem(connectionId))?.currentWorkspaceId;
    // await this.airClickWebSocketService.deleteAirClickWebSocket(connectionId);
    // const onlineUserLocationList = await this.airClickWebSocketService.getWebSocketListByWorkspaceId(currentWorkspaceId);
    // const sendMessageResponse: WebSocketResponse = {
    //   type: WebSocketResponseType.onlineUserLocationList,
    //   payload: onlineUserLocationList,
    // };
    // await this.airClickWebSocketService.postToAllUsers(currentWorkspaceId, true, sendMessageResponse);
  }

  @action(WebSocketGate.actions.default)
  default() {}
}
