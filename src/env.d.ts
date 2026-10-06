/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'element-plus/dist/locale/tk.mjs' {
  const tk: any
  export default tk
}

declare module 'element-plus/dist/locale/ru.mjs' {
  const ru: any
  export default ru
}

declare module 'element-plus/dist/locale/en.mjs' {
  const en: any
  export default en
}
