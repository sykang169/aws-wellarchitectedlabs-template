#!/usr/bin/env node
import autoscaling = require('@aws-cdk/aws-autoscaling');
import ec2 = require('@aws-cdk/aws-ec2');
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
import cdk = require('@aws-cdk/core');
import { DatabaseInstance } from '@aws-cdk/aws-rds';
import { SecretValue, CfnOutput } from '@aws-cdk/core';
import rds = require('@aws-cdk/aws-rds');
import { Peer } from '@aws-cdk/aws-ec2';

class WellArchitectedFrameworkLabs extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
    super(app, id);

    const vpc = new ec2.Vpc(this, 'VPC');

    const databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: 'Allow ssh access to db instances',
      allowAllOutbound: true   // Can be set to false
    });
    databaseSecurityGroup.addIngressRule(Peer.anyIpv4(), ec2.Port.tcp(3306));

    const ec2instanceuserdata = ec2.UserData.custom("#include https://s3.amazonaws.com/immersionday-labs/bootstrap.sh");

    const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage(),
      minCapacity: 2,
      maxCapacity: 4,
      userData: ec2instanceuserdata,
    });

    const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      internetFacing: true
    });

    const listener = lb.addListener('Listener', {
      port: 80,
    });

    listener.addTargets('Target', {
      port: 80,
      targets: [asg]
    });


    listener.connections.allowDefaultPortFromAnyIpv4('Open to the world');

    asg.scaleOnRequestCount('AModestLoad', {
      targetRequestsPerSecond: 1
    });

    const instance = new DatabaseInstance(this, 'Instance', {
      engine: rds.DatabaseInstanceEngine.MYSQL,
      instanceClass: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.SMALL),
      masterUsername: 'awsuser',
      masterUserPassword: SecretValue.plainText('awspassword'),
      databaseName: 'rdscluster',
      securityGroups: [databaseSecurityGroup],
      vpc
    });
    // Allow connections on default port from any IPV4
    instance.connections.allowDefaultPortFromAnyIpv4();


    // Output
    new CfnOutput(this, 'ALB-DNS', {
      value: lb.loadBalancerDnsName,
      description: 'The address of an ApplicationLoadBalancer', // Optional
      exportName: 'albdnsaddress', // Registers a CloudFormation export named "albaddress"
    });
    new CfnOutput(this, 'RDS-DNS', {
      value: instance.dbInstanceEndpointAddress,
      description: 'The address of RDS', // Optional
      exportName: 'rdsaddress', // Registers a CloudFormation export named "albaddress"
    });
  }
}

const app = new cdk.App();
new WellArchitectedFrameworkLabs(app, 'WellArchitectedFrameworkLabsStack');
app.synth();
