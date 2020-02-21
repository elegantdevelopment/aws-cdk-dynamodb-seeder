import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
import { Function, Runtime, Code } from '@aws-cdk/aws-lambda';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import * as tmp from 'tmp';
import * as fs from 'fs';

export interface Props {
  table: Table;
  tableName: string;
  setup: Item[];
  teardown?: ItemKey[];
  refreshOnUpdate?: boolean;
}

interface ItemKey {
  [key: string]: string | number;
}

interface Item {
  [key: string]: any;
}

export class Seeder extends Construct {
  protected props: Props;
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);
    if (!props.setup || !Array.isArray(props.setup)) throw new Error('setup value must be an array of JSON objects');
    if (props.teardown && !Array.isArray(props.teardown))
      throw new Error('teardown value must be an array of JSON objects or undefined');
    this.props = props;

    const destinationBucket = new Bucket(this, 'acds-bucket', {
      removalPolicy: RemovalPolicy.DESTROY
    });
    tmp.setGracefulCleanup();
    tmp.dir((err, dir) => {
      if (err) throw err;
      this.writeTempFile(dir, "setup.json", props.setup);
      if (props.teardown) {
        this.writeTempFile(dir, "teardown.json", props.teardown);
      }
      new BucketDeployment(this, id, {
        sources: [Source.asset(dir)],
        destinationBucket,
      });
    });

    const setupFn = new Function(this, 'setup', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: Code.fromInline(`
console.log('function loaded');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async () => {
  console.log('reading from s3');
  const setup = await s3.getObject({
    Bucket: "${destinationBucket.bucketName}", 
    Key: "setup.json"
  }).promise();
  console.log('finished reading from s3');
  
  console.log('transforming seed data');
  const seed = JSON.parse(setup.Body.toString());
  console.log('finished transforming seed data');
  
  const documentClient = new AWS.DynamoDB.DocumentClient();
  console.log('sending data to dynamodb');
  for(let i = 0; i < seed.length;i++) {
    console.log(\`putting #$\{i+1\}\`);
    await documentClient.put({
      TableName: '${props.tableName}',
      Item: seed[i]
    }).promise();
  };
  console.log('finished sending data to dynamodb');
}`),
    });
    destinationBucket.grantRead(setupFn);
    props.table.grantWriteData(setupFn);

    const teardownFn = new Function(this, 'teardown', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: Code.fromInline(`
console.log('function loaded');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async () => {
  console.log('reading from s3');
  const setup = await s3.getObject({
    Bucket: "${destinationBucket.bucketName}", 
    Key: "teardown.json"
  }).promise();
  console.log('finished reading from s3');
  
  console.log('transforming seed data');
  const seed = JSON.parse(setup.Body.toString());
  console.log('finished transforming seed data');
  
  const documentClient = new AWS.DynamoDB.DocumentClient();
  console.log('sending data to dynamodb');
  for(let i = 0; i < seed.length;i++) {
    console.log(\`deleting #$\{i+1\}\`);
    await documentClient.delete({
      TableName: '${props.tableName}',
      Key: seed[i]
    }).promise();
  };
  console.log('finished sending data to dynamodb');
}`),
    });
    destinationBucket.grantRead(teardownFn);
    props.table.grantWriteData(teardownFn);
  }

  private writeTempFile(dir: string, filename: string, data: any) {
    const buffer = Buffer.from(JSON.stringify(data));
    const filepath = dir + '/' + filename;
    fs.writeFileSync(filepath, buffer);
  }
}
