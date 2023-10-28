import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  signal,
} from '@angular/core';
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { forkJoin, map, take } from 'rxjs';
import {
  prealgebraTarget,
  prealgebraTopics,
  subject,
} from '../../shared/topics';
import { OpenaiService } from './../../../core/openai/openai.service';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeachersComponent {
  algebraTopics = prealgebraTopics;

  index = signal<number>(0);
  isLoading = signal<boolean>(false);

  algebraTopicsOptions: any[] = [];

  constructor(private openaiService: OpenaiService) {}

  ngOnInit() {
    this.algebraTopicsOptions = this.algebraTopics.map((item) => ({
      label: item.title,
      value: item.id,
      checked: false,
    }));
  }

  @ViewChild('pdfDoc') pdfDoc?: ElementRef;

  pdfMode = signal<boolean>(false);

  onPdfMode(value: boolean) {
    this.pdfMode.set(value);
  }

  onDownloadPdfClick() {
    this.pdfMode.set(true);
    const pdfDoc = this.pdfDoc?.nativeElement;

    var html = htmlToPdfmake(pdfDoc.innerHTML);

    const documentDefinition = { content: html };
    pdfMake.createPdf(documentDefinition).open();
    this.pdfMode.set(false);
  }

  onNewPracticeClick(classContent: ClassContent) {
    this.isLoading.set(true);

    this.openaiService
      .getAnswer$(
        [
          {
            role: 'system',
            content: `Here is the class objective: """${classContent.objective}""". Generate one example for this.`,
          },
        ],
        [
          {
            name: 'generateExample',
            description: 'Generate one example based on the class objective.',
            parameters: {
              type: 'object',
              properties: {
                question: {
                  type: 'string',
                },
                answer: {
                  type: 'string',
                },
              },
            },
          },
        ]
      )
      .pipe(take(1))
      .subscribe((data) => {
        if (data?.answer?.function_call?.arguments) {
          const argumentJson = JSON.parse(
            data?.answer?.function_call?.arguments
          );
          classContent.practiceProblems.push(argumentJson);

          this.classContentList.set(this.classContentList());
        }

        this.isLoading.set(false);
      });
  }

  onNewExampleClick(classContent: ClassContent) {
    this.isLoading.set(true);

    this.openaiService
      .getAnswer$(
        [
          {
            role: 'system',
            content: `Here is the class objective: """${classContent.objective}""". Generate one example for this.`,
          },
        ],
        [
          {
            name: 'generateExample',
            description: 'Generate one example based on the class objective.',
            parameters: {
              type: 'object',
              properties: {
                question: {
                  type: 'string',
                },
                answer: {
                  type: 'string',
                },
              },
            },
          },
        ]
      )
      .pipe(take(1))
      .subscribe((data) => {
        if (data?.answer?.function_call?.arguments) {
          const argumentJson = JSON.parse(
            data?.answer?.function_call?.arguments
          );
          classContent.examples.push(argumentJson);

          this.classContentList.set(this.classContentList());
        }

        this.isLoading.set(false);
      });
  }

  onRemoveExampleClick(classContent: ClassContent, i: number) {
    classContent.examples.splice(i, 1);
  }

  onRemovePracticeClick(classContent: ClassContent, i: number) {
    classContent.practiceProblems.splice(i, 1);
  }

  onIndexChange(event: number): void {
    this.index.set(event);
  }

  generateClassContent$(topic: string) {
    return this.openaiService
      .getAnswer$(
        [
          {
            role: 'system',
            content: `Generate ${topic} belonging to ${subject} for teaching for a ${prealgebraTarget} student in 1-2 pages providing relevant examples and solution for explanation and practicing with students.`,
          },
        ],
        [
          {
            name: 'generateTeachingContentForStudents',
            description: `Generate the teaching content for students in 1-2 pages. 3 examples and 3 practice problems.`,
            parameters: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                objective: {
                  type: 'string',
                },
                examples: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      question: {
                        type: 'string',
                      },
                      answer: {
                        type: 'string',
                      },
                    },
                  },
                },
                practiceProblems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      question: {
                        type: 'string',
                      },
                    },
                  },
                },
                conclusion: {
                  type: 'string',
                },
              },
            },
          },
        ]
      )
      .pipe(
        map((reponse) => {
          this.isLoading.set(false);
          if (reponse?.answer?.function_call?.arguments) {
            const argumentJson = JSON.parse(
              reponse.answer.function_call.arguments
            );

            argumentJson.target = topic;

            return argumentJson as ClassContent;
          } else {
            return {
              title: '',
              topic: '',
              objective: '',
              examples: [],
              practiceProblems: [],
              conclusion: '',
            };
          }
        })
      );
  }

  onGenerateClassContentClick() {
    this.index.set(1);

    this.isLoading.set(true);

    const filteredTopicOptions = this.algebraTopicsOptions
      .filter((c) => c.checked)
      .map((c) => `${c.label}`);

    const classContentList$ = filteredTopicOptions.map((topic) => {
      return this.generateClassContent$(topic);
    });

    forkJoin(classContentList$)
      .pipe(take(1))
      .subscribe((result) => {
        this.classContentList.set(result);
      });
  }

  onRegenerateClick(classContent: ClassContent) {
    this.isLoading.set(true);

    this.generateClassContent$(classContent.topic)
      .pipe(take(1))
      .subscribe((data: ClassContent) => {
        classContent.title = data.title;
        classContent.conclusion = data.conclusion;
        classContent.examples = data.examples;
        classContent.objective = data.objective;
        classContent.practiceProblems = data.practiceProblems;

        this.classContentList.set(this.classContentList());
        this.isLoading.set(false);
      });
  }

  classContentList = signal<ClassContent[]>([]);
}

export interface ClassContent {
  title: string;
  topic: string;
  objective: string;
  examples: ClassContentExample[];
  practiceProblems: PracticeProblem[];
  conclusion: string;
}

export interface ClassContentExample {
  question: string;
  answer: string;
}

export interface PracticeProblem {
  question: string;
}

const temp = {
  title: 'Negative Numbers in Prealgebra',
  objective:
    'To understand and perform operations with negative numbers in prealgebra',
  examples: [
    {
      question: 'Example 1: Find the sum of -3 and -5.',
      answer:
        'To find the sum of two negative numbers, we add their absolute values and put a negative sign in front. In this case, |-3| + |-5| = 3 + 5 = 8. Therefore, the sum of -3 and -5 is -8.',
    },
    {
      question: 'Example 2: Subtract -7 from -2.',
      answer:
        'To subtract a negative number, we can convert it to addition and change the sign. So, -2 - (-7) = -2 + 7 = 5. Therefore, subtracting -7 from -2 gives us 5.',
    },
    {
      question: 'Example 3: Multiply -6 by -4.',
      answer:
        'When we multiply two negative numbers, the result is always positive. So, -6 times -4 is equal to |-6| * |-4| = 6 * 4 = 24. Therefore, -6 multiplied by -4 is 24.',
    },
  ],
  practiceProblems: [
    {
      question: 'Practice Problem 1: Find the sum of -12 and -8.',
    },
    {
      question: 'Practice Problem 2: Subtract -3 from -10.',
    },
    {
      question: 'Practice Problem 3: Multiply -5 by -2.',
    },
  ],
  conclusion:
    'In prealgebra, negative numbers are used to represent values less than zero. We can perform addition, subtraction, and multiplication operations with negative numbers by following certain rules. Adding two negative numbers gives a negative result, subtracting a negative number is equivalent to adding it, and multiplying two negative numbers gives a positive result. It is important to always pay attention to the signs and correctly apply the rules when working with negative numbers.',
};
