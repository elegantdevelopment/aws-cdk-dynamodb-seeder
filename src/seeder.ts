import { Construct } from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
import { AwsCustomResource } from '@aws-cdk/custom-resources';
import { Converter, BatchWriteItemInput, WriteRequest } from 'aws-sdk/clients/dynamodb';

export interface Props {
  table: Table;
  tableName: string;
  json: object;
  teardown?: boolean;
}

interface SDKCall {
  service: string;
  action: string;
  apiVersion: string;
  physicalResourceId: string;
  parameters: BatchWriteItemInput;
}

export class Seeder extends Construct {
  protected props: Props;
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);
    this.props = props;
    new AwsCustomResource(this, 'Seeder', {
      onCreate: this.batchPut(),
      // onDelete: props.teardown ? this.batchDelete() : undefined,
    });
  }
  protected batchPut(): SDKCall {
    return {
      ...this.batchWriteOptions(),
      parameters: {
        RequestItems: {
          [this.props.tableName]: this.convertToBatchPut(this.props.json),
        },
      },
    };
  }
  protected batchWriteOptions() {
    return {
      service: 'DynamoDB',
      action: 'batchWriteItem',
      apiVersion: '2012-08-10',
      physicalResourceId: `${this.props.table.tableArn}Seeder`,
    };
  }
  protected convertToBatchPut(data: any): WriteRequest[] {
    if (typeof data === 'object') data = [data];
    else if (!Array.isArray(data)) throw new Error('supplied data must be a JSON object or an array of JSON objects');
    return data.map((record: { [key: string]: any }) => {
      return {
        PutRequest: {
          Item: Converter.marshall(record),
        },
      };
    });
  }
}
