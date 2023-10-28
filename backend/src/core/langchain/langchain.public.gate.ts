import { ResourceName } from '../resource-name';

// tslint:disable: variable-name
export const LangchainPublicGate = {
  resource: ResourceName.langchain,
  actions: {
    callOpenAi: 'call-openai',
  },
};

export type LangchainTypes = {
  callOpenAi: {
    request: any;
    response: any;
  };
};
