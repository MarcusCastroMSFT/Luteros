import { Fragment } from 'react'

type JsonLdData = Record<string, unknown>

/**
 * Renders one or more schema.org JSON-LD blocks as <script type="application/ld+json">.
 * Pass a single object or an array of objects.
 */
export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }) {
  const blocks = Array.isArray(data) ? data : [data]
  return (
    <>
      {blocks.map((block, i) => (
        <Fragment key={i}>
          <script
            type="application/ld+json"
            // JSON.stringify output is safe here; keys/values are app-controlled.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          />
        </Fragment>
      ))}
    </>
  )
}
