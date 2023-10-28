import {
  BatchGetItemInput,
  BatchGetItemOutput,
  BatchWriteItemInput,
  BatchWriteItemOutput,
  DeleteItemInput,
  DeleteItemOutput,
  DynamoDBClient,
  GetItemInput,
  GetItemOutput,
  PutItemInput,
  PutItemOutput,
  QueryInput,
  QueryOutput,
  ScanInput,
  ScanOutput,
  UpdateItemInput,
  UpdateItemOutput,
} from '@aws-sdk/client-dynamodb';
import {
  BatchExecuteStatementCommand,
  BatchGetCommand,
  BatchWriteCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  ExecuteStatementCommand,
  ExecuteStatementCommandOutput,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { injectable } from 'inversify';
import { monitorExecution } from '../../shared/execution-history/execution-monitor.decorator';

@injectable()
export class DynamoNativeService {
  private marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
  };

  private unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
  };

  private translateConfig = { marshallOptions: this.marshallOptions, unmarshallOptions: this.unmarshallOptions };

  private ddbClient = new DynamoDBClient({ region: 'us-east-2' });

  // Create the DynamoDB Document client.
  private readonly ddbDocClient = DynamoDBDocumentClient.from(this.ddbClient, this.translateConfig);

  runPartiQLList(queryList: string[]) {
    const params = {
      Statements: queryList.map((c) => ({ Statement: c })),
    };

    const command = new BatchExecuteStatementCommand(params);

    return this.ddbDocClient.send(command);
  }

  runPartiQL(query: string) {
    const command = new ExecuteStatementCommand({ Statement: query });
    return this.ddbDocClient.send(command);
  }

  async getByPartiQL(
    table: { name: string; indexName?: string },
    whereClause?: string,
    selectClause = '*',
    nextToken?: string
  ): Promise<ExecuteStatementCommandOutput> {
    let statement = `SELECT ${selectClause} FROM "${table.name}`;

    if (table.indexName) {
      statement = `${statement}"."${table.indexName}"`;
    } else {
      statement = `${statement}"`;
    }

    if (whereClause) {
      statement = `${statement} WHERE ${whereClause}`;
    }

    const command = new ExecuteStatementCommand({ Statement: statement, NextToken: nextToken });

    return this.ddbDocClient.send(command);
  }

  public async get(params: GetItemInput): Promise<GetItemOutput> {
    const command = new GetCommand(params);
    return this.ddbDocClient.send(command);
  }

  public async batchGet(params: BatchGetItemInput): Promise<BatchGetItemOutput> {
    const command = new BatchGetCommand(params);
    return this.ddbDocClient.send(command);
  }

  public async scan(params: ScanInput): Promise<ScanOutput> {
    const command = new ScanCommand(params);
    return this.ddbDocClient.send(command);
  }

  public async query(params: QueryInput): Promise<QueryOutput> {
    const command = new QueryCommand(params);
    return this.ddbDocClient.send(command);
  }

  @monitorExecution()
  public async put(params: PutItemInput): Promise<PutItemOutput> {
    const command = new PutCommand(params);
    return this.ddbDocClient.send(command);
  }

  @monitorExecution()
  public async batchWrite(params: BatchWriteItemInput): Promise<BatchWriteItemOutput> {
    const command = new BatchWriteCommand(params);
    return this.ddbDocClient.send(command);
  }

  @monitorExecution()
  public async update(params: UpdateItemInput): Promise<UpdateItemOutput> {
    const command = new UpdateCommand(params);
    return this.ddbDocClient.send(command);
  }

  @monitorExecution()
  public async delete(params: DeleteItemInput): Promise<DeleteItemOutput> {
    const command = new DeleteCommand(params);
    return this.ddbDocClient.send(command);
  }
}
