import { Component, OnInit, signal } from '@angular/core';
import { map, retry, take } from 'rxjs';
import { OpenaiFunction } from '../../../../../backend/src/core/openai/openai.public.gate';
import { Id } from '../../shared/id/id';
import { EnumUtils } from '../../shared/utils/enum-utils';
import { NumberUtils } from '../../shared/utils/number-utils';
import { prealgebraTarget, prealgebraTopics } from '../shared/topics';
import { OpenaiService } from './../../core/openai/openai.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  isLoading = signal<boolean>(false);

  index = signal<number>(0);

  constructor(private openaiService: OpenaiService) {}

  preferredName = 'Peter';
  getAllInterestsOptions!: any[];
  getJobTypesOptions!: any[];

  selectedTopic?: LearningTopic;
  tempQuestion?: string;

  famousePersonName?: string;

  homeworkQuestionList: TopicQuestion[] = [
    {
      id: '1',
      question: `During a basketball game, a player scored 30 points above his average in the first game and 30 points below his average in the second game. Taking into consideration absolute value, what's the total points variation from his average over the two games?`,
      stepsToSolveQuestions: `1. Represent the points above average as +30 and below average as -30. 2. As absolute value ignores the sign, sum the absolute value of both numbers.`,
      answer: '60 points',

      topicQuestionAttemptList: [],
    },
    {
      id: '2',
      question: `Imagine you are a member of a basketball team and each player's number is a prime number. However, there is a glitch in the team software that changes player's numbers into its prime factors. If your number has been converted into 2, 2 and 3, can you figure out what your original number was before the glitch?`,
      stepsToSolveQuestions: `To find the original number, you need to multiply the prime factors. In this case, you would multiply 2*2*3.`,
      answer: '12',
      topicQuestionAttemptList: [],
    },
  ];

  ngOnInit() {
    this.getAllInterestsOptions = this.getAllInterests().map((interest) => ({
      label: interest,
      value: interest,
      checked: false,
    }));

    this.getAllInterestsOptions[0].checked = true;

    this.getJobTypesOptions = this.getJobTypes().map((jobType) => ({
      label: jobType,
      value: jobType,
      checked: false,
    }));

    this.getJobTypesOptions[6].checked = true;
  }

  onLangChainClick() {
    this.openaiService.getLangchain();
  }

  onIndexChange(event: number): void {
    this.index.set(event);
  }

  getAllInterests() {
    return EnumUtils.getAllValues(InterestType) as string[];
  }

  getJobTypes() {
    return EnumUtils.getAllValues(JobType) as string[];
  }

  algebraTopics = prealgebraTopics;

  onExerciseClick(topic: LearningTopic) {
    this.selectedTopic = topic;
  }

  getRandomNumber() {
    return NumberUtils.getRandomInt(0, 100);
  }

  topicQuestionList: TopicQuestion[] = [];

  onAddQuestionClick() {
    this.isLoading.set(true);

    const optionStr = this.getAllInterestsOptions
      .filter((c) => c.checked)
      .map((c) => c.label)
      .join(',');

    const generatequestion = `A student likes the following: ${optionStr}. His famous person's name is ${this.famousePersonName}. You are generating questions for a ${prealgebraTarget} student to solve. Can you give me an engaging question related to """${this.selectedTopic?.title}""" that would capture a student's interest?`;

    const functions: OpenaiFunction[] = [
      {
        name: 'createQuestion',
        description: `Create a simple question less than 100 words and answer based on students' interests.`,
        parameters: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
            },
            stepsToSolveQuestions: {
              type: 'string',
            },
            answer: {
              type: 'string',
            },
          },
        },
      },
    ];

    this.openaiService
      .getAnswer$([{ role: 'system', content: generatequestion }], functions)
      .pipe(
        take(1),
        map((reponse) => {
          let argumentJson;
          if (reponse?.answer?.function_call?.arguments) {
            argumentJson = JSON.parse(reponse.answer.function_call.arguments);
          } else if (reponse?.content) {
            argumentJson = JSON.parse(reponse?.content);
          }

          if (!argumentJson) {
            throw new Error('Generated question is wrong:', reponse);
          }

          const topicQuestion: TopicQuestion = {
            id: `${Id.uuid.generateInBase62()}`,
            question: argumentJson.question,
            stepsToSolveQuestions: argumentJson.stepsToSolveQuestions,
            answer: argumentJson.answer,

            topicQuestionAttemptList: [],
          };

          prealgebraTopics
            .find((c) => c.id === this.selectedTopic?.id)
            ?.topicQuestionList.push(topicQuestion);
        }),
        retry(2)
      )
      .subscribe(() => {
        this.isLoading.set(false);
      });
  }
}

export interface TopicQuestion {
  id: string;
  question: string;
  stepsToSolveQuestions: string;
  answer: string;

  topicQuestionAttemptList: TopicQuestionAttempt[];
}

export interface TopicQuestionAttempt {
  id: string;
  answer: string;
  aiAssessment: string;
  isCorrect: boolean;
}

export interface LearningTopic {
  id: string;
  title: string;

  topicQuestionList: TopicQuestion[];

  progress: number;
  hours: number;
}

export enum InterestType {
  Sports = 'Sports',
  Reading = 'Reading',
  Movies = 'Movies',
  Music = 'Music',
  Travel = 'Travel',
  Food = 'Food',
  Art = 'Art',
  Fitness = 'Fitness',
  Technology = 'Technology',
  Gaming = 'Gaming',
  Nature = 'Nature',
  Cooking = 'Cooking',
  History = 'History',
  Fashion = 'Fashion',
  Pets = 'Pets',
  Dancing = 'Dancing',
  Science = 'Science',
  Cars = 'Cars',
}

export enum JobType {
  Cook = 'Cook',
  Designer = 'Designer',
  Doctor = 'Doctor',
  Driver = 'Driver',
  Sales = 'Sales',
  Science = 'Science',
  SoftwareEngineer = 'Software Engineer',
  Teacher = 'Teacher',
  Writer = 'Writer',
}
