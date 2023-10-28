/* eslint-disable @typescript-eslint/no-var-requires */
import { injectable } from 'inversify';
import { environment } from '../../environments/environment';
import { action, resource } from '../../shared/routing/routing.decorator';
import { LangchainPublicGate } from './langchain.public.gate';

const { OpenAI } = require('langchain/llms/openai');
const { PromptTemplate } = require('langchain/prompts');
const { LLMChain } = require('langchain/chains');

@resource(LangchainPublicGate.resource)
@injectable()
export default class LangchainPublicController {
  @action(LangchainPublicGate.actions.callOpenAi)
  async callOpenAi() {
    const model = new OpenAI({ openAIApiKey: environment.openai.secretKey, temperature: 0.9 });

    const template = 'What is a good name for a company that makes {product}?';

    const prompt = new PromptTemplate({
      template,
      inputVariables: ['product'],
    });

    // const res1 = await prompt.format({ product: 'colorful socks' });
    // const res = await model.call(res1);

    const chain = new LLMChain({ llm: model, prompt });

    const res = await chain.call({ product: 'colorful socks' });

    return res;
  }
}
