# Azure Course Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store new course covers, thumbnails, and uploaded lesson videos in Azure Blob Storage while keeping videos private to enrolled users and retaining existing media providers.

**Architecture:** The Next.js backend authorizes each operation and issues short-lived user-delegation SAS tokens; browsers transfer bytes directly to Blob Storage. Server-only modules own path validation, Vercel OIDC/Azure credentials, SAS generation, promotion, and deletion. Cached course data stores only opaque video blob names, while a per-request playback endpoint checks enrollment and redirects to a five-minute read SAS.

**Tech Stack:** Next.js 16 Route Handlers, React 19, TypeScript, Drizzle/Neon Postgres, Node test runner, `@azure/storage-blob` 12.33+, `@azure/identity` 4.13+, Vercel OIDC, Bicep Azure Verified Modules.

**Spec:** `docs/superpowers/specs/2026-08-31-azure-course-media-design.md`

## Global Constraints

- New course thumbnails, covers, and uploaded lesson videos use Azure Blob Storage; avatars and article/editor images remain on Vercel Blob.
- Existing Vercel URLs, YouTube, Vimeo, and external media remain valid and are not migrated.
- Azure-hosted videos remain private, including lessons marked as free previews.
- Image limit: 8 MB; allowed MIME types: JPEG, PNG, WebP, GIF.
- Video limit: 2 GB; allowed MIME types: MP4, WebM, MOV.
- Persist no SAS token, account key, connection string, client secret, or raw Vercel OIDC assertion.
- Instructors manage only their own courses; administrators manage every course.
- The existing schema already provides `lessons.videoUrl`, `lessons.videoProvider`, and `enrollments.expiresAt`; no migration is required.
- Production authenticates with Vercel OIDC and a user-assigned managed identity; local development uses `DefaultAzureCredential` in tenant `a64c15e0-ee4c-4db3-b9e7-dacbe4fbbee7`.
- Deploy to resource group `Lutteros`, subscription `5f19a983-195c-4260-9d10-cfaec1901e8f`, region Brazil South, using Standard ZRS GPv2 Hot storage.
- Run Azure deployment only after Bicep build and resource-group `what-if`; MFA policies may require direct user confirmation.
- Preserve unrelated local changes in `components/common/logo.tsx`, `lib/logo-layout.ts`, and `lib/logo-layout.test.ts`.

---

### Task 1: Media Policy And Trusted References

**Files:**
- Create: `lib/course-media.ts`
- Create: `lib/course-media.test.ts`
- Create: `lib/course-media-paths.server.ts`
- Create: `lib/course-media-paths.server.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces: `CourseMediaKind`, `CourseMediaDeclaration`, `validateCourseMediaDeclaration()`, `extensionForMediaType()`, `createOwnerFingerprint()`, `createStagingBlobName()`, `createFinalBlobName()`, `parseCourseMediaReference()`, and `getPublicCourseImageUrl()`.
- Blob forms: staging `staging/courses/{courseId}/{kind}/{uuid}.{ext}` or `staging/drafts/{ownerFingerprint}/{kind}/{uuid}.{ext}`; final `courses/{courseId}/{kind}/{uuid}.{ext}`.

- [ ] **Step 1: Install SDK dependencies**

Run:

```powershell
pnpm add @azure/storage-blob@^12.33.0 @azure/identity@^4.13.2
```

- [ ] **Step 2: Write failing policy tests**

Test every allowed MIME type (JPEG, PNG, WebP, GIF, MP4, WebM, MOV), SVG and unknown-type rejection, zero/negative/non-finite sizes, exact 8 MB and 2 GB boundaries, and one byte over each boundary:

```ts
assert.deepEqual(validateCourseMediaDeclaration({ kind: 'lesson-video', contentType: 'video/mp4', size: 2 * 1024 ** 3 }), { ok: true });
assert.deepEqual(validateCourseMediaDeclaration({ kind: 'lesson-video', contentType: 'video/mp4', size: 2 * 1024 ** 3 + 1 }), { ok: false, error: 'Arquivo muito grande (máximo 2GB)' });
assert.deepEqual(validateCourseMediaDeclaration({ kind: 'thumbnail', contentType: 'image/svg+xml', size: 100 }), { ok: false, error: 'Tipo de arquivo não suportado: image/svg+xml' });
```

Path tests must reject `..`, backslashes, query strings, full URLs, a foreign course ID, a wrong owner fingerprint, and extensions inconsistent with the media kind.

- [ ] **Step 3: Verify RED**

Run:

```powershell
node --import tsx --test lib/course-media.test.ts lib/course-media-paths.server.test.ts
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 4: Implement the pure policy and server-only path helpers**

Use discriminated results rather than throwing for user declarations:

```ts
export type CourseMediaKind = 'thumbnail' | 'cover' | 'lesson-video';
export type MediaValidationResult = { ok: true } | { ok: false; error: string };

export function validateCourseMediaDeclaration(input: CourseMediaDeclaration): MediaValidationResult;
export function extensionForMediaType(contentType: string): 'jpg' | 'png' | 'webp' | 'gif' | 'mp4' | 'webm' | 'mov' | null;
```

Use `createHash('sha256').update(userId).digest('hex').slice(0, 24)` for the owner fingerprint and `randomUUID()` for names. Parsing must split path segments and compare exact IDs/kinds; it must not use substring checks.

- [ ] **Step 5: Verify GREEN and run lint**

```powershell
node --import tsx --test lib/course-media.test.ts lib/course-media-paths.server.test.ts
pnpm exec eslint lib/course-media.ts lib/course-media.test.ts lib/course-media-paths.server.ts lib/course-media-paths.server.test.ts
```

- [ ] **Step 6: Commit**

```powershell
git add package.json pnpm-lock.yaml lib/course-media.ts lib/course-media.test.ts lib/course-media-paths.server.ts lib/course-media-paths.server.test.ts
git commit -m "feat(course-media): add trusted media policy"
```

### Task 2: Course Ownership Authorization

**Files:**
- Create: `lib/course-access.ts`
- Create: `lib/course-access.test.ts`
- Modify: `app/api/courses/[courseId]/route.ts`
- Modify: `app/api/courses/[courseId]/lessons/route.ts`
- Modify: `app/api/courses/[courseId]/lessons/[lessonId]/route.ts`

**Interfaces:**
- Consumes: `AuthUser` from `lib/auth-helpers.ts`.
- Produces: `canManageCourse(user, instructorId): boolean` and `requireCourseManager(user, instructorId): NextResponse | null`.

- [ ] **Step 1: Write failing role/ownership tests**

```ts
assert.equal(canManageCourse(admin, 'other-user'), true);
assert.equal(canManageCourse(instructor, instructor.id), true);
assert.equal(canManageCourse(instructor, 'other-user'), false);
assert.equal(canManageCourse(student, student.id), false);
```

- [ ] **Step 2: Verify RED**

```powershell
node --import tsx --test lib/course-access.test.ts
```

Expected: FAIL because `lib/course-access.ts` does not exist.

- [ ] **Step 3: Implement authorization and apply it to existing mutations**

After `requireAdminOrInstructor()`, select `courses.instructorId` and return `403` before any PUT/POST/DELETE when an instructor does not own the course. Preserve `404` when the course or lesson relationship does not exist. Do not rely on an `instructorId` supplied in the request body.

- [ ] **Step 4: Verify tests, lint, and types**

```powershell
node --import tsx --test lib/course-access.test.ts
pnpm exec eslint lib/course-access.ts lib/course-access.test.ts "app/api/courses/[courseId]/route.ts" "app/api/courses/[courseId]/lessons/route.ts" "app/api/courses/[courseId]/lessons/[lessonId]/route.ts"
pnpm exec tsc --noEmit
```

- [ ] **Step 5: Commit**

```powershell
git add -- lib/course-access.ts lib/course-access.test.ts "app/api/courses/[courseId]/route.ts" "app/api/courses/[courseId]/lessons/route.ts" "app/api/courses/[courseId]/lessons/[lessonId]/route.ts"
git commit -m "fix(courses): enforce instructor ownership"
```

### Task 3: Azure Credential, SAS, And Blob Adapter

**Files:**
- Create: `lib/azure-credential.server.ts`
- Create: `lib/course-media-sas.ts`
- Create: `lib/course-media-sas.test.ts`
- Create: `lib/course-media-storage.server.ts`
- Create: `lib/course-media-storage.server.test.ts`

**Interfaces:**
- Produces: `getAzureCredential(): TokenCredential`, `createUploadSasPolicy()`, `createReadSasPolicy()`, and `courseMediaStorage` with `createUploadGrant`, `inspect`, `promote`, `deleteIfOwned`, and `createReadUrl`.
- Environment: `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_STORAGE_ACCOUNT_NAME`, `AZURE_STORAGE_BLOB_ENDPOINT`, `VERCEL`, and Vercel-injected `VERCEL_OIDC_TOKEN`.

- [ ] **Step 1: Write failing SAS-policy and adapter boundary tests**

Assert upload permissions are exactly `cw`, read permissions exactly `r`, protocol HTTPS-only, upload expiry 15 minutes, playback expiry 5 minutes, and start time five minutes before now for clock skew. Inject `now` into policy builders. Adapter tests use fake clients and assert rejected properties trigger staging deletion without persisting a URL.

- [ ] **Step 2: Verify RED**

```powershell
node --import tsx --test lib/course-media-sas.test.ts lib/course-media-storage.server.test.ts
```

- [ ] **Step 3: Implement credential selection**

Production uses:

```ts
new ClientAssertionCredential(
  requiredEnv('AZURE_TENANT_ID'),
  requiredEnv('AZURE_CLIENT_ID'),
  async () => requiredEnv('VERCEL_OIDC_TOKEN'),
)
```

Local development uses `new DefaultAzureCredential({ tenantId })`. Construct one memoized `BlobServiceClient` from the configured HTTPS endpoint. Never log OIDC assertions or SAS URLs.

- [ ] **Step 4: Implement user-delegation SAS and storage operations**

Use `BlobServiceClient.getUserDelegationKey()`, `generateBlobSASQueryParameters()`, `BlobSASPermissions.parse('cw')`, `BlobSASPermissions.parse('r')`, and `SASProtocol.Https`. Validate `getProperties().contentLength` and `blobContentType` before promotion. Use same-account server-side copy (`syncUploadFromURL` where supported, otherwise `beginCopyFromURL(...).pollUntilDone()`) and then `deleteIfExists()` on staging.

- [ ] **Step 5: Verify GREEN, lint, and types**

```powershell
node --import tsx --test lib/course-media-sas.test.ts lib/course-media-storage.server.test.ts
pnpm exec eslint lib/azure-credential.server.ts lib/course-media-sas.ts lib/course-media-sas.test.ts lib/course-media-storage.server.ts lib/course-media-storage.server.test.ts
pnpm exec tsc --noEmit
```

- [ ] **Step 6: Commit**

```powershell
git add lib/azure-credential.server.ts lib/course-media-sas.ts lib/course-media-sas.test.ts lib/course-media-storage.server.ts lib/course-media-storage.server.test.ts
git commit -m "feat(course-media): add Azure Blob adapter"
```

### Task 4: Upload Session Route Handlers

**Files:**
- Create: `lib/course-media-upload-service.server.ts`
- Create: `lib/course-media-upload-service.server.test.ts`
- Create: `app/api/courses/media/uploads/route.ts`
- Create: `app/api/courses/media/uploads/[uploadId]/complete/route.ts`
- Create: `app/api/courses/[courseId]/media/uploads/route.ts`
- Create: `app/api/courses/[courseId]/media/uploads/[uploadId]/complete/route.ts`

**Interfaces:**
- Consumes: policy/path helpers, `canManageCourse`, and `courseMediaStorage`.
- Produces initiation response `{ uploadId, blobUrl, sasUrl, blockSize: 8_388_608, concurrency: 4, expiresAt }` and discriminated completion response `CourseMediaUploadResult`.

```ts
export type CourseMediaUploadResult =
  | { kind: 'thumbnail' | 'cover'; url: string }
  | { kind: 'lesson-video'; blobName: string; videoProvider: 'azure' };
```

- [ ] **Step 1: Write failing service tests**

Use injected auth/course/storage dependencies to cover unauthenticated, wrong role, wrong owner, invalid MIME, oversized declaration, mismatched course/lesson, expired/foreign upload IDs, actual Blob property mismatch, and successful draft/existing-course completion. Assert storage is never called before authorization.

- [ ] **Step 2: Verify RED**

```powershell
node --import tsx --test lib/course-media-upload-service.server.test.ts
```

- [ ] **Step 3: Implement the service and thin Route Handlers**

Parse JSON with a strict allowlist and reject unknown `kind`. Draft routes permit only `thumbnail` and `cover`; `lesson-video` requires an existing course. Completion derives the staging path from authenticated context plus `uploadId`; it never accepts an arbitrary blob URL/name from the request.

- [ ] **Step 4: Verify GREEN, lint, and types**

```powershell
node --import tsx --test lib/course-media-upload-service.server.test.ts
pnpm exec eslint lib/course-media-upload-service.server.ts lib/course-media-upload-service.server.test.ts app/api/courses/media/uploads/route.ts "app/api/courses/media/uploads/[uploadId]/complete/route.ts" "app/api/courses/[courseId]/media/uploads/route.ts" "app/api/courses/[courseId]/media/uploads/[uploadId]/complete/route.ts"
pnpm exec tsc --noEmit
```

- [ ] **Step 5: Commit**

```powershell
git add -- lib/course-media-upload-service.server.ts lib/course-media-upload-service.server.test.ts app/api/courses/media/uploads "app/api/courses/[courseId]/media/uploads"
git commit -m "feat(course-media): add direct upload sessions"
```

### Task 5: Course Image Upload And Draft Promotion

**Files:**
- Create: `lib/course-media-upload.ts`
- Create: `lib/course-media-upload.test.ts`
- Modify: `components/common/image-upload.tsx`
- Modify: `components/courses/course-form.tsx`
- Modify: `app/api/courses/route.ts`
- Modify: `app/api/courses/[courseId]/route.ts`
- Modify: `next.config.ts`

**Interfaces:**
- Produces: `uploadCourseMedia(file, options): Promise<CourseMediaUploadResult>` with progress/cancellation, `CourseBlockBlobClientFactory = (sasUrl: string) => Pick<BlockBlobClient, 'uploadData'>`, and an optional `uploadFile(file)` prop on `ImageUpload`.
- Draft promotion accepts only public image URLs whose parsed blob names match the authenticated owner fingerprint.

- [ ] **Step 1: Write failing browser-upload tests**

Inject a `BlockBlobClient` factory and `fetch` implementation. Assert initiation precedes `uploadData`, options use server-provided `blockSize`/`concurrency`, progress is forwarded, abort signals cancel transfer, and completion runs only after upload success.

- [ ] **Step 2: Verify RED**

```powershell
node --import tsx --test lib/course-media-upload.test.ts
```

- [ ] **Step 3: Implement browser upload and reusable image hook point**

`ImageUpload` continues its current crop/compression behavior. When `uploadFile` is supplied it calls that callback instead of multipart `/api/upload`; all avatar/article callers retain existing behavior.

- [ ] **Step 4: Wire thumbnail and cover fields**

In edit mode use `/api/courses/${courseId}/media/uploads`; in create mode use `/api/courses/media/uploads`. Pass `kind` explicitly. Add the configured `*.blob.core.windows.net` hostname pattern to `next.config.ts` without removing Vercel Blob.

- [ ] **Step 5: Promote owned drafts during course creation and delete replaced Azure images after successful DB updates**

Generate the course UUID server-side before insert. Promote only owned draft image references, persist final URLs, and perform best-effort cleanup of old validated Azure images after a successful update. External/Vercel URLs never reach Azure deletion.

- [ ] **Step 6: Verify tests, lint, and types**

```powershell
node --import tsx --test lib/course-media-upload.test.ts
pnpm exec eslint lib/course-media-upload.ts lib/course-media-upload.test.ts components/common/image-upload.tsx components/courses/course-form.tsx app/api/courses/route.ts "app/api/courses/[courseId]/route.ts" next.config.ts
pnpm exec tsc --noEmit
```

- [ ] **Step 7: Commit**

```powershell
git add -- lib/course-media-upload.ts lib/course-media-upload.test.ts components/common/image-upload.tsx components/courses/course-form.tsx app/api/courses/route.ts "app/api/courses/[courseId]/route.ts" next.config.ts
git commit -m "feat(courses): upload course images to Azure"
```

### Task 6: Lesson Video Upload And Private Playback

**Files:**
- Create: `components/courses/video-upload.tsx`
- Create: `lib/course-media-playback.server.ts`
- Create: `lib/course-media-playback.server.test.ts`
- Create: `app/api/courses/[courseId]/lessons/[lessonId]/media/route.ts`
- Modify: `components/courses/lessons-panel.tsx`
- Modify: `app/(public-pages)/courses/[slug]/lessons/course-lessons-client.tsx`
- Modify: `lib/courses.ts`
- Modify: `lib/video.ts`
- Modify: `lib/video.test.ts`

**Interfaces:**
- Upload completion stores `videoProvider: 'azure'` and an opaque final blob name in `videoUrl`.
- Playback source is `/api/courses/{courseId}/lessons/{lessonId}/media`, resolved as a direct file by `resolveVideoSource()`.

- [ ] **Step 1: Write failing playback and resolver tests**

Cover absent session, absent enrollment, expired enrollment when `expiresAt < now`, mismatched lesson/course, non-Azure provider, foreign blob prefix, successful five-minute redirect, and safe relative media endpoint resolution. Add a test proving public course data redacts Azure video even when `isFree` is true.

- [ ] **Step 2: Verify RED**

```powershell
node --import tsx --test lib/course-media-playback.server.test.ts lib/video.test.ts
```

- [ ] **Step 3: Implement playback service and Route Handler**

Query enrollment and lesson relationship in one server-side flow. Return `401` for no session, `403` for no active enrollment, `404` for relationship/provider/reference mismatches, and `307` with `Cache-Control: private, no-store` for an authorized SAS redirect. Never log the redirect URL.

- [ ] **Step 4: Build the video upload control**

Enable the existing Upload provider. Accept `.mp4,.webm,.mov`, show stable progress/cancel/error states, call `uploadCourseMedia`, and write only the returned opaque `blobName` to form state. Keep YouTube, Vimeo, and URL inputs unchanged.

- [ ] **Step 5: Map enrolled Azure lessons to the playback endpoint**

In `CourseLessonsClient`, when `videoProvider === 'azure'`, set the player source to `/api/courses/${course.id}/lessons/${lesson.id}/media`; never append the stored blob name to a client URL. Update `parseHttpUrl()` in `lib/video.ts` to accept only same-origin relative paths matching `^/api/courses/[0-9a-f-]+/lessons/[0-9a-f-]+/media$` as file sources before its existing HTTP URL handling. Keep the YouTube, Vimeo, and direct-file branches unchanged.

- [ ] **Step 6: Verify tests, lint, and types**

```powershell
node --import tsx --test lib/course-media-playback.server.test.ts lib/video.test.ts
pnpm exec eslint components/courses/video-upload.tsx components/courses/lessons-panel.tsx "app/(public-pages)/courses/[slug]/lessons/course-lessons-client.tsx" lib/course-media-playback.server.ts lib/course-media-playback.server.test.ts "app/api/courses/[courseId]/lessons/[lessonId]/media/route.ts" lib/courses.ts lib/video.ts lib/video.test.ts
pnpm exec tsc --noEmit
```

- [ ] **Step 7: Commit**

```powershell
git add -- components/courses/video-upload.tsx components/courses/lessons-panel.tsx "app/(public-pages)/courses/[slug]/lessons/course-lessons-client.tsx" lib/course-media-playback.server.ts lib/course-media-playback.server.test.ts "app/api/courses/[courseId]/lessons/[lessonId]/media/route.ts" lib/courses.ts lib/video.ts lib/video.test.ts
git commit -m "feat(lessons): add private Azure video playback"
```

### Task 7: Replacement And Deletion Cleanup

**Files:**
- Create: `lib/course-media-cleanup.server.ts`
- Create: `lib/course-media-cleanup.server.test.ts`
- Modify: `app/api/courses/[courseId]/route.ts`
- Modify: `app/api/courses/[courseId]/lessons/[lessonId]/route.ts`

**Interfaces:**
- Produces: `collectCourseMediaReferences()` and `deleteCourseMediaReferences()`; both accept only parsed references belonging to the expected course.

- [ ] **Step 1: Write failing cleanup tests**

Assert deduplication, exact course-prefix validation, ignored external/Vercel URLs, delete-after-DB-update ordering through injected operations, and non-fatal cleanup failures with SAS-free structured identifiers.

- [ ] **Step 2: Verify RED**

```powershell
node --import tsx --test lib/course-media-cleanup.server.test.ts
```

- [ ] **Step 3: Implement cleanup and route integration**

On lesson replacement/delete and course image replacement/delete, capture old validated references, complete the DB mutation first, then call idempotent `deleteIfExists`. Before course cascade deletion, select `courses.thumbnail` and `courses.coverImage`, plus all lesson `{ videoUrl, videoProvider }` rows where `lessons.courseId` equals the target course; retain only `videoProvider === 'azure'` and references that parse to the exact course ID. Do not roll back a successful DB mutation for cleanup failure.

- [ ] **Step 4: Verify GREEN, lint, and types**

```powershell
node --import tsx --test lib/course-media-cleanup.server.test.ts
pnpm exec eslint lib/course-media-cleanup.server.ts lib/course-media-cleanup.server.test.ts "app/api/courses/[courseId]/route.ts" "app/api/courses/[courseId]/lessons/[lessonId]/route.ts"
pnpm exec tsc --noEmit
```

- [ ] **Step 5: Commit**

```powershell
git add -- lib/course-media-cleanup.server.ts lib/course-media-cleanup.server.test.ts "app/api/courses/[courseId]/route.ts" "app/api/courses/[courseId]/lessons/[lessonId]/route.ts"
git commit -m "feat(course-media): clean replaced Azure blobs"
```

### Task 8: Reproducible Azure Infrastructure

**Files:**
- Create: `infra/main.bicep`
- Create: `infra/README.md`

**Interfaces:**
- Inputs: `location = 'brazilsouth'`, `vercelTeamSlug`, `vercelTeamId`, `vercelProjectId`, and allowed origins. The Storage Account name is deterministic from `uniqueString(subscription().id, resourceGroup().id)`.
- Outputs: `storageAccountName`, `blobEndpoint`, `managedIdentityClientId`, `tenantId`.

- [ ] **Step 1: Implement Bicep using pinned Azure Verified Modules**

Use:

```bicep
module storage 'br/public:avm/res/storage/storage-account:0.33.0'
module identity 'br/public:avm/res/managed-identity/user-assigned-identity:0.6.0'
module federation 'br/public:avm/res/managed-identity/user-assigned-identity/federated-identity-credential:0.2.0'
```

Configure Standard ZRS StorageV2, Hot tier, TLS 1.2, HTTPS-only, Shared Key disabled, blob public access allowed only for the public image container, versioning, 7-day blob/container soft delete, public network access, and CORS for `https://www.lutteros.com.br`, `https://lutteros.com.br`, and `http://localhost:3000`. Create `course-images` with blob-read access and `course-videos` private. Assign built-in Storage Blob Data Contributor (`ba92f5b4-2d11-453d-a403-e96b0029c9fe`) to the managed identity at Storage Account scope.

Configure the federated credential from the official Vercel claim formats:

```bicep
issuer: 'https://oidc.vercel.com/${vercelTeamSlug}'
subject: 'owner:${vercelTeamId}:project:${vercelProjectId}:environment:production'
audiences: [
  'api://AzureADTokenExchange'
]
```

- [ ] **Step 2: Document configuration without secrets**

List required Vercel environment variables:

```text
AZURE_TENANT_ID
AZURE_CLIENT_ID
AZURE_STORAGE_ACCOUNT_NAME
AZURE_STORAGE_BLOB_ENDPOINT
```

Document local `az login --tenant a64c15e0-ee4c-4db3-b9e7-dacbe4fbbee7` and subscription selection, but never store tokens or generated SAS values.

- [ ] **Step 3: Validate Bicep locally**

```powershell
az bicep build --file infra/main.bicep
az bicep lint --file infra/main.bicep
```

Expected: both exit 0. If Azure CLI is unavailable, install it through the approved Azure CLI extension workflow, then authenticate interactively in the terminal.

- [ ] **Step 4: Commit**

```powershell
git add infra/main.bicep infra/README.md
git commit -m "infra: define Azure course media storage"
```

### Task 9: Full Verification, What-If, Deployment, And Smoke Test

**Files:**
- Modify only files needed to fix failures caused by Tasks 1-8.

- [ ] **Step 1: Run the complete local verification suite**

```powershell
node --import tsx --test lib/*.test.ts
pnpm lint
pnpm exec tsc --noEmit
pnpm build
git diff --check
```

Record any build blocker caused by missing external environment variables separately from code failures.

- [ ] **Step 2: Run a security review of the final diff**

Trace declaration fields, blob names, authorization checks, SAS creation, redirects, logging, deletion targets, upload limits, and cached payloads. Confirm there is no client-controlled arbitrary blob path, cross-course authorization, SAS persistence/logging, public video container, or server-proxied video body.

- [ ] **Step 3: Preview the Azure deployment**

After direct user authentication/MFA:

```powershell
az account set --subscription 5f19a983-195c-4260-9d10-cfaec1901e8f
$env:VERCEL_TEAM_SLUG = Read-Host 'Vercel team slug'
$env:VERCEL_TEAM_ID = Read-Host 'Vercel team ID'
$env:VERCEL_PROJECT_ID = Read-Host 'Vercel project ID'
az deployment group what-if --resource-group Lutteros --template-file infra/main.bicep --parameters vercelTeamSlug=$env:VERCEL_TEAM_SLUG vercelTeamId=$env:VERCEL_TEAM_ID vercelProjectId=$env:VERCEL_PROJECT_ID
```

Review that only the Storage Account, containers/service settings, user-assigned identity, federated credential, and scoped role assignment are created.

- [ ] **Step 4: Deploy only after the what-if matches the plan**

```powershell
az deployment group create --name course-media --resource-group Lutteros --template-file infra/main.bicep --parameters vercelTeamSlug=$env:VERCEL_TEAM_SLUG vercelTeamId=$env:VERCEL_TEAM_ID vercelProjectId=$env:VERCEL_PROJECT_ID
```

Capture outputs and configure the four non-secret Vercel environment values. Authentication tokens and MFA responses are entered directly by the user, never through chat.

- [ ] **Step 5: Smoke test behavior**

Upload a small JPEG and MP4 to a non-production course. Verify image rendering, video seeking/range requests, instructor cross-course denial, non-enrolled `403`, enrolled playback redirect, replacement cleanup, and that existing Vercel/YouTube/Vimeo media still works.

- [ ] **Step 6: Final commit for validation-only fixes**

Stage only files changed to correct Task 9 failures and use:

```powershell
git commit -m "fix(course-media): address integration validation"
```

Skip this commit when Task 9 requires no code changes.