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
            // Escape "<" so editor-controlled text can never close the script tag.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, '\\u003c') }}
          />
        </Fragment>
      ))}
    </>
  )
}
