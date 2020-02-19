"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const core_1 = require("@aws-cdk/core");
const custom_resources_1 = require("@aws-cdk/custom-resources");
class Seeder extends core_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const parameters = {
            RequestItems: {},
        };
        parameters.RequestItems[props.tableName] = this.convertToDynamoJson(props.json);
        new custom_resources_1.AwsCustomResource(this, 'Seeder', {
            onCreate: {
                service: 'DynamoDB',
                action: 'batchWriteItem',
                apiVersion: '2012-08-10',
                physicalResourceId: `${props.table.tableArn}Seeder`,
                parameters,
            },
        });
    }
    convertToDynamoJson(data) {
        if (Array.isArray(data))
            return this.marshall(data);
        if (typeof data === 'object')
            return this.marshall([data]);
        throw new Error('supplied data must be a JSON object or an array of JSON objects');
    }
    marshall(data) {
        return data.map(record => {
            return {
                PutRequest: {
                    Item: aws_sdk_1.DynamoDB.Converter.marshall(record),
                },
            };
        });
    }
}
exports.Seeder = Seeder;
