// Script de build para empaquetar la Lambda en un único archivo
// Genera dist/index.js listo para comprimir y subir a AWS Lambda
import { build } from 'esbuild'

await build({
  entryPoints: ['src/handler.ts'],
  bundle: true,
  minify: false,          // false para facilitar debugging en desarrollo
  platform: 'node',
  target: 'node20',
  format: 'cjs',          // CommonJS requerido por Lambda Node.js runtime
  outfile: 'dist/index.js',
  external: [
    // AWS SDK v3 está disponible en el runtime de Lambda 20.x
    // Se excluye del bundle para reducir el tamaño del zip
    '@aws-sdk/*',
  ],
  sourcemap: false,
  logLevel: 'info',
})

console.log('✓ Lambda bundle generado en dist/index.js')
