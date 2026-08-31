# Azure Course Media Design

**Date:** 2026-08-31  
**Status:** Ready for review

## Goal

Move new course thumbnails, covers, and lesson videos from Vercel Blob to Azure Blob Storage. Keep existing Vercel URLs working, preserve YouTube, Vimeo, and external URL support, and ensure Azure-hosted lesson videos are available only to enrolled users.

Avatar, article, and editor image uploads remain on Vercel Blob. Existing course images are not migrated in this delivery.

## Decisions

- Use Azure Blob Storage directly from the browser for uploads.
- Keep the Next.js application on Vercel.
- Do not introduce an Azure Function for upload or playback.
- Limit lesson video uploads to 2 GB.
- Store opaque Azure blob references, never SAS URLs, in Postgres.
- Use short-lived, single-blob SAS tokens for upload and playback.
- Use Vercel OIDC federation to Azure instead of a client secret in production.
- Keep Azure-hosted videos private even when a lesson is marked as a free preview. Existing external preview URLs retain their current behavior.
- Use Brazil South and zone-redundant storage for the initial deployment.

An Azure Function may be added later only for asynchronous media processing such as transcoding, malware scanning, thumbnail generation, or webhook-driven workflows.

## Azure Resources

Infrastructure is defined in Bicep and deployed to the existing `Lutteros` resource group in subscription `5f19a983-195c-4260-9d10-cfaec1901e8f`, tenant `a64c15e0-ee4c-4db3-b9e7-dacbe4fbbee7`.

Create:

- One globally unique Standard GPv2 Storage Account in Brazil South using ZRS and Hot access tier.
- A `course-images` container with anonymous blob-read access for public covers and thumbnails.
- A `course-videos` container with no anonymous access.
- An Entra application/service principal with a federated identity credential restricted to the production Vercel project and environment.
- A `Storage Blob Data Contributor` assignment scoped to the Storage Account for that principal.

Storage configuration:

- Require HTTPS and TLS 1.2 or newer.
- Disable Shared Key authorization; application access uses Microsoft Entra ID.
- Permit public blob access at account level only because `course-images` is intentionally public; `course-videos` remains private at container level.
- Enable blob versioning, blob soft delete, and container soft delete.
- Restrict CORS to the production application origin and local development origins, with only the methods and headers required by block uploads.
- Allow public network access because Vercel does not provide a stable private network path to the Storage Account.

Local development uses an interactive Azure developer credential for the required tenant. Production uses a Vercel OIDC assertion exchanged through Azure Identity. No account key, connection string, long-lived SAS, or client secret is stored in the repository or Vercel environment.

## Data Model

No new media table is required for the initial delivery.

For Azure lesson videos:

- `lessons.videoProvider` is `azure`.
- `lessons.videoUrl` stores a validated blob name such as `courses/<course-id>/lessons/<asset-id>.mp4`.
- The value contains no host, query string, SAS token, or user-controlled path segments.

For course thumbnails and covers, the existing course image fields store the stable public HTTPS Blob URL. Existing Vercel Blob URLs remain valid.

Blob names are generated server-side from trusted course IDs, media roles, random UUIDs, and an extension derived from an allowed MIME type. Original filenames are display-only and never become path components.

The create-course form can upload an image before a course ID exists. Those uploads use a staging prefix containing a server-generated fingerprint of the authenticated user rather than the raw user ID. The course creation endpoint accepts only draft references owned by that fingerprint and promotes them to the new course prefix before persisting the final public URL.

## Authorization

Every media API performs server-side authentication and object-level authorization.

- Administrators may manage media for any course.
- Instructors may manage media only when `courses.instructorId` matches their authenticated user ID.
- Students may obtain video playback access only when an enrollment exists for the requested course.
- A lesson ID must belong to the course ID in the route before playback or mutation is authorized.
- Authorization is checked again during upload completion; possession of an upload SAS is not sufficient to associate a blob with a lesson.

SAS tokens are user-delegation SAS tokens signed through Microsoft Entra credentials. Upload SAS grants only create/write permissions for one generated staging blob and expires after 15 minutes. Playback SAS grants only read permission for one finalized blob and expires after 5 minutes. Neither grants list or delete permissions.

## Upload Flow

### Initiate

`POST /api/courses/:courseId/media/uploads` for an existing course, or `POST /api/courses/media/uploads` for a create-course draft.

The body declares `kind` (`thumbnail`, `cover`, or `lesson-video`), MIME type, byte size, and optional lesson ID. The endpoint:

1. Authenticates the admin/instructor and verifies course ownership, or binds a create-course draft to a server-generated fingerprint of the authenticated user.
2. Validates media kind, MIME type, declared size, and lesson ownership.
3. Generates a random staging blob name under the trusted course prefix for existing courses or the authenticated owner-fingerprint prefix for create-course drafts.
4. Returns the blob URL, a 15-minute write-only SAS, upload ID/blob reference, and block-upload settings.

Allowed course images are JPEG, PNG, WebP, and GIF up to 8 MB. Allowed videos are MP4, WebM, and MOV up to 2 GB. SVG is excluded from the new public course-media path.

### Transfer

The browser uploads directly to Azure Blob Storage with the Azure Storage browser client. Videos use block upload with bounded concurrency, progress reporting, cancellation, and retry behavior. File bytes never pass through a Vercel Route Handler.

### Complete

`POST /api/courses/:courseId/media/uploads/:uploadId/complete`

The endpoint repeats authorization, reads Blob properties from Azure, and verifies the actual content length and content type. It promotes the validated staging object to its final trusted name without downloading bytes through Vercel, removes the staging object, and returns:

- A public HTTPS URL for a thumbnail or cover.
- An opaque blob name and `videoProvider: "azure"` for a lesson video.

The existing course or lesson save endpoint associates this returned value with the record. If association fails, the client requests cleanup; unassociated staging objects are also subject to an age-based cleanup policy or scheduled maintenance task.

## Playback Flow

`GET /api/courses/:courseId/lessons/:lessonId/media`

The endpoint authenticates the user, verifies that the lesson belongs to the course, verifies enrollment, accepts only `videoProvider: "azure"`, and validates that the stored blob name belongs to the expected course prefix. It then responds with a temporary redirect to a 5-minute read-only SAS URL.

The player uses this endpoint for Azure media. Browser range requests and seeking continue against Blob Storage after the redirect. YouTube, Vimeo, external files, and legacy media continue through the existing resolver.

Signed playback URLs are generated per request and are not placed in cached course data, HTML, database rows, logs, analytics, or error messages. Public course payloads continue to redact paid lesson media.

## Replacement And Deletion

When an Azure course image or video is replaced, the database update succeeds before the old blob is deleted. Cleanup failure is logged without rolling back the new association and can be retried safely.

When an Azure-backed lesson or course is deleted, the server collects only blob names that pass the trusted account, container, and course-prefix checks. Database deletion and blob cleanup are coordinated so a storage failure does not expose or corrupt another course's media. Legacy Vercel and external URLs are never sent to Azure deletion APIs.

## Failure Handling

- Invalid type or declared size: reject before issuing SAS.
- Actual Blob properties differ from the declaration: reject completion and delete the staging blob.
- Expired upload SAS: let the editor request a new upload session.
- Interrupted block upload: show retry/cancel state; do not save a lesson reference.
- Azure unavailable during playback: return a generic `503` without exposing credentials or internal blob details.
- Missing enrollment or ownership: return `403`; mismatched course/lesson/blob relationships return `404` to limit object discovery.
- Cleanup failure: log structured asset identifiers without SAS query strings and retry out of band.

## Application Changes

Add Azure Storage and Azure Identity SDK dependencies, plus focused modules for:

- Azure credential and Blob service construction.
- Blob reference creation and strict validation.
- User-delegation SAS creation.
- Course media authorization.
- Browser block uploads and upload progress UI.

Add the initiate, complete, cleanup, and playback Route Handlers. Enable the Upload provider in the lesson editor, retain the existing provider choices, and reuse the existing course image controls with an Azure-backed course-media endpoint. Add the Azure Blob hostname to the Next.js image allowlist.

Infrastructure files live under `infra/` and contain no environment secrets. Deployment outputs document the Storage Account name, Blob endpoint, Entra client ID, tenant ID, and required Vercel environment variable names.

## Testing

Unit tests cover:

- Trusted blob-name generation and rejection of traversal, foreign course prefixes, URLs, query strings, and unsupported extensions.
- MIME and size limits for each media kind.
- SAS permission and expiry policy construction without exposing a token in persisted values.
- Provider resolution for Azure playback endpoints and unchanged legacy providers.

Route tests cover:

- Unauthenticated, wrong-role, wrong-owner, mismatched lesson/course, and non-enrolled requests.
- Initiation returning a single-blob write scope only after authorization.
- Completion rejecting mismatched Blob properties.
- Playback refusing non-Azure and foreign-prefix references.
- Replacement/deletion touching only validated Azure-owned blobs.

UI tests cover provider selection, upload progress, cancellation, errors, and the value submitted after completion. Validation includes targeted tests, ESLint, TypeScript, a production build when environment prerequisites are available, Bicep lint/build, and an Azure what-if before deployment.

## Rollout

1. Deploy Azure resources and configure Vercel OIDC/environment metadata.
2. Verify direct image and video uploads in a non-production course.
3. Verify an enrolled user can seek through a private video and a non-enrolled user receives `403`.
4. Enable the Upload provider for production editors.
5. Monitor authorization failures, Blob errors, upload duration, and orphan cleanup.

Rollback disables the Azure upload option while leaving existing Azure references readable. No existing Vercel media is deleted or rewritten in this delivery.