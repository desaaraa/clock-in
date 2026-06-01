// scripts/hashear-passwords.mjs
// Ejecutar UNA SOLA VEZ para hashear las contraseñas existentes en la BD.
// Comando usado: node scripts/hashear-passwords.mjs

import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Cargamos .env.local manualmente (Node no lo hace automáticamente)
try {
  const env = readFileSync('.env.local', 'utf8');
  env.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  });
} catch {
  console.log('No se encontró .env.local, usando variables de entorno del sistema.');
}

const pool = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST || 'localhost',
  user: process.env.MYSQL_ADDON_USER || 'root',
  password: process.env.MYSQL_ADDON_PASSWORD || '',
  database: process.env.MYSQL_ADDON_DB || 'clockin',
  port: Number(process.env.MYSQL_ADDON_PORT) || 3306,
});

async function hashearPasswords() {
  const conn = await pool.getConnection();
  try {
    const [empleados] = await conn.query('SELECT ID, PASSWORD FROM EMPLEADOS');
    console.log(`\nEncontrados ${empleados.length} empleados. Hasheando contraseñas...\n`);

    let actualizados = 0;
    for (const emp of empleados) {
      // Si ya está hasheada (empieza por $2b$), la saltamos
      if (emp.PASSWORD.startsWith('$2b$') || emp.PASSWORD.startsWith('$2a$')) {
        console.log(`  [SKIP] ID ${emp.ID} — ya tiene hash bcrypt`);
        continue;
      }

      const hash = await bcrypt.hash(emp.PASSWORD, 12);
      await conn.query('UPDATE EMPLEADOS SET PASSWORD = ? WHERE ID = ?', [hash, emp.ID]);
      console.log(`  [OK]   ID ${emp.ID} — "${emp.PASSWORD}" → hasheada`);
      actualizados++;
    }

    console.log(`\n Proceso completado. ${actualizados} contraseñas actualizadas.`);
  } finally {
    conn.release();
    await pool.end();
  }
}

hashearPasswords().catch(err => {
  console.error(' Error:', err.message);
  process.exit(1);
});
