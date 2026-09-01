import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { createUploadSasPolicy, createReadSasPolicy } from './course-media-sas';

describe('createUploadSasPolicy', () => {
  test('grants exactly create and write permissions', () => {
    const now = new Date('2026-08-31T12:00:00Z');
    const policy = createUploadSasPolicy('test-container', 'test/blob.mp4', now);
    
    assert.equal(policy.permissions, 'cw');
  });

  test('enforces HTTPS protocol only', () => {
    const now = new Date('2026-08-31T12:00:00Z');
    const policy = createUploadSasPolicy('test-container', 'test/blob.mp4', now);
    
    assert.equal(policy.protocol, 'https');
  });

  test('sets start time 5 minutes before now for clock skew', () => {
    const now = new Date('2026-08-31T12:00:00Z');
    const policy = createUploadSasPolicy('test-container', 'test/blob.mp4', now);
    
    const expectedStart = new Date('2026-08-31T11:55:00Z');
    assert.equal(policy.startsOn?.toISOString(), expectedStart.toISOString());
  });

  test('sets expiry 15 minutes after now', () => {
    const now = new Date('2026-08-31T12:00:00Z');
    const policy = createUploadSasPolicy('test-container', 'test/blob.mp4', now);
    
    const expectedExpiry = new Date('2026-08-31T12:15:00Z');
    assert.equal(policy.expiresOn.toISOString(), expectedExpiry.toISOString());
  });

  test('targets specific container and blob', () => {
    const now = new Date('2026-08-31T12:00:00Z');
    const policy = createUploadSasPolicy('my-container', 'path/to/blob.jpg', now);
    
    assert.equal(policy.containerName, 'my-container');
    assert.equal(policy.blobName, 'path/to/blob.jpg');
  });
});

describe('createReadSasPolicy', () => {
  test('grants exactly read permission', () => {
    const now = new Date('2026-08-31T12:00:00Z');
    const policy = createReadSasPolicy('test-container', 'test/blob.mp4', now);
    
    assert.equal(policy.permissions, 'r');
  });

  test('enforces HTTPS protocol only', () => {
    const now = new Date('2026-08-31T12:00:00Z');
    const policy = createReadSasPolicy('test-container', 'test/blob.mp4', now);
    
    assert.equal(policy.protocol, 'https');
  });

  test('sets start time 5 minutes before now for clock skew', () => {
    const now = new Date('2026-08-31T12:00:00Z');
    const policy = createReadSasPolicy('test-container', 'test/blob.mp4', now);
    
    const expectedStart = new Date('2026-08-31T11:55:00Z');
    assert.equal(policy.startsOn?.toISOString(), expectedStart.toISOString());
  });

  test('sets expiry 2 hours after now', () => {
    const now = new Date('2026-08-31T12:00:00Z');
    const policy = createReadSasPolicy('test-container', 'test/blob.mp4', now);
    
    const expectedExpiry = new Date('2026-08-31T14:00:00Z');
    assert.equal(policy.expiresOn.toISOString(), expectedExpiry.toISOString());
  });

  test('targets specific container and blob', () => {
    const now = new Date('2026-08-31T12:00:00Z');
    const policy = createReadSasPolicy('videos', 'courses/123/lesson.mp4', now);
    
    assert.equal(policy.containerName, 'videos');
    assert.equal(policy.blobName, 'courses/123/lesson.mp4');
  });
});
