// app/api/planificacion-mes/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db'; 

export async function POST(peticion: Request) {
  try {
    const { empleado_id, mes, anio } = await peticion.json();

    // Consulta para traer el color y la descripción del turno
    const [filas]: any = await pool.query(
      `SELECT P.*, T.DESCRIPCION, T.COLOR_HEX 
       FROM PLANIFICACIONES P
       INNER JOIN TURNOS T ON P.TURNO_CODIGO = T.CODIGO
       WHERE P.EMPLEADO_ID = ? AND MONTH(P.FECHA) = ? AND YEAR(P.FECHA) = ?
       ORDER BY P.FECHA ASC, P.HORA_ENTRADA ASC`,
      [empleado_id, mes, anio]
    );

    return NextResponse.json(filas);
  } catch (error) {
    return NextResponse.json({ mensaje: "Error" }, { status: 500 });
  }
}