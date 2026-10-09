import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const SUPABASE_URL = 'https://xmlobzzlszwprjtrkicv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbG9ienpsc3p3cHJqdHJraWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0OTQ3MjksImV4cCI6MjEwMjA3MDcyOX0.vqxcGLSrSGxlbP7yGwnQvdDT52wgbxyH56mTGi8eNEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function main() {
  console.log('===================================================');
  console.log('  🚀 PUBLICADOR DE ACTUALIZACIONES OTA (ANIMEZONA)  ');
  console.log('===================================================\n');

  // 1. Obtener versión y changelog por argumentos o interactivo
  let version = (process.argv[2] || '').trim();
  let changelog = (process.argv[3] || '').trim();

  if (!version) {
    version = await askQuestion('👉 Ingresa el número de versión (ej: 1.0.1): ');
  }
  if (!version) {
    console.error('❌ La versión es requerida.');
    process.exit(1);
  }

  if (!changelog) {
    changelog = await askQuestion('📝 Novedades/Changelog (ej: Corrección de servidores y bugs): ');
  }
  if (!changelog) changelog = 'Mejoras de rendimiento y corrección de errores.';

  console.log(`\n📦 Preparando versión: v${version}`);
  console.log(`📝 Novedades: ${changelog}`);

  const rootDir = path.resolve('.');
  const distDir = path.join(rootDir, 'dist');
  const zipPath = path.join(rootDir, `update-v${version}.zip`);

  // 2. Compilar aplicación con Vite
  console.log('\n[1/4] 🔨 Compilando la aplicación (vite build)...');
  execSync('npm run build', { stdio: 'inherit' });

  // 3. Comprimir carpeta dist
  console.log('\n[2/4] 🗜️ Comprimiendo paquete dist en ZIP...');
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  // Usar PowerShell Compress-Archive
  execSync(`powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipPath}' -Force"`, {
    stdio: 'inherit'
  });

  if (!fs.existsSync(zipPath)) {
    console.error('❌ Error: No se pudo crear el archivo ZIP.');
    process.exit(1);
  }

  const zipStats = fs.statSync(zipPath);
  const sizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Archivo ZIP generado con éxito (${sizeMB} MB): ${zipPath}`);

  // 4. Subir a Supabase Storage (bucket app-updates)
  console.log('\n[3/4] ☁️ Subiendo actualización a Supabase Storage...');
  const fileBuffer = fs.readFileSync(zipPath);
  const storagePath = `bundles/dist-v${version}.zip`;

  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('app-updates')
    .upload(storagePath, fileBuffer, {
      contentType: 'application/zip',
      upsert: true
    });

  if (uploadErr) {
    console.error('❌ Error al subir a Supabase Storage:', uploadErr.message);
    process.exit(1);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/app-updates/${storagePath}`;
  console.log(`✅ Subido a la nube: ${publicUrl}`);

  // 5. Registrar en la tabla app_updates
  console.log('\n[4/4] 📝 Registrando versión en la base de datos...');
  const { error: dbErr } = await supabase
    .from('app_updates')
    .upsert({
      version: version,
      bundle_url: publicUrl,
      changelog: changelog,
      is_active: true
    }, { onConflict: 'version' });

  if (dbErr) {
    console.error('❌ Error al registrar versión en Supabase:', dbErr.message);
    process.exit(1);
  }

  // Limpiar zip local
  try {
    fs.unlinkSync(zipPath);
  } catch {}

  console.log('\n===================================================');
  console.log(`🎉 ¡ACTUALIZACIÓN v${version} PUBLICADA CON ÉXITO!`);
  console.log('===================================================');
  console.log('Tus usuarios (y tú) ya pueden abrir la app en el celular,');
  console.log('ir a Perfil y presionar [Actualizar ahora] para recibir');
  console.log('todos los cambios en segundos sin reinstalar ningún APK.');
  console.log('===================================================\n');
}

main().catch(err => {
  console.error('❌ Error crítico:', err);
  process.exit(1);
});
