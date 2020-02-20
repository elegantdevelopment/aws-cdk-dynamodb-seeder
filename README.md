# aws-cdk-dynamodb-seeder

![Node.js CI](https://github.com/elegantdevelopment/aws-cdk-dynamodb-seeder/workflows/Node.js%20CI/badge.svg)
[![npm version](https://badge.fury.io/js/aws-cdk-dynamodb-seeder.svg)](https://badge.fury.io/js/aws-cdk-dynamodb-seeder)

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

Here is an implementation example:

```ts
import { Seeder } from 'aws-cdk-dynamodb-seeder';
...
new Seeder(stack, 'MySeeder', {
    table: new Table(stack, 'MyTable', {
        tableName: 'MyTable',
        partitionKey: { name: 'Id', type: AttributeType.STRING },
    }),
    tableName: "TestTable",
    json: require("./my-seed-data.json")
});
```

### Importing seed data

Seed data is imported via a JSON file and can either be a single object or an array of objects.

Just remember that the objects *must* match your table's key definitions.

   [AWS CDK]: https://aws.amazon.com/cdk
   [Amazon DynamoDB]: https://aws.amazon.com/dynamodb
