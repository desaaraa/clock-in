// app/api/mis-fichajes/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

export async function POST(peticion: Request) {
  try {
    const body = await peticion.json();
    const { empleado_id, responsable_id, fecha_inicio, fecha_fin } = body;

    if (!empleado_id) {
      return NextResponse.json({ mensaje: 'Falta el empleado_id' }, { status: 400 });
    }

    const desde = fecha_inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const hasta = fecha_fin || new Date().toISOString().split('T')[0];

    // Fichajes propios
    const [propios]: any = await pool.query(
      `SELECT F.ID, F.EMPLEADO_ID, F.FECHA_HORA_ENTRADA, F.FECHA_HORA_SALIDA,
              CONCAT(E.NOMBRE, ' ', E.APELLIDOS) AS EMPLEADO_NOMBRE,
              TIMEDIFF(
                COALESCE(F.FECHA_HORA_SALIDA, NOW()),
                F.FECHA_HORA_ENTRADA
              ) AS DURACION
       FROM FICHAJES F
       INNER JOIN EMPLEADOS E ON F.EMPLEADO_ID = E.ID
       WHERE F.EMPLEADO_ID = ?
         AND DATE(F.FECHA_HORA_ENTRADA) BETWEEN ? AND ?
       ORDER BY F.FECHA_HORA_ENTRADA DESC`,
      [empleado_id, desde, hasta]
    );

    let equipo: any[] = [];

    // Si es responsable, también traemos los fichajes de su equipo
    if (responsable_id) {
      const [filaEquipo]: any = await pool.query(
        `SELECT F.ID, F.EMPLEADO_ID, F.FECHA_HORA_ENTRADA, F.FECHA_HORA_SALIDA,
                CONCAT(E.NOMBRE, ' ', E.APELLIDOS) AS EMPLEADO_NOMBRE,
                TIMEDIFF(
                  COALESCE(F.FECHA_HORA_SALIDA, NOW()),
                  F.FECHA_HORA_ENTRADA
                ) AS DURACION
         FROM FICHAJES F
         INNER JOIN EMPLEADOS E ON F.EMPLEADO_ID = E.ID
         WHERE E.RESPONSABLE_ID = ?
           AND DATE(F.FECHA_HORA_ENTRADA) BETWEEN ? AND ?
         ORDER BY E.NOMBRE ASC, F.FECHA_HORA_ENTRADA DESC`,
        [responsable_id, desde, hasta]
      );
      equipo = filaEquipo;
    }

    return NextResponse.json({ propios, equipo });
  } catch (error) {
    console.error('Error en mis-fichajes:', error);
    return NextResponse.json({ mensaje: 'Error interno del servidor' }, { status: 500 });
  }
}
