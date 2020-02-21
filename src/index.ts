import { Construct } from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
import { AwsCustomResource } from '@aws-cdk/custom-resources';
import { Converter, BatchWriteItemInput, WriteRequest } from 'aws-sdk/clients/dynamodb';

export interface Props {
  table: Table;
  tableName: string;
  setup: Item[];
  teardown?: ItemKey[];
}

interface ItemKey {
  [key: string]: string | number;
}

interface Item {
  [key: string]: any;
}

interface SDKCall {
  service: string;
  action: string;
  apiVersion: string;
  physicalResourceId: string;
  parameters: BatchWriteItemInput;
}

type Mode = 'Delete' | 'Put';
type WriteData = ItemKey | Item;

export class Seeder extends Construct {
  protected props: Props;
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);
    if (!props.setup || !Array.isArray(props.setup)) throw new Error('setup value must be an array of JSON objects');
    if (props.teardown && !Array.isArray(props.teardown))
      throw new Error('teardown value must be an array of JSON objects or undefined');
    this.props = props;
    new AwsCustomResource(this, 'Seeder', {
      onCreate: this.batchWrite('Put'),
      onDelete: props.teardown ? this.batchWrite('Delete') : undefined,
    });
  }
  private batchWrite(mode: Mode): SDKCall {
    return {
      ...this.batchWriteOptions(),
      parameters: {
        RequestItems: {
          [this.props.tableName]: (this.props[this.inputPropKeyFromMode(mode)]! as WriteData[]).map(
            (writeData: WriteData): WriteRequest => {
              return {
                [`${mode}Request`]: {
                  [this.batchWriteTypeFromMode(mode)]: Converter.marshall(writeData),
                },
              };
            },
          ),
        },
      },
    };
  }
  private inputPropKeyFromMode(mode: Mode) {
    return mode === 'Put' ? 'setup' : 'teardown';
  }
  private batchWriteTypeFromMode(mode: Mode) {
    return mode === 'Put' ? 'Item' : 'Key';
  }
  protected batchWriteOptions() {
    return {
      service: 'DynamoDB',
      action: 'batchWriteItem',
      apiVersion: '2012-08-10',
      physicalResourceId: `${this.props.table.tableArn}Seeder`,
    };
  }
}
