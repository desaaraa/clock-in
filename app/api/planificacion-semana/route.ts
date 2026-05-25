import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db'; 

export async function POST(peticion: Request) {
  try {
    const { puesto_id, fechaInicio, fechaFin } = await peticion.json();

    // Consulta para obtener la planificación semanal del equipo
    const [filas]: any = await pool.query(
      `SELECT P.*, E.NOMBRE, E.APELLIDOS, T.DESCRIPCION, T.COLOR_HEX 
       FROM PLANIFICACIONES P
       INNER JOIN EMPLEADOS E ON P.EMPLEADO_ID = E.ID
       INNER JOIN TURNOS T ON P.TURNO_CODIGO = T.CODIGO
       WHERE E.PUESTO_ID = ? AND P.FECHA >= ? AND P.FECHA <= ?
       ORDER BY P.FECHA ASC, P.HORA_ENTRADA ASC`,
      [puesto_id, fechaInicio, fechaFin]
    );

    return NextResponse.json(filas);
  } catch (error) {
    return NextResponse.json({ mensaje: "Error" }, { status: 500 });
  }
}