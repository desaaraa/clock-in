import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

export async function POST(peticion: Request) {
  try {
    const { empleado_id, puesto_id } = await peticion.json();

    // Consultamos el horario del empleado para la semana actual
    const [horarioBD]: any = await pool.query(
      `SELECT FECHA, HORA_ENTRADA, HORA_SALIDA, TURNO_CODIGO
       FROM PLANIFICACIONES
       WHERE EMPLEADO_ID = ?
         AND FECHA BETWEEN DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                       AND DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 6 DAY)
       ORDER BY FECHA ASC, HORA_ENTRADA ASC`,
      [empleado_id]
    );

    // Consultamos el equipo que trabaja hoy en el mismo puesto
    const [equipoBD]: any = await pool.query(
      `SELECT E.NOMBRE, E.APELLIDOS, P.HORA_ENTRADA, P.HORA_SALIDA, P.TURNO_CODIGO
       FROM EMPLEADOS E
       INNER JOIN PLANIFICACIONES P ON E.ID = P.EMPLEADO_ID
       WHERE E.PUESTO_ID = ?
         AND P.FECHA = CURDATE()
       ORDER BY P.HORA_ENTRADA ASC, E.NOMBRE ASC`,
      [puesto_id]
    );

    return NextResponse.json({ horario: horarioBD, equipo: equipoBD }, { status: 200 });
  } catch (error) {
    console.error("Error al cargar el dashboard:", error);
    return NextResponse.json({ mensaje: "Error interno del servidor" }, { status: 500 });
  }
}
