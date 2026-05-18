# Image Cropper Component — Implementation Guide

A reusable image cropping dialog built on top of `react-easy-crop` and shadcn/ui. Supports both **rectangular** crops (configurable aspect ratio, e.g. cover images) and **round** crops (avatars). Outputs a JPEG `Blob` ready to upload anywhere.

---

## 1. Prerequisites

The target project must already have:

- **Next.js / React 18+** with the `"use client"` directive available
- **Tailwind CSS** (the components use Tailwind utility classes)
- **shadcn/ui** primitives installed: `Button` and `Dialog`
  - If not yet installed: `npx shadcn@latest add button dialog`
- **lucide-react** for icons

### Install the cropping library

```bash
npm install react-easy-crop
# or
pnpm add react-easy-crop
```

This project uses `react-easy-crop@5.5.6`. Any 5.x release works the same.

---

## 2. The Core Component: `ImageCropper`

Drop this file into your project as `components/image-cropper.tsx`.

```tsx
"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { ZoomInIcon, ZoomOutIcon } from "lucide-react"

interface ImageCropperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  onCropComplete: (croppedBlob: Blob) => void
  aspect?: number
  cropShape?: "round" | "rect"
  title?: string
  description?: string
}

function getCroppedImg(imageSrc: string, crop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = crop.width
      canvas.height = crop.height
      const ctx = canvas.getContext("2d")
      if (!ctx) return reject(new Error("Could not get canvas context"))

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      )

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Canvas toBlob failed"))
          resolve(blob)
        },
        "image/jpeg",
        0.95
      )
    }
    image.onerror = () => reject(new Error("Failed to load image"))
    image.src = imageSrc
  })
}

export function ImageCropper({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
  aspect = 1,
  cropShape = "round",
  title = "Cortar foto de perfil",
  description = "Arraste para reposicionar. Use o gesto de pinça ou o controle deslizante para zoom.",
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  const handleCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setCroppedArea(croppedAreaPixels)
    },
    []
  )

  async function handleSave() {
    if (!croppedArea) return
    setSaving(true)
    try {
      const blob = await getCroppedImg(imageSrc, croppedArea)
      onCropComplete(blob)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div
          className="relative w-full overflow-hidden rounded-lg bg-muted"
          style={{ aspectRatio: `${aspect} / 1` }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <div className="flex items-center gap-3 px-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
            aria-label="Diminuir zoom"
          >
            <ZoomOutIcon className="size-4" />
          </Button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            aria-label="Zoom"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            aria-label="Aumentar zoom"
          >
            <ZoomInIcon className="size-4" />
          </Button>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !croppedArea}>
            {saving ? "Salvando…" : "Aplicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### How it works

1. The parent passes a base64 / object-URL `imageSrc` and opens the dialog.
2. `react-easy-crop` renders the image with drag + zoom controls and fires `onCropComplete` whenever the user releases, giving us **pixel coordinates** of the crop region.
3. On "Aplicar", `getCroppedImg` draws those pixels onto an offscreen `<canvas>` and exports a JPEG `Blob` at 95% quality.
4. The `Blob` is handed back to the parent via `onCropComplete(blob)` — the parent decides where to upload it.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | — | Controls dialog visibility |
| `onOpenChange` | `(open: boolean) => void` | — | Standard shadcn Dialog signature |
| `imageSrc` | `string` | — | Data URL or object URL of the file the user selected |
| `onCropComplete` | `(blob: Blob) => void` | — | Called with the cropped JPEG `Blob` |
| `aspect` | `number` | `1` | Width/height ratio. `1` = square, `3` = wide banner, etc. |
| `cropShape` | `"round" \| "rect"` | `"round"` | Round for avatars, rect for cover images |
| `title` | `string` | "Cortar foto de perfil" | Dialog title |
| `description` | `string` | (PT-BR instructions) | Subtitle below the title |

> ⚠️ **CORS note:** `image.crossOrigin = "anonymous"` is set so cropping remote URLs doesn't taint the canvas. If you load images from a remote origin, that origin must send `Access-Control-Allow-Origin`. For files picked from disk (the common case), this is a non-issue — they become `data:` URLs.

---

## 3. Example Wrapper: Cover Image Uploader (rectangular, 3:1)

This is the wrapper shown in the screenshot. It handles file selection, opens the cropper, and uploads the resulting blob. Save as `components/cover-image-upload.tsx`.

```tsx
"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageCropper } from "@/components/image-cropper"
import { Loader2, X, Upload } from "lucide-react"

interface CoverImageUploadProps {
  value: string
  onChange: (url: string) => void
  hint?: string
}

export function CoverImageUpload({ value, onChange, hint }: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setCropperOpen(true)
    }
    reader.readAsDataURL(file)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleCropComplete(blob: Blob) {
    setCropperOpen(false)
    setIsUploading(true)
    setError(null)
    try {
      // 👇 Replace this block with your project's upload logic.
      //    The cropper just gives you a Blob — you decide where it goes.
      const formData = new FormData()
      formData.append("file", blob, `cover-${Date.now()}.jpg`)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const { url } = await res.json()
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar arquivo")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <>
          <div
            className="relative w-full overflow-hidden rounded-lg border border-border bg-muted"
            style={{ aspectRatio: "3 / 1" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Capa" className="h-full w-full object-cover" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="gap-1.5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Substituir"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <X className="size-3.5" />
              Remover
            </Button>
          </div>
        </>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="gap-1.5 self-start"
        >
          {isUploading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="size-3.5" />
              Selecionar arquivo
            </>
          )}
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}

      {selectedImage && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          aspect={3}
          cropShape="rect"
          title="Ajustar Imagem de Capa"
          description="Arraste para reposicionar. Use o controle deslizante para zoom."
        />
      )}
    </div>
  )
}
```

### Using the wrapper

```tsx
<CoverImageUpload
  value={form.coverUrl}
  onChange={(url) => setForm({ ...form, coverUrl: url })}
  hint="Recomendado: 1500×500 px, JPG ou PNG."
/>
```

---

## 4. Variant: Avatar Uploader (round, 1:1)

For a circular avatar uploader, just use the defaults (`aspect={1}`, `cropShape="round"`):

```tsx
<ImageCropper
  open={cropperOpen}
  onOpenChange={setCropperOpen}
  imageSrc={selectedImage}
  onCropComplete={handleCropComplete}
  // aspect defaults to 1, cropShape defaults to "round"
/>
```

---

## 5. Plugging in Your Upload Backend

The cropper itself is storage-agnostic — `onCropComplete` hands you a `Blob`. Common targets:

### Vercel Blob (what this project uses)
```ts
import { upload } from "@vercel/blob/client"

const uploaded = await upload(`covers/${Date.now()}.jpg`, blob, {
  access: "public",
  handleUploadUrl: "/api/upload",
  contentType: "image/jpeg",
})
onChange(uploaded.url)
```

### Generic multipart POST
```ts
const formData = new FormData()
formData.append("file", blob, `image-${Date.now()}.jpg`)
const res = await fetch("/api/upload", { method: "POST", body: formData })
const { url } = await res.json()
```

### S3 presigned URL
```ts
const { uploadUrl, publicUrl } = await fetch("/api/s3-presign").then(r => r.json())
await fetch(uploadUrl, { method: "PUT", body: blob, headers: { "Content-Type": "image/jpeg" } })
onChange(publicUrl)
```

---

## 6. Checklist for Recreating in a New Project

1. [ ] `npm install react-easy-crop lucide-react`
2. [ ] Install shadcn/ui `Button` and `Dialog` (`npx shadcn@latest add button dialog`)
3. [ ] Make sure Tailwind tokens `bg-muted`, `accent-primary`, `text-destructive`, `border-border` exist (they ship with shadcn's default theme)
4. [ ] Copy `components/image-cropper.tsx` verbatim
5. [ ] Copy/adapt a wrapper like `cover-image-upload.tsx`, replacing the upload block with your storage of choice
6. [ ] (Optional) Add an `icon-sm` size to your `Button` variants if it's missing — it's the small square zoom button. If your shadcn `Button` doesn't have it, use `size="icon"` instead.

That's it. The cropper has zero project-specific dependencies beyond shadcn + Tailwind.
