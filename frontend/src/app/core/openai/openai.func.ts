import { Parser } from '@json2csv/plainjs';
import { BlockItem } from '../block-item/block-item';
import { BlockItemFuncs } from '../block-item/block-item.func';
import { BoardTypeBackend } from '../board/board-type.backend';
import { BoardFuncs } from '../board/board.func';
import { TaskSettingsBackend } from '../task/task-settings.backend';
import { Task } from '../task/task.frontend';
import { OpenaiMessage } from './openai';

function getSummarizeTask(task: Task): OpenaiMessage[] {
  const title = task.title;
  const description = BlockItemFuncs.getBlockItemText(task.blockItemList);

  const content = `Summarize the task titled "${title}" with the following description: """\n${description}\n""".`;

  return [{ role: 'user', content }];
}

function getAutoCompleteTask(task: Task): OpenaiMessage[] {
  const title = task.title;
  const description = BlockItemFuncs.getBlockItemText(task.blockItemList);

  const content = `Auto-complete the task titled "${title}" with the following description: """\n${description}\n""".`;

  return [{ role: 'user', content }];
}

function getSummarizeContentList(
  board: { type?: BoardTypeBackend; userBoardConfig?: { preferredName: string }; title?: string },
  taskList: { id: string; title?: string; description?: string; settings?: any }[],
  blockItemList: any[]
): OpenaiMessage[] {
  let taskDetails: {
    title: string;
    description: string;
  }[] = [];

  // Similar Code: getTaskContentList
  taskList.forEach((task) => {
    let taskSummary: string | undefined = undefined;

    if (task.settings) {
      const taskSettings = task.settings as TaskSettingsBackend;
      taskSummary = taskSettings.summary;
    }

    if (!taskSummary) {
      taskSummary = '';
      const taskRelatedBlockItemList = blockItemList.filter(
        (blockItem) => task.id === blockItem.locationId ?? blockItem.location?.id
      ) as BlockItem[];

      taskSummary += BlockItemFuncs.getBlockItemText(taskRelatedBlockItemList);

      if (taskSummary.length > 1000) {
        taskSummary = taskSummary.substring(0, 1000);
      }
    }

    taskDetails.push({
      title: task.title ?? '',
      description: taskSummary,
    });
  });

  let csv = '';

  const parser = new Parser();

  if (taskDetails.length > 0) {
    csv = parser.parse(taskDetails);
  }

  if (csv.split(' ').length > 3500) {
    // Only summary task title
    taskDetails = taskList.map((task) => ({
      title: task.title ?? '',
      description: '',
    }));

    csv = parser.parse(taskDetails);

    while (csv.split(' ').length > 3500) {
      const taskStrList = csv.split('\n');
      taskStrList.splice(taskStrList.length - 1, 1);
      csv = taskStrList.join('\n');
    }
  }

  const name = BoardFuncs.getName(board);

  if (csv) {
    const content = `${name} did the following tasks:\n"""\n${csv}\n"""\nSummarize what ${name} did in a paragraph less than 150 words."`;

    return [{ role: 'user', content }];
  }

  return [];
}

export const OpenAiFuncs = { getSummarizeTask, getSummarizeContentList, getAutoCompleteTask };
