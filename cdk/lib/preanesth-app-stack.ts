import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class PreanesthAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Users Table
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'UsersTable' + '-dev',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    new cdk.CfnOutput(this, 'UsersTableName', { value: usersTable.tableName });

    // Patients Table
    const patientsTable = new dynamodb.Table(this, 'PatientsTable', {
      tableName: 'PatientsTable' + '-dev',
      partitionKey: { name: 'patientId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'cpf', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    new cdk.CfnOutput(this, 'PatientsTableName', { value: patientsTable.tableName });

    // Evaluations Table
    const evaluationsTable = new dynamodb.Table(this, 'EvaluationsTable', {
      tableName: 'EvaluationsTable' + '-dev',
      partitionKey: { name: 'patientId', type: dynamodb.AttributeType.STRING }, // e.g., PATIENT#456
      sortKey: { name: 'evaluationId', type: dynamodb.AttributeType.STRING },     // e.g., EVAL#20250928T2100
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    new cdk.CfnOutput(this, 'EvaluationsTableName', { value: evaluationsTable.tableName });

    // Audit Logs Table
    const auditLogsTable = new dynamodb.Table(this, 'AuditLogsTable', {
      tableName: 'AuditLogsTable' + '-dev',
      partitionKey: { name: 'patientId', type: dynamodb.AttributeType.STRING }, // e.g., PATIENT#456
      sortKey: { name: 'auditId', type: dynamodb.AttributeType.STRING },     // e.g., AUDIT#20250928T2130
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // GSI to query audit logs by user who performed action
    auditLogsTable.addGlobalSecondaryIndex({
      indexName: 'GSI_AuditByUser',
      partitionKey: { name: 'performedBy', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'patientId', type: dynamodb.AttributeType.STRING },
    });

    new cdk.CfnOutput(this, 'AuditLogsTableName', { value: auditLogsTable.tableName });

    // Institutional Configs Table
    const institutionalConfigsTable = new dynamodb.Table(this, 'InstitutionalConfigsTable', {
      tableName: 'InstitutionalConfigsTable' + '-dev',
      partitionKey: { name: 'institutionId', type: dynamodb.AttributeType.STRING }, // e.g., HOSPITAL#1
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    new cdk.CfnOutput(this, 'InstitutionalConfigsTableName', { value: institutionalConfigsTable.tableName });


    // APIs
    const createPatientLambda = new lambda.Function(this, 'CreatePatientLambda', {
      runtime: lambda.Runtime.JAVA_17,
      handler: 'com.myapp.lambdas.CreatePatientHandler::handleRequest',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/app/build/libs/lambda-handlers-1.0.0.jar')),
    });

    const api = new apigateway.LambdaRestApi(this, 'PreAnesthApi', {
      handler: createPatientLambda,
      proxy: false,  // allows you to define individual resources
      deployOptions: { stageName: 'dev' },
    });

    // Create /patients POST
    const patients = api.root.addResource('patients');
    patients.addMethod('POST', new apigateway.LambdaIntegration(createPatientLambda));
  }
}
