'use client'

import { useEffect } from 'react'

/**
 * Client-side loader for @material/web custom elements.
 * Registers Web Components safely on the client to avoid SSR hydration mismatches.
 */
export function MaterialWebLoader() {
  useEffect(() => {
    // Dynamically import all Material Web Custom Elements on client mount
    Promise.all([
      import('@material/web/button/filled-button.js'),
      import('@material/web/button/outlined-button.js'),
      import('@material/web/button/text-button.js'),
      import('@material/web/button/elevated-button.js'),
      import('@material/web/icon/icon.js'),
      import('@material/web/iconbutton/icon-button.js'),
      import('@material/web/iconbutton/filled-icon-button.js'),
      import('@material/web/textfield/filled-text-field.js'),
      import('@material/web/textfield/outlined-text-field.js'),
      import('@material/web/dialog/dialog.js'),
      import('@material/web/tabs/tabs.js'),
      import('@material/web/tabs/primary-tab.js'),
      import('@material/web/tabs/secondary-tab.js'),
      import('@material/web/chips/chip-set.js'),
      import('@material/web/chips/assist-chip.js'),
      import('@material/web/chips/filter-chip.js'),
      import('@material/web/chips/input-chip.js'),
      import('@material/web/chips/suggestion-chip.js'),
      import('@material/web/progress/circular-progress.js'),
      import('@material/web/progress/linear-progress.js'),
      import('@material/web/checkbox/checkbox.js'),
      import('@material/web/switch/switch.js'),
      import('@material/web/divider/divider.js'),
      import('@material/web/elevation/elevation.js'),
      import('@material/web/ripple/ripple.js'),
      import('@material/web/focus/md-focus-ring.js'),
    ]).catch((err) => {
      console.warn('Material Web components hydration warning:', err)
    })
  }, [])

  return null
}
