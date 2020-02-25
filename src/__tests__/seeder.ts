import { Stack } from '@aws-cdk/core';
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';
import '@aws-cdk/assert/jest';

import { Seeder } from '../index';

test('creates a custom resource to seed a table', () => {
  const stack = new Stack();
  new Seeder(stack, 'Seeder', {
    table: new Table(stack, 'TestTable', {
      tableName: 'TestTable',
      partitionKey: { name: 'Id', type: AttributeType.STRING },
    }),
    tableName: 'TestTable',
    setup: require('./put.json'),
    teardown: require('./delete.json'),
    refreshOnUpdate: true,
  });

  expect(stack).toHaveResource('AWS::Lambda::Function');
  expect(stack).toHaveResource('AWS::S3::Bucket');
});
