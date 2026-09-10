import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Regional client connecting automatically via IAM permissions
const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });

// DocumentClient automatically unpacks DynamoDB types to plain JS objects
export const docClient = DynamoDBDocumentClient.from(client);