export abstract class Table {
  protected _ddb;
  protected _docClient;
  constructor(ddb, docClient) {
    this._ddb = ddb;

    this._docClient = docClient;
  }

  public abstract getItemList();
  public abstract getTableName(): string;

  public async initData() {
    const itemList = await this.getItemList();
    for (const item of itemList) {
      const params = {
        TableName: this.getTableName(),
        Item: item,
      };

      // Call DynamoDB to add the item to the table
      await this._docClient.put(params).promise();
      await timer(300);
    }
  }
}

export function timer(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
