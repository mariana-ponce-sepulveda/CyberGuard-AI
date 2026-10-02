import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // VITE_API_ENDPOINT se lee desde .env.local en producción
  // y desde las variables de entorno de AWS Amplify en el despliegue
})
