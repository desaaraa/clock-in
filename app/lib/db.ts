// app/lib/db.ts
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      // Usuario por defecto de XAMPP
  password: '',      // XAMPP por defecto no tiene contraseña
  database: 'clockin', // Nombre de la base de datos en XAMPP
  dateStrings: true,
});
