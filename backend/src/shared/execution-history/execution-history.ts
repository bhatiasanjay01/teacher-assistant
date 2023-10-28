import * as L from 'lodash';
import { ExecutionNode } from './execution-history.model';

export class ExecutionHistory {
  public static shared: ExecutionHistory = new ExecutionHistory();

  private stack: ExecutionNode[];

  roots: ExecutionNode[];

  constructor() {
    this.stack = [];
    this.roots = [];
  }

  get topNode() {
    return L.last(this.stack);
  }

  enterChild(resource: string, params: any[] = []) {
    const node = new ExecutionNode(resource);
    node.params = params;
    if (L.isEmpty(this.stack)) {
      this.roots.push(node);
    } else {
      this.topNode.children.push(node);
    }
    this.stack.push(node);
  }

  leaveChild({ returnValue, err }: { returnValue?: any; err?: any }) {
    if (!this.topNode) {
      return;
    }
    this.topNode.returnValue = returnValue;
    this.topNode.err = err;
    this.stack.pop();
  }
}
