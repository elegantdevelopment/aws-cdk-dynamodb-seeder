import { Stack } from '@aws-cdk/core';
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';
import '@aws-cdk/assert/jest';

import { Seeder } from '../lib/index';

it('seeds a table from required json files', () => {
  const stack = new Stack();
  new Seeder(stack, 'Seeder', {
    table: new Table(stack, 'TestTable', {
      tableName: 'TestTable',
      partitionKey: { name: 'Id', type: AttributeType.STRING },
    }),
    setup: require('./put.json'),
    teardown: require('./delete.json'),
    refreshOnUpdate: true,
  });

  expect(stack).toHaveResource('AWS::Lambda::Function');
  expect(stack).toHaveResource('AWS::S3::Bucket');
});

it('seeds a table from inline arrays', () => {
  const stack = new Stack();
  new Seeder(stack, 'Seeder', {
    table: new Table(stack, 'TestTable', {
      tableName: 'TestTable',
      partitionKey: { name: 'Id', type: AttributeType.STRING },
    }),
    setup: [
      {
        id: 'herewego...',
        this: 'is a test',
        testing: {
          testing: 123,
        },
      },
      {
        id: 'greatest show',
        this: 'is a the greatest show',
      },
    ],
    teardown: [
      {
        id: 'greatest show',
      },
    ],
    refreshOnUpdate: true,
  });

  expect(stack).toHaveResource('AWS::Lambda::Function');
  expect(stack).toHaveResource('AWS::S3::Bucket');
});
