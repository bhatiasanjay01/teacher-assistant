import { ResourceName } from '../resource-name';

export const WebSocketGate = {
  resource: ResourceName.websocket,
  actions: {
    connect: '$connect',
    disconnect: '$disconnect',
    default: '$default',
  },
};

export type WebSocketGateActionTypes = {
  connect: {
    request: undefined;
    response: undefined;
  };
  disconnect: {
    request: undefined;
    response: undefined;
  };
  default: {
    request: undefined;
    response: undefined;
  };
};

export interface WebSocketResponse {
  senderId?: string;
  type: WebSocketResponseType;
  payload?: any;
}

export enum WebSocketResponseType {
  publicPersonChat = 'public-person-chat',
}
