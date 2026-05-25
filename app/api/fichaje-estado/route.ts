// app/api/fichaje-estado/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

export async function POST(peticion: Request) {
  try {
    const { empleado_id } = await peticion.json();

    // Auto-cerrar fichajes de más de 4 horas
    await pool.query(
      `UPDATE FICHAJES
       SET FECHA_HORA_SALIDA = DATE_ADD(FECHA_HORA_ENTRADA, INTERVAL 4 HOUR)
       WHERE EMPLEADO_ID = ?
         AND FECHA_HORA_SALIDA IS NULL
         AND NOW() >= DATE_ADD(FECHA_HORA_ENTRADA, INTERVAL 4 HOUR)`,
      [empleado_id]
    );

    // Comprobar si hay un fichaje abierto para este empleado
    const [filas]: any = await pool.query(
      `SELECT ID FROM FICHAJES WHERE EMPLEADO_ID = ? AND FECHA_HORA_SALIDA IS NULL ORDER BY FECHA_HORA_ENTRADA DESC LIMIT 1`,
      [empleado_id]
    );

    return NextResponse.json({ abierto: filas.length > 0 });
  } catch {
    return NextResponse.json({ abierto: false }, { status: 500 });
  }
}
