# Folding on Amazon ECS CDK Construct

This CDK library builds an [Amazon Elastic Container
Service](https://aws.amazon.com/ecs/) GPU Cluster on AWS using Spot
instances, and runs [Folding@Home](https://foldingathome.org/). via the
[raykrueger/FoldingAtHomeContainer](https://github.com/raykrueger/FoldingAtHomeContainer)
container. The container is configured to consume the GPU on each instance in
the cluster.

## Why? COVID-19 of Course

Folding@home, in their own words...

"Folding@home (FAH or F@h) is a distributed computing project for simulating
protein dynamics, including the process of protein folding and the movements
of proteins implicated in a variety of diseases. It brings together citizen
scientists who volunteer to run simulations of protein dynamics on their
personal computers. Insights from this data are helping scientists to better
understand biology, and providing new opportunities for developing
therapeutics."

COVID-19 is ravaging the world right now. The folks at NVIDIA put out a
[call-to-arms](https://twitter.com/NVIDIAGeForce/status/1238496311776653312)
for gamers to fire up their GPUs and put them to work on the new GPU COVID-19
workloads that are ready to run on the Folding@home network.

This inspired me to put this to work on the cloud. If you, or your employer,
are able to spare some compute dollars for this critical need, it is easy to
fire this up and contribute. The cluster uses Spot nodes for incredible
savings over on-demand costs.

For me, personally, I also needed an excuse to force myself to do something
in CDK. That being said, this is the first thing I've built with CDK. Which
means I'm definitely open to feedback on how it could be done better. For
example, I'm beginning to realize that CDK "apps" don't share well.

## How to use it

This library is intended to be used as part of a CDK Stack. For example...

````typescript
import * as cdk from '@aws-cdk/core';
import {FoldingAtHome} from '@raykrueger/folding-on-ecs'

export class FoldingOnEcsStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const cluster = new FoldingAtHome(this, 'FoldingAtHome');
    }
}

const app = new cdk.App();
new FoldingOnEcsStack(app, 'FoldingAtHomeStack');
app.synth();
````

## Example App

See the cdk generated sample app [Folding on
ECS](https://github.com/raykrueger/FoldingOnECS) for an implementation of
this library in an application. The sample application can be cloned and
modified to your hearts content.

### To start your own CDK app

1. Install the [AWS
CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
and configure it using `aws configure`
1. Install the [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)
1. `$ mkdir MyFoldingCluster`
1. `$ cd MyFoldingCluster`
1. `$ cdk init app --language=typescript`
1. `$ npm install @raykrueger/folding-on-ecs`


### Run Tests

````
git clone https://github.com/raykrueger/folding-on-ecs.git
cd folding-on-ecs
npm install
npm run build
npm test
````

### Costs

This runs three g4dn.xlarge instances as spot requests by default. The spot
request is for the base price of that instance in us-east-2, which is $0.52
an hour. Adjust for your region, and budget as needed.

In us-east-2 spot pricing, at the time of this writing, for g4dn.xlarge is
around $0.16 on average. Which means a single g4dn.xlarge will cost about
$117 a month. **The default configuration of three nodes will cost around $351
a month.** There would be additional costs for CloudWatch logs and network
egress as well. I have not yet calculated an estimate for that.

To calculate the average spot price for the past 30 days in a region the following command will work on a mac.

    aws ec2 describe-spot-price-history --region us-east-2 --instance-type g4dn.xlarge --start-time $(date -v-30d "+%Y-%m-%d") --product-descriptions Linux/UNIX | jq '[.SpotPriceHistory[].SpotPrice | tonumber] | length as $l | add / $l'

For linux the date command needs to be changed.

    aws ec2 describe-spot-price-history --region us-east-2 --instance-type g4dn.xlarge --start-time $(date -d "30 days ago" "+%Y-%m-%d") --product-descriptions Linux/UNIX | jq '[.SpotPriceHistory[].SpotPrice | tonumber] | length as $l | add / $l'