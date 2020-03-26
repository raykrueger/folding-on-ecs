import { expect as expectCDK, matchTemplate, MatchStyle, haveResource, countResourcesLike } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import {FoldingAtHome} from '../lib/index'

//added so I could verify it is safe to remove my default vpc, and let the ecs.Cluster do it
test('Creates Default VPC', () => {
  const app = new cdk.App();
  class TestStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
      const cluster = new FoldingAtHome(this, 'FoldingAtHome');
    }
  }

  const stack = new TestStack(app, 'TestStack');

  expectCDK(stack).to(haveResource("AWS::EC2::VPC"));
});

test('Deploys default image', () => {
  const app = new cdk.App();

  class TestStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
      const cluster = new FoldingAtHome(this, 'FoldingAtHome');
    }
  }

  const stack = new TestStack(app, 'TestStack');

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
  const app = new cdk.App();

  class TestStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

      const cluster = new FoldingAtHome(this, 'FoldingAtHome', {
        image: ecs.RepositoryImage.fromRegistry('example/example')
      });
    }
  }

  const stack = new TestStack(app, 'TestStack');

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
