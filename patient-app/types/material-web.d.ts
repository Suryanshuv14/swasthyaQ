import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        [elemName: `md-${string}`]: any
      }
    }
  }
}

export {}
