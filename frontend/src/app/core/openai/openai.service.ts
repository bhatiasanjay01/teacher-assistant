import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { take } from 'rxjs';
import { ResourceName } from '../../../../../backend/src/core/resource-name';
import { LambdaService } from '../../shared/core/lambda.service';
import { LangchainPublicGate } from './../../../../../backend/src/core/langchain/langchain.public.gate';
import {
  ChatGptVersion,
  GetAnswerRequest,
  OpenaiFunction,
  OpenaiPublicGate,
} from './../../../../../backend/src/core/openai/openai.public.gate';
import { OpenaiMessage } from './openai';

@Injectable({
  providedIn: 'root',
})
export class OpenaiService {
  constructor(
    private lambdaService: LambdaService,
    private msg: NzMessageService
  ) {}

  getLangchain() {
    this.lambdaService
      .run$(
        ResourceName.langchain,
        LangchainPublicGate.actions.callOpenAi,
        {},
        { isPublicUrl: true }
      )
      .pipe(take(1))
      .subscribe();
  }

  getAnswer$(messageList: OpenaiMessage[], functions?: OpenaiFunction[]) {
    const request: GetAnswerRequest = {
      chatGptVersion: ChatGptVersion.chatGpt4,
      messageList,
      functions,
    };

    return this.lambdaService.run$(
      ResourceName.openai,
      OpenaiPublicGate.actions.getAnswer,
      request,
      { isPublicUrl: true }
    );
  }
}
