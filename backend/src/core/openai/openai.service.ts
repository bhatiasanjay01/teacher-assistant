import { injectable } from 'inversify';
import { Configuration, OpenAIApi } from 'openai';
import { OpenaiMessage } from '../../../../frontend/src/app/core/openai/openai';
import { environment } from './../../environments/environment';
import { ChatGptVersion, OpenaiFunction } from './openai.public.gate';

@injectable()
export default class OpenaiService {
  readonly configuration = new Configuration({
    organization: 'org-0G8xLvdd1Nt45Uw7dLFVCpyv',
    apiKey: environment.openai.secretKey,
  });

  openai = new OpenAIApi(this.configuration);

  async getAnswer(messageList: OpenaiMessage[], functions?: OpenaiFunction[], chatGptVersion?: ChatGptVersion) {
    let model = 'gpt-3.5-turbo';
    if (chatGptVersion === ChatGptVersion.chatGpt4) {
      model = 'gpt-4';
    }
    const result = await this.openai.createChatCompletion({ model, messages: messageList, functions }, { timeout: 60000 });
    return result.data.choices[0].message;
  }
}
