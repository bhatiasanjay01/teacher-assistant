/**
 * The value is used for unit tests,
 * Need to load from initTableNames.
 */
export const tableNames = {
  TeacherAssistantMainTable: 'TeacherAssistantMainTable',
};

// arn:aws:dynamodb:us-east-2:123456789012:table/myDynamoDBTable
export const getTableName = (dynamoARN: string) => dynamoARN.split(':')[5].split('/')[1];

/**
 * The table name should be set in CDK
 */
export const initTableNames = () => {
  tableNames.TeacherAssistantMainTable = process.env.TeacherAssistantMainTable!;
};
