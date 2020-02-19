import { DynamoDB } from 'aws-sdk';
import { Construct } from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
import { AwsCustomResource } from '@aws-cdk/custom-resources';

export interface Props {
  table: Table;
  tableName: string;
  json: object;
}

export class Seeder extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);
    const parameters: any = {
      RequestItems: {},
    };
    parameters.RequestItems[props.tableName] = this.convertToDynamoJson(props.json);
    new AwsCustomResource(this, 'Seeder', {
      onCreate: {
        service: 'DynamoDB',
        action: 'batchWriteItem',
        apiVersion: '2012-08-10',
        physicalResourceId: `${props.table.tableArn}Seeder`,
        parameters,
      },
    });
  }
  protected convertToDynamoJson(data: any) {
    if (Array.isArray(data)) return this.marshall(data);
    if (typeof data === 'object') return this.marshall([data]);
    throw new Error('supplied data must be a JSON object or an array of JSON objects');
  }
  protected marshall(data: object[]) {
    return data.map(record => {
      return {
        PutRequest: {
          Item: DynamoDB.Converter.marshall(record),
        },
      };
    });
  }
}
