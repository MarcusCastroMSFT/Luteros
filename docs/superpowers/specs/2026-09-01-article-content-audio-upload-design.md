# Article Content And Audio Upload Design

**Date:** 2026-09-01
**Status:** Approved

## Goal

Render the HTML actually saved for article lessons and let instructors upload private audio lessons directly to Azure Blob Storage. Remove all placeholder article, audio, and transcript content from the classroom.

## Decisions

- Keep the existing `lessons.content`, `lessons.videoUrl`, and `lessons.videoProvider` columns; no database migration is required.
- Return article HTML only from the enrollment-protected classroom query. Do not add it to cached public course payloads.
- Sanitize stored article HTML on the server before rendering it.
- Add `lesson-audio` as a distinct course-media kind while continuing to use the existing private `course-videos` container.
- Accept MP3, M4A, WAV, and OGG audio up to 500 MB.
- Keep direct external audio URLs as an alternative to Azure upload.
- Detect uploaded audio duration in the browser and keep the duration field editable.
- Remove the demonstration transcript from audio lessons. A dedicated transcript field is out of scope.

## Article Data Flow

The instructor editor continues storing rich HTML in `lessons.content`. `getEnrolledCourseBySlug()` selects `content` only after authentication and enrollment checks have succeeded. The classroom mapper adds `content` to the shared `Lesson` view model, and `ArticleLesson` renders that value instead of a hard-coded demonstration article.

The cached public course query and `/api/courses-public/:slug` continue omitting `content`, including for paid lessons. This prevents article bodies from leaking into public HTML, JSON, cache entries, or structured data.

Before article HTML reaches `dangerouslySetInnerHTML`, a server-only sanitizer applies an allowlist compatible with the rich-text editor. It retains semantic text formatting, lists, headings, blockquotes, code, safe links, safe HTTPS/same-origin images, and allowlisted YouTube/Vimeo embeds. It removes scripts, event handlers, unsafe URL schemes, arbitrary inline styles, and unapproved iframe hosts. Links opened in a new tab receive `rel="noopener noreferrer"`.

An empty article displays a neutral empty-content message. No sample content or generated summary is shown.

## Audio Storage And Upload

`CourseMediaKind` gains `lesson-audio`. Allowed declarations are:

- `audio/mpeg` -> `.mp3`
- `audio/mp4` and `audio/x-m4a` -> `.m4a`
- `audio/wav` and `audio/x-wav` -> `.wav`
- `audio/ogg` -> `.ogg`

The maximum declared and actual size is 500 MB. Blob names use `courses/<courseId>/lesson-audio/<uuid>.<ext>` and the existing private `course-videos` container. Path parsing compares the exact course ID, media kind, UUID, and MIME-derived extension.

The existing direct-browser SAS flow supports `lesson-audio` in initiation, token validation, upload completion, promotion, and cleanup. Initiation and completion verify that the target lesson belongs to the course and has type `audio`. Possession of an upload token never permits associating audio with another course or with a video/article lesson.

For new lessons, the create-first flow creates the lesson, uploads the pending file, and patches the returned Blob reference onto that lesson. Existing lessons upload immediately. Upload progress, cancellation, safe errors, and retry behavior match video uploads.

## Audio Playback

Azure audio is stored internally with `videoProvider: "azure"` and the opaque `lesson-audio` blob name in `videoUrl`. External audio stores the URL with an external provider value. These names are legacy schema details and are not shown in UI copy.

The classroom maps Azure audio to the existing enrollment-protected `/api/courses/:courseId/lessons/:lessonId/media` endpoint. Playback authorization loads `lessons.type` and selects the expected Blob kind:

- `video` requires `lesson-video`.
- `audio` requires `lesson-audio`.
- `article` is rejected as media.

The endpoint continues issuing a private, five-minute, read-only SAS redirect. The audio player uses the mapped lesson URL, supports metadata loading, seeking, volume, and playback speed, and never uses a demonstration file.

## Replacement And Deletion

Media collection derives the expected Blob kind from the lesson type. Replacing an Azure audio file updates the lesson and then best-effort deletes only a validated old `lesson-audio` Blob owned by the same course. Deleting an audio lesson uses the existing strict Blob-first behavior: storage failure preserves the lesson; successful Blob removal is followed by database deletion.

External URLs, malformed references, staging references, wrong media kinds, and foreign-course paths are never sent to Azure deletion APIs.

## UI

The audio editor offers two source modes: URL externa and Upload. Upload accepts `.mp3,.m4a,.wav,.ogg`, shows the selected filename, progress, cancellation, completion, and removal states, and fills duration from browser metadata when available. The duration field remains editable and is the fallback when metadata cannot be read.

The article viewer keeps its font-size controls but removes the hard-coded article and hard-coded key-points card. The audio viewer keeps playback and notes controls but removes the hard-coded source and demonstration transcript.

## Failure Handling

- Invalid audio MIME type or size is rejected before SAS issuance.
- Blob properties inconsistent with the declaration are rejected at completion and the staging object is cleaned up.
- Missing or malformed article HTML renders an empty state rather than sample content.
- Sanitization failure returns no article HTML and does not expose the unsanitized value.
- Missing enrollment, wrong course, wrong lesson type, or wrong Blob kind remains a `403`/`404` according to the current anti-enumeration policy.
- Azure playback failure returns a generic error without logging or returning SAS URLs.

## Testing

Automated tests cover:

- Enrolled article queries include sanitized `content`; public course queries omit it.
- The article viewer consumes lesson content and contains no demonstration copy.
- Sanitization removes scripts, event handlers, unsafe URLs, and foreign iframes while preserving editor-supported safe markup.
- Audio MIME mappings and exact 500 MB boundary.
- Trusted `lesson-audio` path generation and rejection of video, staging, malformed, and foreign-course paths.
- Upload initiation/completion enforce course ownership and audio lesson type.
- Create-first and existing-lesson audio uploads persist only final opaque Blob names.
- Playback accepts the correct kind for audio and video and rejects mismatches.
- Replacement and deletion clean only owned audio Blobs.
- Audio playback uses the lesson URL and contains no placeholder source or transcript.

Validation includes focused Node tests, ESLint, TypeScript, the broader course-media suite, and browser checks for article rendering and audio upload/player states when environment prerequisites are available.

## Rollout And Compatibility

Existing YouTube, Vimeo, external video, external audio, and Azure video lessons remain valid. No existing rows or Blobs are rewritten. The feature can roll back by hiding audio Upload while retaining playback support for already-associated `lesson-audio` references.