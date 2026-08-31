interface BlobSasPolicy {
  containerName: string;
  blobName: string;
  permissions: string;
  protocol: string;
  startsOn: Date;
  expiresOn: Date;
}

export function createUploadSasPolicy(
  containerName: string,
  blobName: string,
  now: Date,
): BlobSasPolicy {
  const startsOn = new Date(now.getTime() - 5 * 60 * 1000);
  const expiresOn = new Date(now.getTime() + 15 * 60 * 1000);

  return {
    containerName,
    blobName,
    permissions: 'cw',
    protocol: 'https',
    startsOn,
    expiresOn,
  };
}

export function createReadSasPolicy(
  containerName: string,
  blobName: string,
  now: Date,
): BlobSasPolicy {
  const startsOn = new Date(now.getTime() - 5 * 60 * 1000);
  const expiresOn = new Date(now.getTime() + 5 * 60 * 1000);

  return {
    containerName,
    blobName,
    permissions: 'r',
    protocol: 'https',
    startsOn,
    expiresOn,
  };
}
