import { getVercelOidcToken } from '@vercel/oidc';

type VercelOidcTokenProvider = (options?: {
  audience?: string;
}) => Promise<string>;

export function createVercelOidcAssertion(
  getToken: VercelOidcTokenProvider = getVercelOidcToken,
): () => Promise<string> {
  return () => getToken({ audience: 'api://AzureADTokenExchange' });
}