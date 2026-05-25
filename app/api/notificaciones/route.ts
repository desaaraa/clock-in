// app/api/notificaciones/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';


export async function POST(peticion: Request) {
  try {
    
    const body = await peticion.json();
    const { accion, empleado_id } = body;

    if (accion === 'listar') {
      const [notificaciones]: any = await pool.query(
        `SELECT * FROM NOTIFICACIONES
         WHERE EMPLEADO_ID = ?
         ORDER BY FECHA_CREACION DESC
         LIMIT 50`,
        [empleado_id]
      );
      return NextResponse.json(notificaciones);
    }

    if (accion === 'marcar_leida') {
      const { notificacion_id } = body;
      await pool.query(
        `UPDATE NOTIFICACIONES SET LEIDA = 1 WHERE ID = ? AND EMPLEADO_ID = ?`,
        [notificacion_id, empleado_id]
      );
      return NextResponse.json({ mensaje: 'Marcada como leída' });
    }

    if (accion === 'marcar_todas_leidas') {
      await pool.query(
        `UPDATE NOTIFICACIONES SET LEIDA = 1 WHERE EMPLEADO_ID = ?`,
        [empleado_id]
      );
      return NextResponse.json({ mensaje: 'Todas marcadas como leídas' });
    }

    return NextResponse.json({ mensaje: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error en notificaciones:', error);
    return NextResponse.json({ mensaje: 'Error interno del servidor' }, { status: 500 });
  }
}
