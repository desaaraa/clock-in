// app/api/equipo-responsable/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db'; 

export async function POST(peticion: Request) {
  try {
    const { responsable_id } = await peticion.json();
    // Buscamos a los empleados que tienen como responsable al ID el usuario logueado o es null
    const [empleados]: any = await pool.query(
      `SELECT ID, NOMBRE, APELLIDOS FROM EMPLEADOS
       WHERE RESPONSABLE_ID = ?
          OR (ID = ? AND RESPONSABLE_ID IS NULL)
       ORDER BY NOMBRE ASC`,
      [responsable_id, responsable_id]
    );

    return NextResponse.json(empleados);
  } catch (error) {
    return NextResponse.json({ mensaje: "Error al buscar el equipo" }, { status: 500 });
  }
}