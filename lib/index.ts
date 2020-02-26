import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
import { Function, Runtime, Code } from '@aws-cdk/aws-lambda';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { AwsCustomResource, AwsSdkCall } from '@aws-cdk/custom-resources';
import * as tmp from 'tmp';
import * as fs from 'fs';

export interface Props {
  readonly table: Table;
  readonly tableName: string;
  readonly setup: Item[];
  readonly teardown?: ItemKey[];
  readonly refreshOnUpdate?: boolean;
}

export interface ItemKey {
  [key: string]: string | number;
}

export interface Item {
  [key: string]: any;
}

export class Seeder extends Construct {
  protected props: Props;
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);
    if (!props.setup || !Array.isArray(props.setup)) throw new Error('setup value must be an array of JSON objects');
    this.props = props;

    const destinationBucket = new Bucket(this, 'acds-bucket', {
      removalPolicy: RemovalPolicy.DESTROY,
    });
    tmp.setGracefulCleanup();
    tmp.dir((err, dir) => {
      if (err) throw err;
      this.writeTempFile(dir, 'setup.json', props.setup);
      if (props.teardown) {
        this.writeTempFile(dir, 'teardown.json', props.teardown);
      }
      new BucketDeployment(this, id, {
        sources: [Source.asset(dir)],
        destinationBucket,
        retainOnDelete: false,
      });
    });

    const fn = new Function(this, 'handler', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: Code.fromInline(`
console.log('function loaded');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const writeTypeFromAction = (action) => {
  if (action === "put")
    return "Item";
  if (action === "delete")
    return "Key";
}

const run = async (filename, action) => {
  console.log('reading from s3');
  const data = await s3.getObject({
    Bucket: "${destinationBucket.bucketName}", 
    Key: filename
  }).promise();
  console.log('finished reading from s3');
  
  console.log('transforming seed data');
  const seed = JSON.parse(data.Body.toString());
  console.log('finished transforming seed data');
  
  const documentClient = new AWS.DynamoDB.DocumentClient();
  console.log('sending data to dynamodb');
  for(let i = 0; i < seed.length;i++) {
    await documentClient[action]({
      TableName: '${props.tableName}',
      [writeTypeFromAction(action)]: seed[i]
    }).promise();
  };
  console.log('finished sending data to dynamodb');
}

exports.handler = async (event) => {
  if (event.mode === "delete" || event.mode === "update")
    await run("teardown.json", "delete");
  if (event.mode === "create" || event.mode === "update")
    await run("setup.json", "put");
}`),
    });
    destinationBucket.grantRead(fn);
    props.table.grantWriteData(fn);

    const onEvent = new AwsCustomResource(this, 'on-event', {
      onCreate: {
        ...this.callLambdaOptions(),
        parameters: {
          FunctionName: fn.functionArn,
          InvokeArgs: JSON.stringify({
            mode: 'create',
          }),
        },
      },
      onDelete: props.teardown
        ? {
            ...this.callLambdaOptions(),
            parameters: {
              FunctionName: fn.functionArn,
              InvokeArgs: JSON.stringify({
                mode: 'delete',
              }),
            },
          }
        : undefined,
      onUpdate: props.refreshOnUpdate
        ? {
            ...this.callLambdaOptions(),
            parameters: {
              FunctionName: fn.functionArn,
              InvokeArgs: JSON.stringify({
                mode: 'update',
              }),
            },
          }
        : undefined,
    });
    fn.grantInvoke(onEvent);
  }

  private callLambdaOptions(): AwsSdkCall {
    return {
      service: 'Lambda',
      action: 'invokeAsync',
      apiVersion: '2015-03-31',
      physicalResourceId: `${this.props.table.tableArn}-seeder`,
    };
  }

  private writeTempFile(dir: string, filename: string, data: Item[] | ItemKey[]): void {
    const buffer = Buffer.from(JSON.stringify(data));
    const filepath = dir + '/' + filename;
    fs.writeFileSync(filepath, buffer);
  }
}
