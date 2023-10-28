import { Duration, aws_lambda as lambda, aws_s3 as s3, aws_secretsmanager as secretsmanager } from 'aws-cdk-lib';
import { Alarm, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { LambdaDeploymentConfig, LambdaDeploymentGroup } from 'aws-cdk-lib/aws-codedeploy';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Code, FunctionUrlAuthType, Runtime, S3Code } from 'aws-cdk-lib/aws-lambda';
import { FilterPattern, ILogGroup, LogGroup, MetricFilter } from 'aws-cdk-lib/aws-logs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
import { environment } from '../environment';

export class LambdaFunctionUtils {
  lambdaCode: S3Code;
  lambdaEnvironment: any;
  scope: Construct;
  layer: lambda.LayerVersion;

  mySecret: secretsmanager.ISecret;

  constructor(scope: Construct, lambdaEnvironment?: any) {
    // The code will be uploaded to this location during the pipeline's build step
    const artifactBucket = s3.Bucket.fromBucketName(scope, 'ArtifactBucket', process.env.S3_BUCKET!);
    const artifactKey = `${process.env.CODEBUILD_BUILD_ID}/function-code.zip`;
    this.lambdaCode = Code.fromBucket(artifactBucket, artifactKey);

    this.lambdaEnvironment = lambdaEnvironment;
    this.scope = scope;

    const layerKey = `${process.env.CODEBUILD_BUILD_ID}/node_modules.zip`;
    const layerCode = Code.fromBucket(artifactBucket, layerKey);

    // Create layer
    const layerVersionName = `${environment.build}-node_modules-layer-${environment.projectName}`;
    this.layer = new lambda.LayerVersion(scope, layerVersionName, {
      layerVersionName,
      code: layerCode,
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'A layer to test the L2 construct',
    });

    this.mySecret = secretsmanager.Secret.fromSecretPartialArn(
      this.scope,
      'SecretFromPartialArn',
      `arn:aws:secretsmanager:us-east-2:778684586574:secret:${environment.build}/teacher-assistant`
    );
  }

  getFullFunctionName(lambdaName: string) {
    return `${environment.build}-${lambdaName}-${environment.projectName}`;
  }

  getFuncProps(functionName: string, description: string, handlerSrc: string, timeout: Duration = Duration.seconds(50)) {
    const handler = `dist/backend/src/handlers/${handlerSrc}.handler`;

    return {
      functionName,
      description,
      handler,
      memorySize: 2000,
      runtime: Runtime.NODEJS_18_X,
      code: this.lambdaCode,
      environment: this.lambdaEnvironment,
      timeout,
      layers: [this.layer],
      architecture: Architecture.ARM_64,
      tracing: environment.build === 'prod' ? undefined : lambda.Tracing.ACTIVE,
    };
  }

  createLambdaFunction(
    lambdaName: string,
    handlerSrc: string,
    description = '',
    config?: { provisionedConcurrency?: number; timeout?: Duration; needFunctionUrl?: boolean }
  ): lambda.Function {
    const functionName = this.getFullFunctionName(lambdaName);

    const lambdaFunction = new lambda.Function(
      this.scope,
      functionName,
      this.getFuncProps(functionName, description, handlerSrc, config?.timeout)
    );

    this.mySecret.grantRead(lambdaFunction);

    /* 
      Add the permision to all lambda functions:
        1. send oncall error emails
        2. create scheduler
    */
    lambdaFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['ses:SendEmail', 'SES:SendRawEmail', 'scheduler:CreateSchedule', 'scheduler:DeleteSchedule', 'iam:PassRole'],
        resources: ['*'],
        effect: Effect.ALLOW,
      })
    );

    if (config?.provisionedConcurrency && environment.build === 'prod') {
      // used to make sure each CDK synthesis produces a different Version
      const version = lambdaFunction.currentVersion;

      const alias = new lambda.Alias(this.scope, `${lambdaName}-LambdaAlias`, {
        aliasName: environment.build,
        version,
        // Set provisioned concurrency.
        provisionedConcurrentExecutions: environment.build === 'prod' ? config?.provisionedConcurrency : undefined,
      });

      new LambdaDeploymentGroup(this.scope, `${lambdaName}-DeploymentGroup`, {
        alias,
        deploymentConfig: LambdaDeploymentConfig.ALL_AT_ONCE,
      });

      if (config?.needFunctionUrl) {
        alias.addFunctionUrl({
          authType: FunctionUrlAuthType.NONE,
          cors: {
            allowedHeaders: ['*'],
            allowedOrigins: ['*'],
            allowedMethods: [lambda.HttpMethod.POST],
          },
        });
      }
    } else {
      if (config?.needFunctionUrl) {
        lambdaFunction.addFunctionUrl({
          authType: FunctionUrlAuthType.NONE,
          cors: {
            allowedHeaders: ['*'],
            allowedOrigins: ['*'],
            allowedMethods: [lambda.HttpMethod.POST],
          },
        });
      }
    }

    return lambdaFunction;
  }

  createLogGroup(lambdaName: string) {
    const functionName = this.getFullFunctionName(lambdaName);
    const logGroupName = `/aws/lambda/${functionName}`;
    const logGroup = new LogGroup(this.scope, `${functionName}-logGroup`, {
      logGroupName,
    });

    /* TODO: Not working
    new LogRetention(this.scope, `${functionName}-logRetention`, {
      logGroupName,
      retention: RetentionDays.THREE_MONTHS,
    });
    */

    return logGroup;
  }

  createMetricAndAlarm(
    lambdaName: string,
    logGroup: ILogGroup,
    logType: LogType,
    threshold: number,
    evaluationPeriods: number,
    treatMissingData: TreatMissingData = TreatMissingData.IGNORE
  ) {
    const mf = new MetricFilter(this.scope, `${logType}-${lambdaName}-metricFilter`, {
      metricName: `${logType}-${lambdaName}-metricFilter`,
      logGroup,
      metricNamespace: environment.projectName,
      filterPattern: FilterPattern.allTerms(logType), // FilterPattern.stringValue('$.logType', '=', logType),
      metricValue: '1',
      defaultValue: 0,
    });
    // expose a metric from the metric filter
    const metric = mf.metric();

    // you can use the metric to create a new alarm
    const alarm = new Alarm(this.scope, `${logType}-${lambdaName}-alarm`, {
      alarmName: `${logType}-${lambdaName}-alarm`,
      metric,
      threshold,
      evaluationPeriods,
      treatMissingData,
      actionsEnabled: true,
    });

    const topic = new Topic(this.scope, `${environment.build}-topic-${environment.projectName}`, {
      displayName: `${environment.build}-topic-${environment.projectName}`,
    });

    environment.oncallEmailList.forEach((email: string) => {
      topic.addSubscription(new EmailSubscription(email));
    });

    alarm.addAlarmAction(new SnsAction(topic));
  }
}

export enum LogType {
  unexpectedError = 'UnexpectedError',
}
