# Azure course media infrastructure

This Bicep deployment creates the Azure resources used for direct course image and lesson video uploads:

- Standard ZRS StorageV2 account in Brazil South
- Public `course-images` container and private `course-videos` container
- Blob CORS for the custom production domains, stable Vercel production alias, and local development
- Public network endpoint for browser-direct transfers; writes and private video reads still require scoped SAS authorization
- Blob and container soft delete for 7 days, plus Blob versioning
- User-assigned managed identity with Storage Blob Data Contributor at Storage Account scope
- Federated identity credential for the Vercel production OIDC subject

No account keys, client secrets, OIDC tokens, or SAS values are stored in this repository.

The Storage network ACL intentionally allows public endpoint traffic because browsers upload directly to Blob Storage. CORS limits participating web origins, while Azure RBAC and short-lived SAS permissions provide authorization. Only `course-images` permits anonymous Blob reads; `course-videos` remains private.

## Prerequisites

Authenticate to the expected tenant and select the subscription:

```powershell
az login --tenant a64c15e0-ee4c-4db3-b9e7-dacbe4fbbee7
az account set --subscription 5f19a983-195c-4260-9d10-cfaec1901e8f
```

The target resource group is `Lutteros`. Azure Policy requires MFA for resource write and delete operations in this tenant.

## Validate

Restore the pinned Azure Verified Modules, then compile and lint locally:

```powershell
az bicep restore --file infra/main.bicep
az bicep build --file infra/main.bicep
az bicep lint --file infra/main.bicep
```

Before deployment, preview the exact resource changes:

```powershell
az deployment group what-if `
  --resource-group Lutteros `
  --template-file infra/main.bicep `
  --parameters `
    vercelTeamSlug='<team-slug>' `
    vercelTeamSubject='<team-slug>' `
    vercelProjectName='<project-name>'
```

Do not commit real Vercel identifiers in parameter files unless the repository's access policy explicitly permits it. Never capture or persist generated SAS URLs or the runtime `VERCEL_OIDC_TOKEN`.

## Vercel configuration

After deployment, map the Bicep outputs to these Vercel production environment variables:

```text
AZURE_TENANT_ID             <- tenantId
AZURE_CLIENT_ID             <- managedIdentityClientId
AZURE_STORAGE_ACCOUNT_NAME  <- storageAccountName
AZURE_STORAGE_BLOB_ENDPOINT <- blobEndpoint
```

Vercel injects `VERCEL_OIDC_TOKEN` at runtime when OIDC federation is enabled. It must not be configured as a static environment variable.

Automatic lesson duration lookup for YouTube videos also requires this server-only Vercel environment variable:

```text
YOUTUBE_API_KEY
```

Restrict the key in Google Cloud to the YouTube Data API v3. Never expose it with a `NEXT_PUBLIC_` prefix.
