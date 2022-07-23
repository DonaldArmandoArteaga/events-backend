import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as cdk from 'aws-cdk-lib'

export class EventsBackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const defaultVpc = ec2.Vpc.fromLookup(this, 'VPC', { isDefault: true })

    const role = new iam.Role(
      this,
      'ec2-events-backend-role',
      { assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com') }
    )

    const securityGroup = new ec2.SecurityGroup(
      this,
      'ec2-events-backend-sg',
      {
        vpc: defaultVpc,
        allowAllOutbound: true,
        securityGroupName: 'ec2-events-backend-1-sg',
      }
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allows SSH access from Internet'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allows HTTP access from Internet'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allows HTTPS access from Internet'
    )

    const userData = ec2.UserData.forLinux()
    userData.addCommands(
      'sudo yum update',
      'sudo amazon-linux-extras install docker',
      'sudo service docker start',
      'sudo usermod -a -G docker ec2-user',
      'sudo yum install git -y'
    )

    const instance = new ec2.Instance(this, 'ec2-events-backend-instance-1', {
      vpc: defaultVpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: 'ec2-events-backend-instance-1',
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      userData,
      userDataCausesReplacement: true,
      keyName: 'ec2-events-backend-instance-1-key',
    })

    new cdk.CfnOutput(this, 'ec2-events-backend-instance-1-output', {
      value: instance.instancePublicIp
    })
  }

}

