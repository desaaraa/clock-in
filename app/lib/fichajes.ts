// app/lib/fichajes.ts
// Lógica compartida entre /api/fichar y /api/fichaje-estado
import { pool } from './db';

export const minutos = (valor: number) => valor * 60 * 1000;

export const crearFechaHora = (fecha: string, hora: string) => {
  return new Date(`${fecha.split('T')[0]}T${hora}`);
};

export const buscarTurnoDeFichaje = (turnos: any[], entrada: Date) => {
  return turnos.find((turno) => {
    const inicio = crearFechaHora(turno.FECHA, turno.HORA_ENTRADA);
    const fin = crearFechaHora(turno.FECHA, turno.HORA_SALIDA);
    if (fin <= inicio) fin.setDate(fin.getDate() + 1);
    return entrada >= new Date(inicio.getTime() - minutos(10)) && entrada <= fin;
  });
};

const formatearParaMySQL = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

/**
 * Cierra automáticamente fichajes que llevan más de 2 horas pasada
 * la HORA_SALIDA planificada. Establece la salida a la hora del turno,
 * no a la hora actual.
 */
export const autoCerrarFichajesOlvidados = async (empleado_id: number) => {
  const [fichajesAbiertos]: any = await pool.query(
    `SELECT ID, FECHA_HORA_ENTRADA FROM FICHAJES
     WHERE EMPLEADO_ID = ? AND FECHA_HORA_SALIDA IS NULL`,
    [empleado_id]
  );

  if (fichajesAbiertos.length === 0) return;

  const [turnos]: any = await pool.query(
    `SELECT FECHA, HORA_ENTRADA, HORA_SALIDA
     FROM PLANIFICACIONES
     WHERE EMPLEADO_ID = ?
       AND FECHA BETWEEN DATE_SUB(CURDATE(), INTERVAL 2 DAY) AND CURDATE()`,
    [empleado_id]
  );

  const ahora = new Date();

  for (const fichaje of fichajesAbiertos) {
    const entrada = new Date(fichaje.FECHA_HORA_ENTRADA.replace(' ', 'T'));
    const turno = buscarTurnoDeFichaje(turnos, entrada);
    if (!turno) continue;

    const salidaTurno = crearFechaHora(turno.FECHA, turno.HORA_SALIDA);
    const entradaTurno = crearFechaHora(turno.FECHA, turno.HORA_ENTRADA);
    // Turno nocturno: la salida es al día siguiente
    if (salidaTurno <= entradaTurno) salidaTurno.setDate(salidaTurno.getDate() + 1);

    // Solo cerrar si han pasado más de 2 horas desde la hora de salida del turno
    if (ahora.getTime() > salidaTurno.getTime() + minutos(120)) {
      await pool.query(
        'UPDATE FICHAJES SET FECHA_HORA_SALIDA = ? WHERE ID = ?',
        [formatearParaMySQL(salidaTurno), fichaje.ID]
      );
    }
  }
};
