targetScope = 'resourceGroup'

@description('Azure region for all resources.')
param location string = 'brazilsouth'

@description('Vercel team slug used in the OIDC issuer URL.')
param vercelTeamSlug string

@description('Vercel team slug used in the production OIDC subject.')
param vercelTeamSubject string

@description('Vercel project name used in the production OIDC subject.')
param vercelProjectName string

@description('Origins allowed to upload course media directly to Blob Storage.')
param allowedOrigins array = [
  'https://www.lutteros.com.br'
  'https://lutteros.com.br'
  'http://localhost:3000'
]

var storageAccountName = 'stlut${uniqueString(subscription().id, resourceGroup().id)}'
var managedIdentityName = 'id-lutteros-course-media'
var blobDataContributorRoleId = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'

module identity 'br/public:avm/res/managed-identity/user-assigned-identity:0.6.0' = {
  name: 'course-media-identity'
  params: {
    name: managedIdentityName
    location: location
  }
}

module storage 'br/public:avm/res/storage/storage-account:0.33.0' = {
  name: 'course-media-storage'
  params: {
    name: storageAccountName
    location: location
    kind: 'StorageV2'
    skuName: 'Standard_ZRS'
    accessTier: 'Hot'
    allowBlobPublicAccess: true
    allowSharedKeyAccess: false
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
    }
    blobServices: {
      isVersioningEnabled: true
      deleteRetentionPolicyEnabled: true
      deleteRetentionPolicyDays: 7
      containerDeleteRetentionPolicyEnabled: true
      containerDeleteRetentionPolicyDays: 7
      corsRules: [
        {
          allowedHeaders: [
            'content-length'
            'content-type'
            'range'
            'x-ms-blob-type'
            'x-ms-client-request-id'
            'x-ms-version'
          ]
          allowedMethods: [
            'GET'
            'HEAD'
            'OPTIONS'
            'PUT'
          ]
          allowedOrigins: allowedOrigins
          exposedHeaders: [
            'accept-ranges'
            'content-length'
            'content-range'
            'etag'
            'x-ms-request-id'
            'x-ms-version'
          ]
          maxAgeInSeconds: 3600
        }
      ]
      containers: [
        {
          name: 'course-images'
          publicAccess: 'Blob'
        }
        {
          name: 'course-videos'
          publicAccess: 'None'
        }
      ]
    }
    roleAssignments: [
      {
        principalId: identity.outputs.principalId
        principalType: 'ServicePrincipal'
        roleDefinitionIdOrName: blobDataContributorRoleId
      }
    ]
  }
}

module federation 'br/public:avm/res/managed-identity/user-assigned-identity/federated-identity-credential:0.2.0' = {
  name: 'vercel-production-federation'
  params: {
    name: 'vercel-production'
    userAssignedIdentityName: identity.outputs.name
    issuer: 'https://oidc.vercel.com/${vercelTeamSlug}'
    subject: 'owner:${vercelTeamSubject}:project:${vercelProjectName}:environment:production'
    audiences: [
      'api://AzureADTokenExchange'
    ]
  }
}

output storageAccountName string = storage.outputs.name
output blobEndpoint string = storage.outputs.primaryBlobEndpoint
output managedIdentityClientId string = identity.outputs.clientId
output tenantId string = tenant().tenantId
