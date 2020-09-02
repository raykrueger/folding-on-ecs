import { expect as expectCDK, haveResource, countResourcesLike, SynthUtils } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import {FoldingAtHome} from '../lib/index'
import { Stack } from '@aws-cdk/core';

//added so I could verify it is safe to remove my default vpc, and let the ecs.Cluster do it
test('Creates Default VPC', () => {
  const stack = new Stack();
  new FoldingAtHome(stack, 'FoldingAtHome');
  expectCDK(stack).to(haveResource("AWS::EC2::VPC"));
});

test('Deploys default image', () => {
  const stack = new Stack();
  new FoldingAtHome(stack, 'FoldingAtHome');

  //cdk assert bug? haveResource would not match this, but countResourcesLike works
  expectCDK(stack).to(countResourcesLike('AWS::ECS::TaskDefinition', 1, {
    ContainerDefinitions: [
      {
        Essential: true,
        Image: 'raykrueger/folding-at-home'
      }
    ]
  }));
});

test('Deploys custom image', () => {
  const stack = new Stack();
  new FoldingAtHome(stack, 'FoldingAtHome', {
    image: ecs.RepositoryImage.fromRegistry('example/example')
  });

  //cdk assert bug? haveResource would not match this, but countResourcesLike works
  expectCDK(stack).to(countResourcesLike('AWS::ECS::TaskDefinition', 1, {
    ContainerDefinitions: [
      {
        Essential: true,
        Image: 'example/example'
      }
    ]
  }));
});

test('Snapshot', () => {
  const stack = new Stack();
  new FoldingAtHome(stack, 'FoldingAtHome');

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});