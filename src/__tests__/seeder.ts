import { Stack } from '@aws-cdk/core';
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';
import '@aws-cdk/assert/jest';

import { Seeder } from '../seeder';

test('creates a custom resource to seed a table', () => {
  const stack = new Stack();
  new Seeder(stack, 'Seeder', {
    table: new Table(stack, 'TestTable', {
      tableName: 'TestTable',
      partitionKey: { name: 'Id', type: AttributeType.STRING },
    }),
    tableName: 'TestTable',
    json: require('./data.json'),
  });

  expect(stack).toHaveResource('Custom::AWS');
});

test('fails if no json provided', () => {
  const stack = new Stack();

  expect(
    () =>
      new Seeder(stack, 'Seeder', {
        table: new Table(stack, 'TestTable', {
          tableName: 'TestTable',
          partitionKey: { name: 'Id', type: AttributeType.STRING },
        }),
        tableName: 'TestTable',
        json: undefined,
      }),
  ).toThrowError("supplied data must be a JSON object or an array of JSON objects");
});
