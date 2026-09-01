# Article Content And Audio Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render enrolled article lessons from saved, sanitized HTML and support private Azure uploads for audio lessons.

**Architecture:** Article HTML is selected only by the enrollment-protected query and sanitized server-side before entering the classroom model. Audio extends the existing direct-to-Azure pipeline with a distinct `lesson-audio` kind, reusing the private container and legacy lesson media columns while enforcing lesson type at upload, playback, replacement, and deletion boundaries.

**Tech Stack:** Next.js 16 Route Handlers, React 19, TypeScript, Drizzle/Neon Postgres, Azure Blob Storage, `sanitize-html`, Node test runner, ESLint.

**Spec:** `docs/superpowers/specs/2026-09-01-article-content-audio-upload-design.md`

## Global Constraints

- Article HTML is available only from the authenticated, enrollment-protected classroom query; public and cached course payloads must omit it.
- Sanitize article HTML on the server before rendering with `dangerouslySetInnerHTML`.
- Audio kinds are MP3, M4A, WAV, and OGG with an exact maximum of 500 MB.
- Persist audio using existing `lessons.videoUrl` and `lessons.videoProvider`; no database migration.
- Azure audio uses the private `course-videos` container and opaque `lesson-audio` Blob names only.
- Upload and completion must verify course ownership, lesson membership, and `lessons.type === "audio"`.
- Playback and cleanup derive the expected Blob kind from lesson type; they never infer it from a filename alone.
- Keep external audio URLs working and remove all hard-coded article, audio, summary, and transcript demo content.
- Preserve current uncommitted duration work in `components/courses/lessons-panel.tsx`, `components/courses/video-upload.tsx`, `lib/video-duration*`, `lib/youtube-video.server.ts`, and `app/api/courses/video-duration/`.
- Do not stage or commit files automatically. Never use `git add .` or broad staging commands.

---

### Task 1: Safe Enrolled Article Content

**Files:**
- Create: `lib/article-content.server.ts`
- Create: `lib/article-content.server.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `lib/courses.ts`
- Modify: `types/course.ts`
- Modify: `app/(public-pages)/courses/[slug]/lessons/course-lessons-client.tsx`
- Modify: `components/lessons/articleLesson.tsx`

**Interfaces:**
- Produces: `sanitizeArticleContent(content: string | null | undefined): string`.
- Produces: optional `Lesson.content?: string` in the classroom view model.
- Security boundary: only `getEnrolledCourseBySlug()` calls the sanitizer; `fetchCourseBySlug()` remains unchanged.

- [ ] **Step 1: Install the sanitizer and typings**

Run:

```powershell
pnpm add sanitize-html
pnpm add -D @types/sanitize-html
```

- [ ] **Step 2: Write failing sanitizer tests**

Create table-driven tests that prove safe editor markup survives and executable markup does not:

```ts
assert.equal(sanitizeArticleContent(null), '');
assert.match(sanitizeArticleContent('<h2>Título</h2><p><strong>Texto</strong></p>'), /<h2>Título<\/h2>/);
assert.doesNotMatch(sanitizeArticleContent('<img src=x onerror=alert(1)><script>alert(1)</script>'), /onerror|script/i);
assert.doesNotMatch(sanitizeArticleContent('<a href="javascript:alert(1)">x</a>'), /javascript:/i);
assert.match(sanitizeArticleContent('<iframe src="https://www.youtube.com/embed/abc"></iframe>'), /youtube\.com/);
assert.doesNotMatch(sanitizeArticleContent('<iframe src="https://evil.example/embed/abc"></iframe>'), /iframe/i);
```

- [ ] **Step 3: Verify RED**

Run:

```powershell
node --import tsx --test lib/article-content.server.test.ts
```

Expected: FAIL because `article-content.server.ts` does not exist.

- [ ] **Step 4: Implement the server-only allowlist**

Use `sanitize-html` with explicit tags and attributes. Allow `http`/`https` links, `https` images, and only YouTube/Vimeo iframe hosts. Add `rel="noopener noreferrer"` whenever `target="_blank"` survives. Do not allow `style`, `class`, `id`, `srcdoc`, event handlers, `data:` URLs, or protocol-relative iframe URLs.

```ts
export function sanitizeArticleContent(content: string | null | undefined): string {
  if (!content) return '';
  return sanitizeHtml(content, ARTICLE_SANITIZER_OPTIONS);
}
```

- [ ] **Step 5: Deliver content through the protected classroom path**

Add `content: sanitizeArticleContent(row.content)` to the enrolled lessons result after selecting `lessons.content`. Add `content?: string` to `types/course.ts`, `content: string | null` to `RawLesson`, and map `content: lesson.content || undefined` in the classroom client. Do not touch the public `safeLessons` mapping.

Replace the local `articleContent` constant with `lesson.content`. For empty content render `Conteúdo indisponível.` Remove the hard-coded “Pontos Principais” section entirely.

- [ ] **Step 6: Verify article behavior**

Run:

```powershell
node --import tsx --test lib/article-content.server.test.ts
pnpm exec eslint lib/article-content.server.ts lib/article-content.server.test.ts lib/courses.ts types/course.ts "app/(public-pages)/courses/[slug]/lessons/course-lessons-client.tsx" components/lessons/articleLesson.tsx
pnpm exec tsc --noEmit
```

Expected: all commands PASS; searching `components/lessons/articleLesson.tsx` finds neither `Introduction to the Topic` nor `Pontos Principais`.

---

### Task 2: Audio Media Policy, Paths, And Tokens

**Files:**
- Modify: `lib/course-media.ts`
- Modify: `lib/course-media.test.ts`
- Modify: `lib/course-media-paths.server.ts`
- Modify: `lib/course-media-paths.server.test.ts`
- Modify: `lib/course-media-upload-token.server.ts`
- Modify: `lib/course-media-upload-token.server.test.ts`

**Interfaces:**
- Extends: `CourseMediaKind` with `'lesson-audio'`.
- Extends: `CourseMediaExtension` with `'mp3' | 'm4a' | 'wav' | 'ogg'`.
- Produces: exact Blob forms `staging/courses/{courseId}/lesson-audio/{uuid}.{ext}` and `courses/{courseId}/lesson-audio/{uuid}.{ext}`.

- [ ] **Step 1: Add failing media policy tests**

Cover all MIME aliases and exact boundaries:

```ts
const AUDIO_MAX = 500 * 1024 ** 2;
assert.deepEqual(validateCourseMediaDeclaration({ kind: 'lesson-audio', contentType: 'audio/mpeg', size: AUDIO_MAX }), { ok: true });
assert.deepEqual(validateCourseMediaDeclaration({ kind: 'lesson-audio', contentType: 'audio/mp4', size: 1 }), { ok: true });
assert.deepEqual(validateCourseMediaDeclaration({ kind: 'lesson-audio', contentType: 'audio/x-m4a', size: 1 }), { ok: true });
assert.deepEqual(validateCourseMediaDeclaration({ kind: 'lesson-audio', contentType: 'audio/wav', size: 1 }), { ok: true });
assert.deepEqual(validateCourseMediaDeclaration({ kind: 'lesson-audio', contentType: 'audio/x-wav', size: 1 }), { ok: true });
assert.deepEqual(validateCourseMediaDeclaration({ kind: 'lesson-audio', contentType: 'audio/ogg', size: 1 }), { ok: true });
assert.deepEqual(validateCourseMediaDeclaration({ kind: 'lesson-audio', contentType: 'audio/mpeg', size: AUDIO_MAX + 1 }), { ok: false, error: 'Arquivo muito grande (máximo 500MB)' });
```

Path tests must accept a final `.mp3` audio reference and reject `.mp4`, a `lesson-video` kind mismatch, traversal, query strings, staging references where final is required, and foreign course IDs.

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --import tsx --test lib/course-media.test.ts lib/course-media-paths.server.test.ts lib/course-media-upload-token.server.test.ts
```

Expected: FAIL because `lesson-audio` is not assignable/accepted.

- [ ] **Step 3: Extend policy and paths**

Add MIME-to-extension mappings and separate `AUDIO_CONTENT_TYPES`, `AUDIO_EXTENSIONS`, and `AUDIO_MAX_SIZE`. Make media classification explicit:

```ts
const PRIVATE_LESSON_MEDIA_KINDS = new Set<CourseMediaKind>(['lesson-video', 'lesson-audio']);

function extensionMatchesKind(kind: CourseMediaKind, extension: string): boolean {
  if (kind === 'lesson-video') return VIDEO_EXTENSIONS.has(extension as CourseMediaExtension);
  if (kind === 'lesson-audio') return AUDIO_EXTENSIONS.has(extension as CourseMediaExtension);
  return IMAGE_EXTENSIONS.has(extension as CourseMediaExtension);
}
```

Update `getPublicCourseImageUrl()` to reject both private lesson kinds.

- [ ] **Step 4: Extend strict upload-token validation**

Use `CourseMediaKind` in `UploadTokenPayload.declaration.kind`. Require `courseId`, `lessonId`, and `course-videos` for both lesson media kinds; reject `lesson-audio` tokens in draft/image containers and reject image tokens carrying `lessonId`.

- [ ] **Step 5: Verify policy, path, and token tests**

Run:

```powershell
node --import tsx --test lib/course-media.test.ts lib/course-media-paths.server.test.ts lib/course-media-upload-token.server.test.ts
pnpm exec eslint lib/course-media.ts lib/course-media.test.ts lib/course-media-paths.server.ts lib/course-media-paths.server.test.ts lib/course-media-upload-token.server.ts lib/course-media-upload-token.server.test.ts
```

Expected: PASS.

---

### Task 3: Audio Upload Authorization And Completion

**Files:**
- Modify: `lib/course-media-upload-service.server.ts`
- Modify: `lib/course-media-upload-service.server.test.ts`
- Modify: `app/api/courses/[courseId]/media/uploads/route.ts`
- Modify: `app/api/courses/[courseId]/media/uploads/[uploadId]/complete/route.ts`

**Interfaces:**
- Extends: service lesson dependency to `{ id: string; courseId: string; type: 'video' | 'article' | 'audio' }`.
- Extends: `CourseMediaUploadResult` with `{ kind: 'lesson-audio'; blobName: string; videoProvider: 'azure' }`.
- Rule: `lesson-video` requires `type === 'video'`; `lesson-audio` requires `type === 'audio'` at initiation and completion.

- [ ] **Step 1: Write failing service tests**

Add initiation and completion cases for valid audio, wrong lesson type, wrong course, missing lesson ID, draft context, token tampering, actual MIME/size mismatch, and the successful result:

```ts
assert.deepEqual(result, {
  ok: true,
  result: {
    kind: 'lesson-audio',
    blobName: expectedFinalAudioBlob,
    videoProvider: 'azure',
  },
});
```

Assert both initiation and completion call `findLesson()` and reject when a lesson changed from `audio` to another type between those operations.

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --import tsx --test lib/course-media-upload-service.server.test.ts
```

Expected: FAIL for unsupported `lesson-audio` and missing type enforcement.

- [ ] **Step 3: Generalize private lesson media handling**

Create a local predicate and expected type helper instead of duplicating branches:

```ts
function isLessonMediaKind(kind: CourseMediaKind): kind is 'lesson-video' | 'lesson-audio' {
  return kind === 'lesson-video' || kind === 'lesson-audio';
}

function expectedLessonType(kind: 'lesson-video' | 'lesson-audio'): 'video' | 'audio' {
  return kind === 'lesson-video' ? 'video' : 'audio';
}
```

Use this predicate for strict body parsing, draft rejection, required `lessonId`, private container selection, re-authorization, and completion response. Keep images unchanged.

- [ ] **Step 4: Narrow route database projections**

In both existing-course upload routes, make `findLesson` select only `id`, `courseId`, and `type`. The service remains the owner of type and relationship validation.

- [ ] **Step 5: Verify upload service and routes**

Run:

```powershell
node --import tsx --test lib/course-media-upload-service.server.test.ts lib/course-media-upload-token.server.test.ts
pnpm exec eslint lib/course-media-upload-service.server.ts lib/course-media-upload-service.server.test.ts "app/api/courses/[courseId]/media/uploads/route.ts" "app/api/courses/[courseId]/media/uploads/[uploadId]/complete/route.ts"
pnpm exec tsc --noEmit
```

Expected: PASS.

---

### Task 4: Browser Upload And Deferred Lesson Save

**Files:**
- Modify: `lib/course-media-upload.ts`
- Modify: `lib/course-media-upload.test.ts`
- Modify: `lib/lesson-save-flow.ts`
- Modify: `lib/lesson-save-flow.test.ts`
- Create: `lib/audio-duration.ts`
- Create: `lib/audio-duration.test.ts`

**Interfaces:**
- Extends: browser `CourseMediaUploadResult` with `lesson-audio`.
- Renames: `saveLessonWithDeferredVideo()` to `saveLessonWithDeferredMedia()` and updates the sole panel caller.
- Produces: `readAudioFileDuration(file: File): Promise<number>` returning rounded positive seconds.
- Save option: `mediaFile?: File | null`; kind derives only from `payload.type`.

- [ ] **Step 1: Write failing browser upload and save-flow tests**

Prove initiation sends `kind: 'lesson-audio'`, completion parses only a matching audio result, and malformed/cross-kind responses fail. Add create-first audio ordering:

```ts
assert.deepEqual(events, ['create', 'upload:lesson-audio', 'update']);
assert.equal(createdBody.isPublished, false);
assert.equal(createdBody.videoUrl, null);
assert.equal(updatedBody.videoProvider, 'azure');
assert.match(updatedBody.videoUrl, /\/lesson-audio\//);
```

Also prove stale files are ignored for article lessons and existing lessons continue using a single PUT after their immediate upload component has produced a Blob name.

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --import tsx --test lib/course-media-upload.test.ts lib/lesson-save-flow.test.ts lib/audio-duration.test.ts
```

Expected: FAIL because audio completion, generic deferred media, and duration reader are absent.

- [ ] **Step 3: Generalize client upload result parsing**

Accept `lesson-video` and `lesson-audio` only when `value.kind === kind`, `blobName` is a string, and `videoProvider === 'azure'`. Keep image result parsing unchanged.

- [ ] **Step 4: Generalize create-first lesson persistence**

Derive the pending kind without trusting UI state:

```ts
const deferredKind = payload.type === 'video'
  ? 'lesson-video'
  : payload.type === 'audio'
    ? 'lesson-audio'
    : null;
const deferredFile = deferredKind ? mediaFile : null;
```

After upload, require `uploaded.kind === deferredKind`, then PUT `videoUrl: uploaded.blobName` and `videoProvider: 'azure'`. Preserve `LessonSaveError.lessonId` so a failed upload leaves the newly created unpublished lesson recoverable.

- [ ] **Step 5: Implement metadata duration reader**

Mirror the existing video duration helper using an `HTMLAudioElement`, object URL cleanup, `loadedmetadata`, `error`, and a finite positive duration check. Round with `Math.round()` so it matches the integer database field. Tests should inject the media-element/object-URL dependencies rather than rely on a browser DOM.

- [ ] **Step 6: Verify browser upload and save flow**

Run:

```powershell
node --import tsx --test lib/course-media-upload.test.ts lib/lesson-save-flow.test.ts lib/audio-duration.test.ts
pnpm exec eslint lib/course-media-upload.ts lib/course-media-upload.test.ts lib/lesson-save-flow.ts lib/lesson-save-flow.test.ts lib/audio-duration.ts lib/audio-duration.test.ts
```

Expected: PASS.

---

### Task 5: Audio Upload Editor

**Files:**
- Create: `components/courses/audio-upload.tsx`
- Modify: `components/courses/lessons-panel.tsx`

**Interfaces:**
- `AudioUpload` follows `VideoUpload` props: `courseId`, optional `lessonId`, `value`, `pendingFile`, `onChange`, `onFileSelected`, `onDurationChange`, `onUploadingChange`, and `onRemove`.
- Accept string: `.mp3,.m4a,.wav,.ogg`.
- Panel state becomes media-neutral: `pendingMediaFile` and `isMediaUploading`.

- [ ] **Step 1: Add the audio upload component**

Reuse the current upload interaction pattern but validate and upload with `kind: 'lesson-audio'`. Use `readAudioFileDuration()` before immediate or deferred upload. Display `Áudio carregado`, `Enviando áudio...`, `Finalizando áudio...`, selected filename, progress, cancel, and remove states. Do not duplicate video-only copy or icons.

- [ ] **Step 2: Integrate URL/Upload source modes**

For audio lessons, render a two-option source control:

```ts
type AudioSourceMode = 'url' | 'upload';
```

Use existing `videoProvider` storage values: `url` while editing an external URL, `upload` in editor state for an Azure Blob, and convert `upload` to `azure` in the save payload. For `payload.type === 'audio'`, persist `formData.videoUrl` and its provider instead of clearing both fields.

When changing lesson type, clear incompatible pending files. When opening an existing Azure audio lesson, select Upload. Pass `pendingMediaFile` to `saveLessonWithDeferredMedia()` so a new audio lesson follows create-first upload. Keep the duration field visible and editable for audio.

- [ ] **Step 3: Make errors media-neutral**

When `LessonSaveError.lessonId` is present, show `A aula foi criada, mas o upload da mídia falhou. Abra a aula para tentar novamente.` Keep the dialog close guard and buttons disabled while either video or audio upload is active.

- [ ] **Step 4: Verify the editor slice**

Run:

```powershell
pnpm exec eslint components/courses/audio-upload.tsx components/courses/lessons-panel.tsx components/courses/video-upload.tsx lib/lesson-save-flow.ts
pnpm exec tsc --noEmit
```

Expected: PASS. Manual source inspection confirms audio has URL externa and Upload controls, accepts four extensions, and does not clear audio media from the payload.

---

### Task 6: Type-Aware Playback And Real Audio Player

**Files:**
- Modify: `lib/course-media-playback.server.ts`
- Modify: `lib/course-media-playback.server.test.ts`
- Modify: `app/api/courses/[courseId]/lessons/[lessonId]/media/route.ts`
- Modify: `app/(public-pages)/courses/[slug]/lessons/course-lessons-client.tsx`
- Modify: `components/lessons/audioLesson.tsx`

**Interfaces:**
- Extends: `EnrollmentData` with `lessonType: 'video' | 'article' | 'audio'`.
- Playback expected kind: `video -> lesson-video`, `audio -> lesson-audio`, article -> no media.
- Player consumes `lesson.videoUrl`; no separate audio schema property.

- [ ] **Step 1: Add failing playback tests**

Cover valid video, valid audio, audio Blob on a video lesson, video Blob on an audio lesson, article with media fields, foreign course, non-enrollment, expiry, malformed Blob, and unchanged SAS privacy behavior.

```ts
assert.equal((await service.authorizePlayback(courseId, audioLessonId)).status, 200);
assert.deepEqual(createReadUrlCalls, [{
  container: 'course-videos',
  blob: `courses/${courseId}/lesson-audio/123e4567-e89b-42d3-a456-426614174000.mp3`,
}]);
```

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --import tsx --test lib/course-media-playback.server.test.ts
```

Expected: FAIL because playback always requires `lesson-video`.

- [ ] **Step 3: Enforce lesson-type-to-kind mapping**

Select `lessons.type` as `lessonType` in the route. In the service, reject article before storage access and call `parseCourseMediaReference()` with the exact expected kind for video/audio. Keep UUID, enrollment, expiry, Azure provider, and final-scope checks unchanged.

- [ ] **Step 4: Use real classroom media**

The existing Azure URL mapping applies to both video and audio because both use provider `azure`; update its comment and carry `content` from Task 1. In `AudioLesson`, set:

```tsx
<audio ref={audioRef} src={lesson.videoUrl} preload="metadata" />
```

Render a clear unavailable state when `videoUrl` is absent. Handle `audio.play()` rejection by restoring `isPlaying` rather than reporting playback before it starts. Use a stable `handleEnded` function in effect setup/cleanup. Remove the entire demonstration transcript block.

- [ ] **Step 5: Verify playback and player**

Run:

```powershell
node --import tsx --test lib/course-media-playback.server.test.ts
pnpm exec eslint lib/course-media-playback.server.ts lib/course-media-playback.server.test.ts "app/api/courses/[courseId]/lessons/[lessonId]/media/route.ts" "app/(public-pages)/courses/[slug]/lessons/course-lessons-client.tsx" components/lessons/audioLesson.tsx
pnpm exec tsc --noEmit
```

Expected: PASS; source search finds neither `soundjay.com` nor `Transcrição do Áudio`.

---

### Task 7: Type-Aware Replacement, Strict Deletion, And Final Validation

**Files:**
- Modify: `lib/course-media-cleanup.server.ts`
- Modify: `lib/course-media-cleanup.server.test.ts`
- Modify: `app/api/courses/[courseId]/lessons/[lessonId]/route.ts`
- Modify: `app/api/courses/[courseId]/route.ts`

**Interfaces:**
- Extends: cleanup lesson input with `type: 'video' | 'article' | 'audio'`.
- Rule: Azure video rows collect only `lesson-video`; Azure audio rows collect only `lesson-audio`; article and mismatched rows collect nothing.
- Strict deletion remains Blob-first; replacement remains database-first with best-effort old-Blob cleanup.

- [ ] **Step 1: Add failing cleanup tests**

Prove collection and deletion for owned final audio, deduplication, wrong kind/type, foreign course, staging audio, external URL, malformed path, replacement failure warning, strict storage failure preserving mutation, and successful Blob-before-mutation order.

```ts
assert.deepEqual(collectCourseMediaReferences({
  courseId,
  blobEndpoint,
  lessons: [{ type: 'audio', videoProvider: 'azure', videoUrl: audioBlob }],
}), [{ containerName: 'course-videos', ref: expectedAudioRef }]);
```

- [ ] **Step 2: Verify RED**

Run:

```powershell
node --import tsx --test lib/course-media-cleanup.server.test.ts
```

Expected: FAIL because cleanup hard-codes `lesson-video`.

- [ ] **Step 3: Make collection and deletion type-aware**

Use one helper for all three cleanup phases:

```ts
function getExpectedLessonMediaKind(type: LessonMediaReference['type']) {
  if (type === 'video') return 'lesson-video' as const;
  if (type === 'audio') return 'lesson-audio' as const;
  return null;
}
```

Carry the parsed `ref.kind` in each `CourseMediaReference`; when deleting from `course-videos`, permit only `lesson-video` or `lesson-audio` and require it to equal the candidate reference kind. Never default an unknown/article type to video.

- [ ] **Step 4: Supply lesson type from mutation routes**

Select `type` in lesson DELETE. Existing full lesson rows already contain it for PUT. Ensure course-level lesson projections used for cleanup also select `type`. Change the strict-deletion warning and Portuguese error from video-specific to media-specific:

```ts
console.warn('Lesson media deletion failed; lesson was preserved');
error: 'Não foi possível excluir a mídia. A aula foi mantida; tente novamente.';
```

- [ ] **Step 5: Run focused and broad automated validation**

Run:

```powershell
node --import tsx --test lib/article-content.server.test.ts lib/course-media.test.ts lib/course-media-paths.server.test.ts lib/course-media-upload-token.server.test.ts lib/course-media-upload-service.server.test.ts lib/course-media-upload.test.ts lib/lesson-save-flow.test.ts lib/audio-duration.test.ts lib/course-media-playback.server.test.ts lib/course-media-cleanup.server.test.ts
pnpm exec eslint lib/article-content.server.ts lib/course-media.ts lib/course-media-paths.server.ts lib/course-media-upload-token.server.ts lib/course-media-upload-service.server.ts lib/course-media-upload.ts lib/lesson-save-flow.ts lib/audio-duration.ts lib/course-media-playback.server.ts lib/course-media-cleanup.server.ts components/courses/audio-upload.tsx components/courses/video-upload.tsx components/courses/lessons-panel.tsx components/lessons/articleLesson.tsx components/lessons/audioLesson.tsx "app/(public-pages)/courses/[slug]/lessons/course-lessons-client.tsx" "app/api/courses/[courseId]/media/uploads/route.ts" "app/api/courses/[courseId]/media/uploads/[uploadId]/complete/route.ts" "app/api/courses/[courseId]/lessons/[lessonId]/media/route.ts" "app/api/courses/[courseId]/lessons/[lessonId]/route.ts" "app/api/courses/[courseId]/route.ts"
pnpm exec tsc --noEmit
pnpm build
```

Expected: tests, ESLint, TypeScript, and production build PASS. If build requires unavailable environment configuration, record the exact blocker and keep all prior executable results.

- [ ] **Step 6: Perform browser verification**

At desktop and mobile widths, verify an enrolled article displays its saved formatting with no sample text, an empty article displays the neutral state, a new audio lesson can select an allowed file and auto-fill duration, and an existing audio lesson plays through the protected media endpoint. Verify no controls overlap and no Blob name or SAS URL appears in visible UI or page source.

- [ ] **Step 7: Review final security diff**

Inspect only the task diff and confirm:

- Public course payloads still omit `content` and private Azure media.
- Every raw HTML sink receives only `sanitizeArticleContent()` output.
- Upload initiation and completion both enforce lesson type and course relationship.
- Playback cannot exchange video/audio kinds.
- Cleanup cannot delete a foreign, staging, external, or mismatched Blob.
- Logs and errors contain no SAS query strings.

Run `git diff --check` and report any unrelated pre-existing dirty files without changing them.