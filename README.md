# aws-cdk-dynamodb-seeder

![Node.js CI](https://github.com/elegantdevelopment/aws-cdk-dynamodb-seeder/workflows/Node.js%20CI/badge.svg)

A simple CDK JSON seeder for DynamoDB

## Why this package

Glad you asked!

Using [AWS CDK] for automating infratructure deployments is an amazing way of integrating the development and operations into one process and one codebase.

However, building dev or test environments that come pre-populated with data can be tricky, especially when using [Amazon DynamoDB].

## How do I use it

```ts
new Seeder(stack, 'MySeeder', {
    table: new Table(stack, 'MyTable', {
        tableName: 'MyTable',
        partitionKey: { name: 'Id', type: AttributeType.STRING },
    }),
    tableName: "TestTable",
    json: require("./my-seed-data.json")
});
```

   [AWS CDK]: https://aws.amazon.com/cdk
   [Amazon DynamoDB]: https://aws.amazon.com/dynamodb
