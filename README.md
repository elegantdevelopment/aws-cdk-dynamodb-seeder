# aws-cdk-dynamodb-seeder

![Node.js CI](https://github.com/elegantdevelopment/aws-cdk-dynamodb-seeder/workflows/Node.js%20CI/badge.svg)
[![codecov](https://codecov.io/gh/elegantdevelopment/aws-cdk-dynamodb-seeder/branch/master/graph/badge.svg)](https://codecov.io/gh/elegantdevelopment/aws-cdk-dynamodb-seeder)
[![npm version](https://badge.fury.io/js/aws-cdk-dynamodb-seeder.svg)](https://badge.fury.io/js/aws-cdk-dynamodb-seeder)
[![npm](https://img.shields.io/npm/dt/aws-cdk-dynamodb-seeder)](https://www.npmjs.com/package/aws-cdk-dynamodb-seeder)

A simple CDK JSON seeder for DynamoDB

## Why this package

Glad you asked!

Using [AWS CDK] for automating infratructure deployments is an amazing way of integrating the development and operations into one process and one codebase.

However, building dev or test environments that come pre-populated with data can be tricky, especially when using [Amazon DynamoDB].

## How do I use it

Install using your favourite package manager:

```sh
yarn add aws-cdk-dynamodb-seeder
```

### Example usage

```ts
import { Seeder } from 'aws-cdk-dynamodb-seeder';
...
const myTable = new Table(stack, "MyTable", {
    tableName: "MyTable",
    partitionKey: { name: "Id", type: AttributeType.STRING },
});
...
new Seeder(stack, "MySeeder", {
    table: myTable,
    tableName: "MyTable",
    setup: require("./items-to-put.json"),
    teardown: require("./keys-to-delete.json"),
    refreshOnUpdate: true  // runs setup and teardown on every update, default false
});
```

For a more in-depth example, see: [elegantdevelopment/aws-cdk-dynamodb-seeder-examples](https://github.com/elegantdevelopment/aws-cdk-dynamodb-seeder-examples).

### Importing seed data

Data passed into `setup` ("Items" to put) or `teardown` ("Keys" to delete) should be an `array` of JavaScript objects (that are, in turn, representations of `string` to [AttributeValue] maps).

* `setup` elements should use the format of `params.Item` from [AWS.DynamoDB.DocumentClient.put()]
* `teardown` elements should use the format of `params.Key` from [AWS.DynamoDB.DocumentClient.delete()]

[aws cdk]: https://aws.amazon.com/cdk
[amazon dynamodb]: https://aws.amazon.com/dynamodb

[AttributeValue]: https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeValue.html
[AWS.DynamoDB.DocumentClient.put()]: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
[AWS.DynamoDB.DocumentClient.delete()]: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#delete-property
