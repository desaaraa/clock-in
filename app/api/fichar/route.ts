import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

const minutos = (valor: number) => valor * 60 * 1000;
const TURNOS_NO_FICHABLES = new Set(['A', 'B', 'I', 'J', 'P0', 'P1', 'P13', 'P14',
   'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'Q', 'S', 'V', 'W']);

// Coordenadas permitidas y radio en metros para fichar
const LAT_PERMITIDA = 40.473027;
const LON_PERMITIDA = -3.695763;
const RADIO_METROS = 200;

//formula de Haversine para calcular distancia entre dos puntos geográficos
const haversineMetros = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const crearFechaHora = (fecha: string, hora: string) => {
  return new Date(`${fecha.split('T')[0]}T${hora}`);
};

const esTurnoFichable = (turno: any) => {
  return !TURNOS_NO_FICHABLES.has(turno.TURNO_CODIGO);
};

const buscarTurnoActual = (turnos: any[], ahora: Date) => {
  return turnos.find((turno) => {
    const inicio = crearFechaHora(turno.FECHA, turno.HORA_ENTRADA);
    const fin = crearFechaHora(turno.FECHA, turno.HORA_SALIDA);
    if (fin <= inicio) fin.setDate(fin.getDate() + 1);

    return ahora.getTime() >= inicio.getTime() - minutos(10) && ahora < fin;
  });
};

const buscarTurnoDeFichaje = (turnos: any[], entrada: Date) => {
  return turnos.find((turno) => {
    const inicio = crearFechaHora(turno.FECHA, turno.HORA_ENTRADA);
    const fin = crearFechaHora(turno.FECHA, turno.HORA_SALIDA);
    if (fin <= inicio) fin.setDate(fin.getDate() + 1);

    return entrada >= new Date(inicio.getTime() - minutos(10)) && entrada <= fin;
  });
};

export async function POST(peticion: Request) {
  try {
    const { empleado_id, lat, lon } = await peticion.json();

    if (!empleado_id) {
      return NextResponse.json({ mensaje: "Falta el empleado" }, { status: 400 });
    }

    // Validación de geolocalización
    if (lat == null || lon == null) {
      return NextResponse.json(
        { mensaje: "No se pudo obtener tu ubicación. Activa el GPS e inténtalo de nuevo." },
        { status: 400 }
      );
    }

    const distancia = haversineMetros(lat, lon, LAT_PERMITIDA, LON_PERMITIDA);
    if (distancia > RADIO_METROS) {
      return NextResponse.json(
        { mensaje: `No estás en el centro de trabajo. Distancia detectada: ${Math.round(distancia)} m (máximo permitido: ${RADIO_METROS} m).` },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE FICHAJES
       SET FECHA_HORA_SALIDA = DATE_ADD(FECHA_HORA_ENTRADA, INTERVAL 4 HOUR)
       WHERE EMPLEADO_ID = ?
         AND FECHA_HORA_SALIDA IS NULL
         AND NOW() >= DATE_ADD(FECHA_HORA_ENTRADA, INTERVAL 4 HOUR)`,
      [empleado_id]
    );

    const [reloj]: any = await pool.query('SELECT NOW() AS AHORA');
    const ahora = new Date(reloj[0].AHORA.replace(' ', 'T'));

    const [turnos]: any = await pool.query(
      `SELECT FECHA, HORA_ENTRADA, HORA_SALIDA, TURNO_CODIGO
       FROM PLANIFICACIONES
       WHERE EMPLEADO_ID = ?
         AND FECHA BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND CURDATE()
       ORDER BY FECHA ASC, HORA_ENTRADA ASC`,
      [empleado_id]
    );

    const [fichajesAbiertos]: any = await pool.query(
      `SELECT ID, FECHA_HORA_ENTRADA
       FROM FICHAJES
       WHERE EMPLEADO_ID = ?
         AND FECHA_HORA_SALIDA IS NULL
       ORDER BY FECHA_HORA_ENTRADA DESC
       LIMIT 1`,
      [empleado_id]
    );

    if (fichajesAbiertos.length > 0) {
      const fichaje = fichajesAbiertos[0];
      const entrada = new Date(fichaje.FECHA_HORA_ENTRADA.replace(' ', 'T'));
      const turno = buscarTurnoDeFichaje(turnos, entrada);

      if (!turno) {
        return NextResponse.json({ mensaje: "No se ha encontrado el turno asociado a este fichaje." }, { status: 400 });
      }

      const salidaTurno = crearFechaHora(turno.FECHA, turno.HORA_SALIDA);
      const entradaTurno = crearFechaHora(turno.FECHA, turno.HORA_ENTRADA);
      if (salidaTurno <= entradaTurno) salidaTurno.setDate(salidaTurno.getDate() + 1);

      if (ahora.getTime() < salidaTurno.getTime() - minutos(10)) {
        return NextResponse.json(
          { mensaje: "Aún no puedes fichar salida. Se permite desde 10 minutos antes de tu hora de salida." },
          { status: 400 }
        );
      }

      await pool.query(
        'UPDATE FICHAJES SET FECHA_HORA_SALIDA = NOW() WHERE ID = ?',
        [fichaje.ID]
      );

      return NextResponse.json({ mensaje: "Fichaje de salida registrado correctamente." }, { status: 200 });
    }

    const turnosFichables = turnos.filter(esTurnoFichable);
    const turnoActual = buscarTurnoActual(turnosFichables, ahora);

    if (!turnoActual) {
      const hoy = reloj[0].AHORA.split(' ')[0];
      const hayTurnoLaboralHoy = turnosFichables.some((turno: any) => turno.FECHA === hoy);

      if (!hayTurnoLaboralHoy) {
        return NextResponse.json(
          { mensaje: "Hoy no tienes un turno laboral asignado. No puedes fichar." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { mensaje: "No puedes fichar entrada todavía. Se permite desde 10 minutos antes de tu hora de entrada." },
        { status: 400 }
      );
    }

    await pool.query(
      'INSERT INTO FICHAJES (EMPLEADO_ID, FECHA_HORA_ENTRADA) VALUES (?, NOW())',
      [empleado_id]
    );

    return NextResponse.json({ mensaje: "Fichaje de entrada registrado correctamente." }, { status: 200 });
  } catch (error) {
    console.error("Error al registrar el fichaje:", error);
    return NextResponse.json({ mensaje: "Error interno del servidor al fichar" }, { status: 500 });
  }
}
