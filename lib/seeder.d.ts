import { DynamoDB } from 'aws-sdk';
import { Construct } from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
export interface Props {
    table: Table;
    tableName: string;
    json: object;
}
export declare class Seeder extends Construct {
    constructor(scope: Construct, id: string, props: Props);
    protected convertToDynamoJson(data: any): {
        PutRequest: {
            Item: DynamoDB.AttributeMap;
        };
    }[];
    protected marshall(data: object[]): {
        PutRequest: {
            Item: DynamoDB.AttributeMap;
        };
    }[];
}
