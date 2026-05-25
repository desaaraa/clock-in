// app/api/guardar-turno/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db'; 
import { puedeGestionarHorarios } from '@/app/lib/permisos';

const normalizarMinutos = (hora: string) => {
  const [horas, minutos] = hora.split(':').map(Number);
  let total = horas * 60 + minutos;

  if (horas < 6) {
    total += 24 * 60;
  }

  return total;
};

const obtenerRango = (entrada: string, salida: string) => {
  const inicio = normalizarMinutos(entrada);
  let fin = normalizarMinutos(salida);

  if (fin <= inicio) {
    fin += 24 * 60;
  }

  return { inicio, fin };
};

const haySolape = (
  actual: { inicio: number; fin: number },
  existente: { inicio: number; fin: number }
) => {
  return actual.inicio < existente.fin && existente.inicio < actual.fin;
};


export async function POST(peticion: Request) {
  try {
    const { empleado_id, fecha, hora_entrada, hora_salida, turno_codigo, responsable_puesto_id, responsable_id } = await peticion.json();

    if (!puedeGestionarHorarios(responsable_puesto_id)) {
      return NextResponse.json({ mensaje: "No tienes permisos para asignar horarios" }, { status: 403 });
    }

    if (!empleado_id || !fecha || !hora_entrada || !hora_salida || !turno_codigo) {
      return NextResponse.json({ mensaje: "Faltan datos para guardar el turno" }, { status: 400 });
    }

    const rangoNuevo = obtenerRango(hora_entrada, hora_salida);
    if (rangoNuevo.inicio === rangoNuevo.fin) {
      return NextResponse.json({ mensaje: "El tramo horario no es válido" }, { status: 400 });
    }

    const [turnosExistentes]: any = await pool.query(
      `SELECT HORA_ENTRADA, HORA_SALIDA, TURNO_CODIGO
       FROM PLANIFICACIONES
       WHERE EMPLEADO_ID = ?
         AND FECHA = ?`,
      [empleado_id, fecha]
    );

    const existeSolape = turnosExistentes.some((turno: any) => {
      return haySolape(rangoNuevo, obtenerRango(turno.HORA_ENTRADA, turno.HORA_SALIDA));
    });

    if (existeSolape) {
      return NextResponse.json(
        { mensaje: "Ese tramo se solapa con otro horario ya asignado. Bórralo antes de volver a dibujarlo." },
        { status: 409 }
      );
    }

    // Insertar el turno
    await pool.query(
      'INSERT INTO PLANIFICACIONES (EMPLEADO_ID, FECHA, HORA_ENTRADA, HORA_SALIDA, TURNO_CODIGO) VALUES (?, ?, ?, ?, ?)',
      [empleado_id, fecha, hora_entrada, hora_salida, turno_codigo]
    );

    // Notificar al empleado si es un responsable quien asigna (no el propio empleado)
    if (responsable_id && String(responsable_id) !== String(empleado_id)) {
      try {
        const esPrimerTurno = turnosExistentes.length === 0;
        const titulo = esPrimerTurno ? 'Nuevo turno asignado en tu horario' : 'Tu responsable ha modificado tu horario';
        const mensaje = esPrimerTurno
          ? `Tu responsable ha asignado el turno ${turno_codigo} (${hora_entrada.substring(0,5)} - ${hora_salida.substring(0,5)}) para el d\u00eda ${fecha}.`
          : `Tu responsable ha a\u00f1adido el turno ${turno_codigo} (${hora_entrada.substring(0,5)} - ${hora_salida.substring(0,5)}) el d\u00eda ${fecha}.`;
        await pool.query(
          `INSERT INTO NOTIFICACIONES (EMPLEADO_ID, TIPO, TITULO, MENSAJE) VALUES (?, 'CAMBIO_HORARIO', ?, ?)`,
          [empleado_id, titulo, mensaje]
        );
      } catch (e) {
        console.error('No se pudo crear notificaci\u00f3n de asignaci\u00f3n:', e);
      }
    }

    return NextResponse.json({ mensaje: "Turno asignado correctamente" }, { status: 200 });
  } catch (error) {
    console.error("Error al guardar turno:", error);
    return NextResponse.json({ mensaje: "Error interno del servidor" }, { status: 500 });
  }
}

