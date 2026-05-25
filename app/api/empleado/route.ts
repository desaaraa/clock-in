import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

export async function POST(peticion: Request) {
  try {
    const { empleado_id } = await peticion.json();

    // Consulta para obtener los datos del empleado y mostrarlos
    const [filas]: any = await pool.query(
      `SELECT E.ID, E.DNI, E.NOMBRE, E.APELLIDOS, E.EMAIL, E.PUESTO_ID, E.RESPONSABLE_ID,
              P.NOMBRE AS PUESTO_NOMBRE,
              CONCAT(R.NOMBRE, ' ', R.APELLIDOS) AS RESPONSABLE_NOMBRE
       FROM EMPLEADOS E
       LEFT JOIN PUESTOS P ON E.PUESTO_ID = P.ID
       LEFT JOIN EMPLEADOS R ON E.RESPONSABLE_ID = R.ID
       WHERE E.ID = ?`,
      [empleado_id]
    );

    if (filas.length === 0) {
      return NextResponse.json({ mensaje: "Empleado no encontrado" }, { status: 404 });
    }

    return NextResponse.json(filas[0]);
  } catch (error) {
    console.error("Error al cargar empleado:", error);
    return NextResponse.json({ mensaje: "Error interno del servidor" }, { status: 500 });
  }
}
