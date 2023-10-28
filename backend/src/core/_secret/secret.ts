import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { environment } from '../../environments/environment';

export const initSecrets = async () => {
  // Use this code snippet in your app.
  // If you need more information about configurations or implementing the sample code, visit the AWS docs:
  // https://aws.amazon.com/developers/getting-started/nodejs/

  // Load the AWS SDK
  const region = 'us-east-2';
  const secretName = environment.awsSecretName;

  // Create a Secrets Manager client
  const client = new SecretsManager({
    region,
  });

  // In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
  // See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  // We rethrow the exception by default.

  const awsSecret = await client.getSecretValue({ SecretId: secretName });
  const awsSecretString = awsSecret.SecretString;
  const secretFromAws = JSON.parse(awsSecretString!) as SecretFromAws;

  environment.auth0.domain = secretFromAws.auth0Domain;
  environment.auth0.clientId = secretFromAws.auth0ClientId;
  environment.auth0.clientSecret = secretFromAws.auth0ClientSecret;

  environment.openai.secretKey = secretFromAws.openaiSecretKey;
};

export interface SecretFromAws {
  auth0Domain: string;
  auth0ClientId: string;
  auth0ClientSecret: string;

  openaiSecretKey: string;
}
