export class ExecutionNode {
  resource: string;

  params: any[];

  children: ExecutionNode[];

  returnValue?: any;

  err?: Error;

  constructor(resource: string) {
    this.resource = resource;
    this.params = [];
    this.children = [];
  }
}
