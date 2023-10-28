import { RemovalPolicy } from 'aws-cdk-lib';
import {
  AttributeType,
  BillingMode,
  GlobalSecondaryIndexProps,
  LocalSecondaryIndexProps,
  StreamViewType,
  Table,
  TableProps,
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { tableNames } from './../../src/core/dynamo/table-names';
import { SharedIndex } from './tables/shared';
import { TeacherAssistantMainCols, TeacherAssistantMainGlobalSecondaryIndexList } from './tables/teacher-assistant-main.table';

export class CdkTableList {
  private _scope: Construct;
  private _lambdaEnvironment: any;

  constructor(scope: Construct, lambdaEnvironment: any) {
    this._scope = scope;
    this._lambdaEnvironment = lambdaEnvironment;
  }

  getTableList() {
    const teacherAssistantMainTable = this.createTable(
      tableNames.TeacherAssistantMainTable,
      TeacherAssistantMainCols.sk,
      TeacherAssistantMainGlobalSecondaryIndexList
    );

    return [teacherAssistantMainTable];
  }

  private createTable(
    tableName: string,
    sortKey?: string,
    globalSecondaryIndexList?: GlobalSecondaryIndexProps[],
    ignoreCreatedTimeIndex?: boolean,
    hasStream?: boolean,
    localSecondaryIndexList?: LocalSecondaryIndexProps[]
  ) {
    const tableProps: TableProps = {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      sortKey: sortKey ? { name: sortKey, type: AttributeType.STRING } : undefined,
      billingMode: BillingMode.PAY_PER_REQUEST,
      // encryption: TableEncryption.DEFAULT,
      // TODO: Not working
      // replicationRegions: isGlobalTable ? ['us-east-1', 'us-east-2', 'us-west-2'] : undefined,
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.RETAIN,
      stream: hasStream ? StreamViewType.NEW_AND_OLD_IMAGES : undefined,
    };

    const table = new Table(this._scope, `${tableName}_`, tableProps);

    if (!ignoreCreatedTimeIndex) {
      table.addGlobalSecondaryIndex({
        indexName: SharedIndex.createdByIdCreatedTimeStrIndex,
        partitionKey: { name: 'createdById', type: AttributeType.STRING },
        sortKey: { name: 'createdTimeStr', type: AttributeType.STRING },
      });
    }

    globalSecondaryIndexList?.forEach((gsi) => {
      table.addGlobalSecondaryIndex(gsi);
    });

    localSecondaryIndexList?.forEach((lsi) => {
      table.addLocalSecondaryIndex(lsi);
    });

    this._lambdaEnvironment[tableName] = table.tableName;
    return table;
  }
}
