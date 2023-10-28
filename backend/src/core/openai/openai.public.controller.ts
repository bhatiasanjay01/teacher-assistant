import { injectable } from 'inversify';
import { GlobalAssertion } from '../../shared/global-assertion/global-assertion';
import { action, payload, resource } from '../../shared/routing/routing.decorator';
import UserAuth0Service from '../user/auth0/user-auth0.service';
import { GetAnswerRequest, OpenaiPublicGate } from './openai.public.gate';
import OpenaiService from './openai.service';

@resource(OpenaiPublicGate.resource)
@injectable()
export default class OpenaiPublicController {
  constructor(private openaiService: OpenaiService, private userAuth0Service: UserAuth0Service) {}

  @action(OpenaiPublicGate.actions.getAnswer)
  async getAnswer(@payload() getRequest: GetAnswerRequest) {
    GlobalAssertion.assertExistInInput(getRequest, 'getRequest');
    const answer = await this.openaiService.getAnswer(getRequest.messageList, getRequest.functions, getRequest.chatGptVersion);

    return {
      answer,
    };
  }
}
