import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { App, CfnParameter, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { environment } from '../environment';
import { LambdaFunctionUtils } from './lambda-function';
import { CdkTableList } from './table-list';

export class CdkStack extends Stack {
  private lambdaFunctionUtils: LambdaFunctionUtils;

  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    new CfnParameter(this, 'AppId');

    const lambdaEnvironment = {};
    const cdkTableList = new CdkTableList(this, lambdaEnvironment);

    const tableList = cdkTableList.getTableList();

    this.lambdaFunctionUtils = new LambdaFunctionUtils(this, lambdaEnvironment);

    // Grant the permission for the files bucket.
    const filesBucket = Bucket.fromBucketArn(
      this,
      `teacher-assistant-files-${environment.build}`,
      `arn:aws:s3:::teacher-assistant-files-${environment.build}`
    );

    const helloWorld = this.createPythonLambda(tableList, filesBucket);
    const websiteLambda = this.createWebsiteLambda(tableList, filesBucket);
    const websitePublicLambda = this.createPublicWebsiteLambda(tableList, filesBucket);

    const openAiLambda = this.createOpenAiLambda(tableList);

    const webSocketLambda = this.createWebSocketLambda(tableList);

    const test = this.createTestLambda();

    const webSocketApi = this.createWebSocketApi(webSocketLambda);

    webSocketApi.grantManageConnections(websiteLambda);
    webSocketApi.grantManageConnections(websitePublicLambda);
    webSocketApi.grantManageConnections(openAiLambda);
  }

  private createPythonLambda(tables: Table[], filesBucket: IBucket) {
    const lambdaName = 'hello-world';
    const lambdaFunction = this.lambdaFunctionUtils.createLambdaFunction(lambdaName, `python/${lambdaName}`, 'Python Lambda', {
      provisionedConcurrency: 0,
      needFunctionUrl: true,
    });

    return lambdaFunction;
  }

  private createWebsiteLambda(tables: Table[], filesBucket: IBucket) {
    const lambdaName = 'website';
    const lambdaFunction = this.lambdaFunctionUtils.createLambdaFunction(
      lambdaName,
      lambdaName,
      'Main function to handle all website response.',
      { provisionedConcurrency: 0, needFunctionUrl: true }
    );

    filesBucket.grantReadWrite(lambdaFunction);
    filesBucket.grantDelete(lambdaFunction);

    // Give Full access to all tables
    tables.forEach((table) => {
      lambdaFunction.addToRolePolicy(
        new PolicyStatement({
          actions: ['dynamodb:Query'],
          resources: [`${table.tableArn}/index/*`],
        })
      );
      table.grantFullAccess(lambdaFunction);
    });

    return lambdaFunction;
  }

  private createPublicWebsiteLambda(tables: Table[], filesBucket: IBucket) {
    const lambdaName = 'website-public';
    const lambdaFunction = this.lambdaFunctionUtils.createLambdaFunction(
      lambdaName,
      lambdaName,
      'Main function to handle all website public response.',
      { provisionedConcurrency: 0, needFunctionUrl: true }
    );

    filesBucket.grantReadWrite(lambdaFunction);
    filesBucket.grantDelete(lambdaFunction);

    // Give Full access to all tables
    tables.forEach((table) => {
      lambdaFunction.addToRolePolicy(
        new PolicyStatement({
          actions: ['dynamodb:Query'],
          resources: [`${table.tableArn}/index/*`],
        })
      );
      table.grantFullAccess(lambdaFunction);
    });

    return lambdaFunction;
  }

  private createTestLambda() {
    const lambdaName = 'test';
    const lambdaFunction = this.lambdaFunctionUtils.createLambdaFunction(lambdaName, lambdaName, 'Call openai function', {
      timeout: Duration.minutes(5),
    });

    lambdaFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      cors: {
        allowedHeaders: ['*'],
        allowedOrigins: ['*'],
        allowedMethods: [lambda.HttpMethod.POST],
      },
    });

    return lambdaFunction;
  }

  private createOpenAiLambda(tables: Table[]) {
    const lambdaName = 'openai';
    const lambdaFunction = this.lambdaFunctionUtils.createLambdaFunction(lambdaName, lambdaName, 'Call openai function', {
      timeout: Duration.minutes(5),
    });

    // Give Full access to all tables
    tables.forEach((table) => {
      lambdaFunction.addToRolePolicy(
        new PolicyStatement({
          actions: ['dynamodb:Query'],
          resources: [`${table.tableArn}/index/*`],
        })
      );
      table.grantFullAccess(lambdaFunction);
    });

    lambdaFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      cors: {
        allowedHeaders: ['*'],
        allowedOrigins: ['*'],
        allowedMethods: [lambda.HttpMethod.POST],
      },
    });

    return lambdaFunction;
  }

  private createWebSocketLambda(tables: Table[]) {
    const lambdaName = 'web-socket';
    const lambdaFunction = this.lambdaFunctionUtils.createLambdaFunction(lambdaName, lambdaName, 'The websocket for Lambda.');

    // Give Full access to all tables
    tables.forEach((table) => {
      lambdaFunction.addToRolePolicy(
        new PolicyStatement({
          actions: ['dynamodb:Query'],
          resources: [`${table.tableArn}/index/*`],
        })
      );
      table.grantFullAccess(lambdaFunction);
    });
    return lambdaFunction;
  }

  private createWebSocketApi(webSocketLambda: any) {
    // set API Gateway
    const webSocketApi = new WebSocketApi(this, `${environment.build}-webSocket-${environment.projectName}`, {
      apiName: `${environment.build}-webSocket-${environment.projectName}`,
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration('ConnectIntegration', webSocketLambda) as any,
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration('DefaultIntegration', webSocketLambda) as any,
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration('DisconnectIntegration', webSocketLambda) as any,
      },
    });

    // tslint:disable-next-line: no-unused-expression
    new WebSocketStage(this, `${environment.build}-webSocket-stage-${environment.projectName}`, {
      webSocketApi,
      stageName: `${environment.build}`,
      autoDeploy: true,
    });

    webSocketApi.addRoute('sendMessage', {
      integration: new WebSocketLambdaIntegration('SendMessageIntegration', webSocketLambda) as any,
    });
    webSocketApi.addRoute('changeCurrentPage', {
      integration: new WebSocketLambdaIntegration('ChangeCurrentPageIntegration', webSocketLambda) as any,
    });

    webSocketApi.grantManageConnections(webSocketLambda);

    return webSocketApi;
  }
}
