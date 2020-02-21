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
    setup: require("./my-seed-data.json")
});
```

### Importing seed data

Seed data is imported/deleted via an arrays of objects. 
Just remember that the objects _must_ match your table's key definitions.

[aws cdk]: https://aws.amazon.com/cdk
[amazon dynamodb]: https://aws.amazon.com/dynamodb
