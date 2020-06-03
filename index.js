#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const autoscaling = require("@aws-cdk/aws-autoscaling");
const ec2 = require("@aws-cdk/aws-ec2");
const elbv2 = require("@aws-cdk/aws-elasticloadbalancingv2");
const cdk = require("@aws-cdk/core");
const aws_rds_1 = require("@aws-cdk/aws-rds");
const core_1 = require("@aws-cdk/core");
const rds = require("@aws-cdk/aws-rds");
const aws_ec2_1 = require("@aws-cdk/aws-ec2");
class WellArchitectedFrameworkLabs extends cdk.Stack {
    constructor(app, id) {
        super(app, id);
        const vpc = new ec2.Vpc(this, 'VPC');
        const databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
            vpc,
            description: 'Allow ssh access to db instances',
            allowAllOutbound: true // Can be set to false
        });
        databaseSecurityGroup.addIngressRule(aws_ec2_1.Peer.anyIpv4(), ec2.Port.tcp(3306));
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
        const instance = new aws_rds_1.DatabaseInstance(this, 'Instance', {
            engine: rds.DatabaseInstanceEngine.MYSQL,
            instanceClass: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.SMALL),
            masterUsername: 'awsuser',
            masterUserPassword: core_1.SecretValue.plainText('awspassword'),
            databaseName: 'rdscluster',
            securityGroups: [databaseSecurityGroup],
            vpc
        });
        // Allow connections on default port from any IPV4
        instance.connections.allowDefaultPortFromAnyIpv4();
        new core_1.CfnOutput(this, 'ALB-DNS', {
            value: lb.loadBalancerDnsName,
            description: 'The address of an ApplicationLoadBalancer',
            exportName: 'albdnsaddress',
        });
        new core_1.CfnOutput(this, 'RDS-DNS', {
            value: instance.dbInstanceEndpointAddress,
            description: 'The address of an RDS',
            exportName: 'rdsaddress',
        });
    }
}
const app = new cdk.App();
new WellArchitectedFrameworkLabs(app, 'WellArchitectedFrameworkLabsStack');
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBeUQ7QUFDekQsd0NBQXlDO0FBQ3pDLDZEQUE4RDtBQUM5RCxxQ0FBc0M7QUFDdEMsOENBQW9EO0FBQ3BELHdDQUF1RDtBQUN2RCx3Q0FBeUM7QUFDekMsOENBQXdDO0FBRXhDLE1BQU0sNEJBQTZCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDbEQsWUFBWSxHQUFZLEVBQUUsRUFBVTtRQUNsQyxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWYsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVyQyxNQUFNLHFCQUFxQixHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDakYsR0FBRztZQUNILFdBQVcsRUFBRSxrQ0FBa0M7WUFDL0MsZ0JBQWdCLEVBQUUsSUFBSSxDQUFHLHNCQUFzQjtTQUNoRCxDQUFDLENBQUM7UUFDSCxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsY0FBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFekUsTUFBTSxtQkFBbUIsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1FBRXBILE1BQU0sR0FBRyxHQUFHLElBQUksV0FBVyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7WUFDeEQsR0FBRztZQUNILFlBQVksRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUMvRSxZQUFZLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7WUFDeEMsV0FBVyxFQUFFLENBQUM7WUFDZCxXQUFXLEVBQUUsQ0FBQztZQUNkLFFBQVEsRUFBRSxtQkFBbUI7U0FDOUIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtZQUN2RCxHQUFHO1lBQ0gsY0FBYyxFQUFFLElBQUk7U0FDckIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUU7WUFDMUMsSUFBSSxFQUFFLEVBQUU7U0FDVCxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRTtZQUM1QixJQUFJLEVBQUUsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztTQUNmLENBQUMsQ0FBQztRQUdILFFBQVEsQ0FBQyxXQUFXLENBQUMsMkJBQTJCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUV0RSxHQUFHLENBQUMsbUJBQW1CLENBQUMsYUFBYSxFQUFFO1lBQ3JDLHVCQUF1QixFQUFFLENBQUM7U0FDM0IsQ0FBQyxDQUFDO1FBRUgsTUFBTSxRQUFRLEdBQUcsSUFBSSwwQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQ3RELE1BQU0sRUFBRSxHQUFHLENBQUMsc0JBQXNCLENBQUMsS0FBSztZQUN4QyxhQUFhLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFDeEYsY0FBYyxFQUFFLFNBQVM7WUFDekIsa0JBQWtCLEVBQUUsa0JBQVcsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDO1lBQ3hELFlBQVksRUFBRSxZQUFZO1lBQzFCLGNBQWMsRUFBRSxDQUFDLHFCQUFxQixDQUFDO1lBQ3ZDLEdBQUc7U0FDSixDQUFDLENBQUM7UUFDSCxrREFBa0Q7UUFDbEQsUUFBUSxDQUFDLFdBQVcsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1FBRW5ELElBQUksZ0JBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQzdCLEtBQUssRUFBRSxFQUFFLENBQUMsbUJBQW1CO1lBQzdCLFdBQVcsRUFBRSwyQ0FBMkM7WUFDeEQsVUFBVSxFQUFFLGVBQWU7U0FDNUIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxnQkFBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDN0IsS0FBSyxFQUFFLFFBQVEsQ0FBQyx5QkFBeUI7WUFDekMsV0FBVyxFQUFFLHVCQUF1QjtZQUNwQyxVQUFVLEVBQUUsWUFBWTtTQUN6QixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQixJQUFJLDRCQUE0QixDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO0FBQzNFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCBhdXRvc2NhbGluZyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1hdXRvc2NhbGluZycpO1xuaW1wb3J0IGVjMiA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1lYzInKTtcbmltcG9ydCBlbGJ2MiA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyJyk7XG5pbXBvcnQgY2RrID0gcmVxdWlyZSgnQGF3cy1jZGsvY29yZScpO1xuaW1wb3J0IHsgRGF0YWJhc2VJbnN0YW5jZSB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1yZHMnO1xuaW1wb3J0IHsgU2VjcmV0VmFsdWUsIENmbk91dHB1dCB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHJkcyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1yZHMnKTtcbmltcG9ydCB7IFBlZXIgfSBmcm9tICdAYXdzLWNkay9hd3MtZWMyJztcblxuY2xhc3MgV2VsbEFyY2hpdGVjdGVkRnJhbWV3b3JrTGFicyBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKGFwcDogY2RrLkFwcCwgaWQ6IHN0cmluZykge1xuICAgIHN1cGVyKGFwcCwgaWQpO1xuXG4gICAgY29uc3QgdnBjID0gbmV3IGVjMi5WcGModGhpcywgJ1ZQQycpO1xuXG4gICAgY29uc3QgZGF0YWJhc2VTZWN1cml0eUdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdEYXRhYmFzZVNlY3VyaXR5R3JvdXAnLCB7XG4gICAgICB2cGMsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FsbG93IHNzaCBhY2Nlc3MgdG8gZGIgaW5zdGFuY2VzJyxcbiAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUgICAvLyBDYW4gYmUgc2V0IHRvIGZhbHNlXG4gICAgfSk7XG4gICAgZGF0YWJhc2VTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKFBlZXIuYW55SXB2NCgpLCBlYzIuUG9ydC50Y3AoMzMwNikpO1xuXG4gICAgY29uc3QgZWMyaW5zdGFuY2V1c2VyZGF0YSA9IGVjMi5Vc2VyRGF0YS5jdXN0b20oXCIjaW5jbHVkZSBodHRwczovL3MzLmFtYXpvbmF3cy5jb20vaW1tZXJzaW9uZGF5LWxhYnMvYm9vdHN0cmFwLnNoXCIpO1xuXG4gICAgY29uc3QgYXNnID0gbmV3IGF1dG9zY2FsaW5nLkF1dG9TY2FsaW5nR3JvdXAodGhpcywgJ0FTRycsIHtcbiAgICAgIHZwYyxcbiAgICAgIGluc3RhbmNlVHlwZTogZWMyLkluc3RhbmNlVHlwZS5vZihlYzIuSW5zdGFuY2VDbGFzcy5UMiwgZWMyLkluc3RhbmNlU2l6ZS5NSUNSTyksXG4gICAgICBtYWNoaW5lSW1hZ2U6IG5ldyBlYzIuQW1hem9uTGludXhJbWFnZSgpLFxuICAgICAgbWluQ2FwYWNpdHk6IDIsXG4gICAgICBtYXhDYXBhY2l0eTogNCxcbiAgICAgIHVzZXJEYXRhOiBlYzJpbnN0YW5jZXVzZXJkYXRhLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbGIgPSBuZXcgZWxidjIuQXBwbGljYXRpb25Mb2FkQmFsYW5jZXIodGhpcywgJ0xCJywge1xuICAgICAgdnBjLFxuICAgICAgaW50ZXJuZXRGYWNpbmc6IHRydWVcbiAgICB9KTtcblxuICAgIGNvbnN0IGxpc3RlbmVyID0gbGIuYWRkTGlzdGVuZXIoJ0xpc3RlbmVyJywge1xuICAgICAgcG9ydDogODAsXG4gICAgfSk7XG5cbiAgICBsaXN0ZW5lci5hZGRUYXJnZXRzKCdUYXJnZXQnLCB7XG4gICAgICBwb3J0OiA4MCxcbiAgICAgIHRhcmdldHM6IFthc2ddXG4gICAgfSk7XG5cblxuICAgIGxpc3RlbmVyLmNvbm5lY3Rpb25zLmFsbG93RGVmYXVsdFBvcnRGcm9tQW55SXB2NCgnT3BlbiB0byB0aGUgd29ybGQnKTtcblxuICAgIGFzZy5zY2FsZU9uUmVxdWVzdENvdW50KCdBTW9kZXN0TG9hZCcsIHtcbiAgICAgIHRhcmdldFJlcXVlc3RzUGVyU2Vjb25kOiAxXG4gICAgfSk7XG5cbiAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBEYXRhYmFzZUluc3RhbmNlKHRoaXMsICdJbnN0YW5jZScsIHtcbiAgICAgIGVuZ2luZTogcmRzLkRhdGFiYXNlSW5zdGFuY2VFbmdpbmUuTVlTUUwsXG4gICAgICBpbnN0YW5jZUNsYXNzOiBlYzIuSW5zdGFuY2VUeXBlLm9mKGVjMi5JbnN0YW5jZUNsYXNzLkJVUlNUQUJMRTIsIGVjMi5JbnN0YW5jZVNpemUuU01BTEwpLFxuICAgICAgbWFzdGVyVXNlcm5hbWU6ICdhd3N1c2VyJyxcbiAgICAgIG1hc3RlclVzZXJQYXNzd29yZDogU2VjcmV0VmFsdWUucGxhaW5UZXh0KCdhd3NwYXNzd29yZCcpLFxuICAgICAgZGF0YWJhc2VOYW1lOiAncmRzY2x1c3RlcicsXG4gICAgICBzZWN1cml0eUdyb3VwczogW2RhdGFiYXNlU2VjdXJpdHlHcm91cF0sXG4gICAgICB2cGNcbiAgICB9KTtcbiAgICAvLyBBbGxvdyBjb25uZWN0aW9ucyBvbiBkZWZhdWx0IHBvcnQgZnJvbSBhbnkgSVBWNFxuICAgIGluc3RhbmNlLmNvbm5lY3Rpb25zLmFsbG93RGVmYXVsdFBvcnRGcm9tQW55SXB2NCgpO1xuXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnQUxCLUROUycsIHtcbiAgICAgIHZhbHVlOiBsYi5sb2FkQmFsYW5jZXJEbnNOYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgYWRkcmVzcyBvZiBhbiBBcHBsaWNhdGlvbkxvYWRCYWxhbmNlcicsIC8vIE9wdGlvbmFsXG4gICAgICBleHBvcnROYW1lOiAnYWxiZG5zYWRkcmVzcycsIC8vIFJlZ2lzdGVycyBhIENsb3VkRm9ybWF0aW9uIGV4cG9ydCBuYW1lZCBcImFsYmFkZHJlc3NcIlxuICAgIH0pO1xuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1JEUy1ETlMnLCB7XG4gICAgICB2YWx1ZTogaW5zdGFuY2UuZGJJbnN0YW5jZUVuZHBvaW50QWRkcmVzcyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGFkZHJlc3Mgb2YgYW4gUkRTJywgLy8gT3B0aW9uYWxcbiAgICAgIGV4cG9ydE5hbWU6ICdyZHNhZGRyZXNzJywgLy8gUmVnaXN0ZXJzIGEgQ2xvdWRGb3JtYXRpb24gZXhwb3J0IG5hbWVkIFwiYWxiYWRkcmVzc1wiXG4gICAgfSk7XG4gIH1cbn1cblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbm5ldyBXZWxsQXJjaGl0ZWN0ZWRGcmFtZXdvcmtMYWJzKGFwcCwgJ1dlbGxBcmNoaXRlY3RlZEZyYW1ld29ya0xhYnNTdGFjaycpO1xuYXBwLnN5bnRoKCk7XG4iXX0=