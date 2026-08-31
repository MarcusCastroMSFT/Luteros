import { BlobServiceClient } from '@azure/storage-blob';
import {
  ClientAssertionCredential,
  DefaultAzureCredential,
  type TokenCredential,
} from '@azure/identity';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let cachedClient: BlobServiceClient | null = null;

export function getAzureCredential(): TokenCredential {
  const tenantId = requiredEnv('AZURE_TENANT_ID');

  if (process.env.VERCEL) {
    return new ClientAssertionCredential(
      tenantId,
      requiredEnv('AZURE_CLIENT_ID'),
      async () => requiredEnv('VERCEL_OIDC_TOKEN'),
    );
  }

  return new DefaultAzureCredential({ tenantId });
}

function getBlobEndpoint(): string {
  const endpoint = new URL(requiredEnv('AZURE_STORAGE_BLOB_ENDPOINT'));
  if (endpoint.protocol !== 'https:') {
    throw new Error('AZURE_STORAGE_BLOB_ENDPOINT must use HTTPS');
  }
  return endpoint.toString();
}

export function getBlobServiceClient(): BlobServiceClient {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = new BlobServiceClient(getBlobEndpoint(), getAzureCredential());
  return cachedClient;
}
