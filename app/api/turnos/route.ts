// app/api/turnos/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db'; 

export async function GET() {
  try {
    // Consulta para obtener los turnos ordenados alfabéticamente
    const [turnos]: any = await pool.query(
      'SELECT CODIGO, DESCRIPCION, COLOR_HEX FROM TURNOS ORDER BY CODIGO ASC'
    );

    return NextResponse.json(turnos, { status: 200 });
    
  } catch (error) {
    console.error("Error al cargar los turnos:", error);
    return NextResponse.json({ mensaje: "Error interno del servidor" }, { status: 500 });
  }
}