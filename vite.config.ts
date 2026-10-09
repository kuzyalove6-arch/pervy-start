import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  const pages = process.env.GITHUB_PAGES === 'true'
  return {
    base: pages ? '/pervy-start/' : '/',
    plugins: [react()],
    build: {
      rollupOptions: {
        input: pages ? { main: 'index.html' } : { main: 'index.html', presentation: 'Презентация_защита.html', presentation2: 'Презентация_защита_вариант_2.html' },
      },
    },
  }
})
