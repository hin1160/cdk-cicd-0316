import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import { SecretValue } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //VPC
    const vpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16')
    });

    //ECR
    const repository = new ecr.Repository(this, 'Repository');

    //ECS on Fargate
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });

    const executionEcsRole = new iam.Role(this, 'executionEcsRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
    });
    repository.grantPull(executionEcsRole);

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      executionRole: executionEcsRole
    });

    taskDefinition.addContainer('web', {
      image: ecs.ContainerImage.fromRegistry('762233763697.dkr.ecr.ap-northeast-1.amazonaws.com/cdkstack-repository22e53bbd-zoegrdhm3qvy'),
    });

    new ecs.FargateService(this, 'FargateService', {
      cluster,
      taskDefinition,
      minHealthyPercent: 100,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT',
          base: 1,
          weight: 2,
        },
        {
          capacityProvider: 'FARGATE',
          base: 0,
          weight: 1,
        },
      ],
    });

    //CodePipeline
    // const sourceAction = new codepipeline_actions.GitHubSourceAction({
    //   actionName: 'GitHub_Source',
    //   owner: 'hin1160',
    //   repo: 'cdk-cicd-0316',
    //   oauthToken: SecretValue.secretsManager('github_token'),
    //   output: new codepipeline.Artifact(),
    //   branch: 'develop', // default: 'master'
    // });

    // new codepipeline.Pipeline(this, 'Pipeline', {
    //   pipelineType: codepipeline.PipelineType.V2,
    //   stages: [
    //     {
    //       stageName: 'Source',
    //       actions: [sourceAction],
    //     },
    //     {
    //       stageName: 'Build',
    //       actions: [buildAction],
    //     },
    //   ],
    //   triggers: [{
    //     providerType: codepipeline.ProviderType.CODE_STAR_SOURCE_CONNECTION,
    //     gitConfiguration: {
    //       sourceAction,
    //       pushFilter: [{
    //         tagsExcludes: ['exclude1', 'exclude2'],
    //         tagsIncludes: ['include*'],
    //       }],
    //     },
    //   }],
    // });

    //CodeBuild

    //CodeDeploy

    //S3

  }
}
