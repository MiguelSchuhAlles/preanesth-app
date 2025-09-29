import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

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
  }
}
