import { ResourceName } from '../resource-name';

export const TestGate = {
  resource: ResourceName.test,
  actions: {
    ping: 'ping',
  },
};

export type FileGateActionTypes = {
  ping: {
    request: undefined;
    response: undefined;
  };
};
