import * as L from 'lodash';
import { GlobalJson, GlobalJsonToJsonOption } from '../global-json/global-json';

class GlobalPrinter {
  constructor({ indentationSize }: { indentationSize?: number } = {}) {
    this.indentationSize = indentationSize ?? 4;
  }
  /*
   * MARK: parts
   */

  private parts: string[] = [];

  private append(s: any) {
    this.parts.push(s);
  }

  get result() {
    return this.parts.join('');
  }

  /*
   * MARK: indentation
   */

  private indentationLevel: number = 0;
  private indentationSize: number = 4;

  private indentation() {
    return ' '.repeat(this.indentationLevel * this.indentationSize);
  }

  public indented(callback: () => void) {
    this.indentationLevel += 1;
    callback();
    this.indentationLevel -= 1;
  }

  /*
   * MARK: print
   */

  private newLine: boolean = true;

  public nextLine() {
    this.append('\n');
    this.newLine = true;
  }

  private printInLine(content: string) {
    if (this.newLine) {
      this.append(this.indentation());
    }
    this.append(content);
    this.newLine = false;
  }

  public print(content: string) {
    if (L.isEmpty(content)) {
      return;
    }

    const lines = content.split('\n');
    while (lines.length > 1) {
      if (L.last(lines)?.trim() === '') {
        lines.pop();
      } else {
        break;
      }
    }

    const [firstLine, ...restLines] = lines;
    this.printInLine(firstLine);
    for (const line of restLines) {
      this.nextLine();
      this.printInLine(line);
    }
  }

  public printData(data: any, options: GlobalJsonToJsonOption = {}) {
    const content = GlobalJson.toJson(data, {
      indentationSize: options.indentationSize || this.indentationSize,
      fieldsPickedForCircularObject: options.fieldsPickedForCircularObject || ['id'],
      fieldsPickedForObject: options.fieldsPickedForObject,
    });
    this.print(content);
  }
}
export default GlobalPrinter;
