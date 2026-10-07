import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ASR-RD/', // Set exact repository base path for https://yoursha.github.io/ASR-RD/
})
