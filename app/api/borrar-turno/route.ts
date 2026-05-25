import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { puedeGestionarHorarios } from '@/app/lib/permisos';

export async function POST(peticion: Request) {
  try {
    const { empleado_id, fecha, hora_entrada, hora_salida, turno_codigo, responsable_puesto_id, responsable_id } = await peticion.json();

    if (!puedeGestionarHorarios(responsable_puesto_id)) {
      return NextResponse.json({ mensaje: "No tienes permisos para borrar horarios" }, { status: 403 });
    }

    if (!empleado_id || !fecha || !hora_entrada || !hora_salida || !turno_codigo) {
      return NextResponse.json({ mensaje: "Faltan datos para borrar el turno" }, { status: 400 });
    }

    const [resultado]: any = await pool.query(
      `DELETE FROM PLANIFICACIONES
       WHERE EMPLEADO_ID = ? AND FECHA = ? AND HORA_ENTRADA = ? AND HORA_SALIDA = ? AND TURNO_CODIGO = ?
       LIMIT 1`,
      [empleado_id, fecha, hora_entrada, hora_salida, turno_codigo]
    );

    if (resultado.affectedRows === 0) {
      return NextResponse.json({ mensaje: "No se ha encontrado el turno" }, { status: 404 });
    }

    // Notificar al empleado si un responsable borra su turno
    if (responsable_id && String(responsable_id) !== String(empleado_id)) {
      try {
        await pool.query(
          `INSERT INTO NOTIFICACIONES (EMPLEADO_ID, TIPO, TITULO, MENSAJE)
           VALUES (?, 'CAMBIO_HORARIO', 'Tu responsable ha eliminado un turno de tu horario', ?)`,
          [
            empleado_id,
            `Tu responsable ha eliminado el turno ${turno_codigo} (${hora_entrada.substring(0,5)} - ${hora_salida.substring(0,5)}) del d\u00eda ${fecha}.`,
          ]
        );
      } catch (e) {
        console.error('No se pudo crear notificaci\u00f3n de borrado:', e);
      }
    }

    return NextResponse.json({ mensaje: "Turno borrado correctamente" }, { status: 200 });
  } catch (error) {
    console.error("Error al borrar turno:", error);
    return NextResponse.json({ mensaje: "Error interno del servidor" }, { status: 500 });
  }
}
