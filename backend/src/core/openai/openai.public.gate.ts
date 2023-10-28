import { OpenaiMessage } from '../../../../frontend/src/app/core/openai/openai';
import { ResourceName } from '../resource-name';

// tslint:disable: variable-name
export const OpenaiPublicGate = {
  resource: ResourceName.openai,
  actions: {
    getAnswer: 'get-answer',
  },
};

export type OpenaiTypes = {
  getAnswer: {
    request: GetAnswerRequest;
    response: GetAnswerResponse;
  };
};

export interface GetAnswerRequest {
  chatGptVersion?: ChatGptVersion;
  messageList: OpenaiMessage[];
  functions?: OpenaiFunction[];
}

export enum ChatGptVersion {
  chatGpt3 = 'chatGpt3',
  chatGpt4 = 'chatGpt4',
}

export interface GetAnswerResponse {
  answer: string;
}

export interface OpenaiFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: {
      [key: string]: {
        type: string;
        description?: string;
        enum?: string[];
        items?: {
          type: string;
          properties?: {
            [key: string]: {
              type: string;
              description?: string;
              enum?: string[];
              items?: any;
            };
          };
        };
      };
    };
  };
}

export interface ChatWithOpenaiResponse {
  coreId: string;
  content?: string;
  isFinished?: boolean;
  functionName?: string;
}

export interface GetWorkspaceUsageHistoryRequest {
  workspaceId: string;
  startTimeStr: string;
}
