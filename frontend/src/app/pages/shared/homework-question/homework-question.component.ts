import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TopicQuestion } from '../../welcome/welcome.component';

@Component({
  selector: 'app-homework-question',
  templateUrl: './homework-question.component.html',
  styleUrls: ['./homework-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeworkQuestionComponent {
  @Input() topicQuestion!: TopicQuestion;
  studentAnswer?: string;

  onSimplerQuestionClick() {}

  onHarderQuestionClick() {}
}
