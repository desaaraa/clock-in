import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { puedeGestionarHorarios } from '@/app/lib/permisos';

const LIMITE_DIAS_LABORABLES = 22;

const crearFechaLocal = (fecha: string) => {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
};

const contarDiasLaborables = (fechaInicio: string, fechaFin: string) => {
  const inicio = crearFechaLocal(fechaInicio);
  const fin = crearFechaLocal(fechaFin);
  let total = 0;

  for (const cursor = new Date(inicio); cursor <= fin; cursor.setDate(cursor.getDate() + 1)) {
    const dia = cursor.getDay();
    if (dia !== 0 && dia !== 6) {
      total += 1;
    }
  }

  return total;
};

const enriquecerVacaciones = (vacaciones: any[]) => {
  return vacaciones.map((item) => ({
    ...item,
    DIAS_LABORABLES: contarDiasLaborables(item.FECHA_INICIO, item.FECHA_FIN),
  }));
};

const calcularResumenVacaciones = (vacaciones: any[]) => {
  const diasAprobados = vacaciones
    .filter((item) => item.ESTADO === 'APROBADA')
    .reduce((total, item) => total + item.DIAS_LABORABLES, 0);

  const diasPendientes = vacaciones
    .filter((item) => item.ESTADO === 'PENDIENTE')
    .reduce((total, item) => total + item.DIAS_LABORABLES, 0);

  const diasReservados = diasAprobados + diasPendientes;

  return {
    diasAprobados,
    diasPendientes,
    diasReservados,
    diasDisponibles: Math.max(0, LIMITE_DIAS_LABORABLES - diasReservados),
    limiteAnual: LIMITE_DIAS_LABORABLES,
  };
};


export async function POST(peticion: Request) {
  try {

    const body = await peticion.json();
    const { accion, empleado_id, puesto_id } = body;

    if (accion === 'listar') {
      const anio = Number(body.anio);

      const [misVacaciones]: any = await pool.query(
        `SELECT V.*, CONCAT(E.NOMBRE, ' ', E.APELLIDOS) AS EMPLEADO_NOMBRE
         FROM VACACIONES V
         INNER JOIN EMPLEADOS E ON V.EMPLEADO_ID = E.ID
         WHERE V.EMPLEADO_ID = ? AND V.ANIO = ?
         ORDER BY V.FECHA_INICIO ASC`,
        [empleado_id, anio]
      );

      const misVacacionesEnriquecidas = enriquecerVacaciones(misVacaciones);

      let pendientes: any[] = [];
      if (puedeGestionarHorarios(puesto_id)) {
        const [filas]: any = await pool.query(
          `SELECT V.*, CONCAT(E.NOMBRE, ' ', E.APELLIDOS) AS EMPLEADO_NOMBRE
           FROM VACACIONES V
           INNER JOIN EMPLEADOS E ON V.EMPLEADO_ID = E.ID
           WHERE V.RESPONSABLE_ID = ?
             AND V.ANIO = ?
             AND V.ESTADO = 'PENDIENTE'
           ORDER BY V.FECHA_INICIO ASC`,
          [empleado_id, anio]
        );
        pendientes = enriquecerVacaciones(filas);
      }

      return NextResponse.json({
        misVacaciones: misVacacionesEnriquecidas,
        pendientes,
        resumen: calcularResumenVacaciones(misVacacionesEnriquecidas),
      });
    }

    if (accion === 'solicitar') {
      const { fecha_inicio, fecha_fin } = body;
      const anio = new Date(`${fecha_inicio}T00:00:00`).getFullYear();

      if (!fecha_inicio || !fecha_fin || fecha_fin < fecha_inicio) {
        return NextResponse.json({ mensaje: "Rango de fechas no válido" }, { status: 400 });
      }

      if (crearFechaLocal(fecha_inicio).getFullYear() !== crearFechaLocal(fecha_fin).getFullYear()) {
        return NextResponse.json({ mensaje: "La solicitud debe estar dentro del mismo año natural." },
           { status: 400 });
      }

      const diasLaborablesSolicitud = contarDiasLaborables(fecha_inicio, fecha_fin);

      if (diasLaborablesSolicitud === 0) {
        return NextResponse.json({ mensaje: "Selecciona al menos un día laborable de lunes a viernes." },
           { status: 400 });
      }

      const [empleados]: any = await pool.query(
        'SELECT RESPONSABLE_ID FROM EMPLEADOS WHERE ID = ?',
        [empleado_id]
      );

      if (empleados.length === 0) {
        return NextResponse.json({ mensaje: "Empleado no encontrado" }, { status: 404 });
      }

      const [solapadas]: any = await pool.query(
        `SELECT ID
         FROM VACACIONES
         WHERE EMPLEADO_ID = ?
           AND ESTADO IN ('PENDIENTE', 'APROBADA')
           AND NOT (FECHA_FIN < ? OR FECHA_INICIO > ?)`,
        [empleado_id, fecha_inicio, fecha_fin]
      );

      if (solapadas.length > 0) {
        return NextResponse.json({ mensaje: "Ya tienes una solicitud que coincide con esas fechas." },
           { status: 400 });
      }

      const [existentes]: any = await pool.query(
        `SELECT FECHA_INICIO, FECHA_FIN
         FROM VACACIONES
         WHERE EMPLEADO_ID = ?
           AND ANIO = ?
           AND ESTADO IN ('PENDIENTE', 'APROBADA')`,
        [empleado_id, anio]
      );

      const diasReservados = existentes.reduce((total: number, item: any) => {
        return total + contarDiasLaborables(item.FECHA_INICIO, item.FECHA_FIN);
      }, 0);

      if (diasReservados + diasLaborablesSolicitud > LIMITE_DIAS_LABORABLES) {
        return NextResponse.json(
          { mensaje: `Con esta solicitud superarías los ${LIMITE_DIAS_LABORABLES} días laborables anuales.` },
          { status: 400 }
        );
      }

      await pool.query(
        `INSERT INTO VACACIONES (EMPLEADO_ID, RESPONSABLE_ID, ANIO, FECHA_INICIO, FECHA_FIN, ESTADO)
         VALUES (?, ?, ?, ?, ?, 'PENDIENTE')`,
        [empleado_id, empleados[0].RESPONSABLE_ID, anio, fecha_inicio, fecha_fin]
      );

      return NextResponse.json(
        { mensaje: `Solicitud enviada por ${diasLaborablesSolicitud} día(s) laborable(s).` },
        { status: 200 }
      );
    }

    if (accion === 'validar') {
      const { vacaciones_id, estado } = body;
      const nuevoEstado = estado === 'APROBADA' ? 'APROBADA' : 'RECHAZADA';

      if (!puedeGestionarHorarios(puesto_id)) {
        return NextResponse.json({ mensaje: "No tienes permisos para validar vacaciones" }, { status: 403 });
      }

      const [resultado]: any = await pool.query(
        `UPDATE VACACIONES
         SET ESTADO = ?, FECHA_VALIDACION = NOW()
         WHERE ID = ? AND RESPONSABLE_ID = ?`,
        [nuevoEstado, vacaciones_id, empleado_id]
      );

      if (resultado.affectedRows === 0) {
        return NextResponse.json({ mensaje: "Solicitud no encontrada" }, { status: 404 });
      }

      // Notificar al empleado
      const [vacFilas]: any = await pool.query(
        `SELECT EMPLEADO_ID, FECHA_INICIO, FECHA_FIN FROM VACACIONES WHERE ID = ?`,
        [vacaciones_id]
      );

      if (vacFilas.length > 0) {
        const vac = vacFilas[0];
        const textoEstado = nuevoEstado === 'APROBADA' ? 'aprobadas ✅' : 'rechazadas ❌';
        const titulo = nuevoEstado === 'APROBADA' ? 'Vacaciones aprobadas' : 'Vacaciones rechazadas';

        await pool.query(
          `INSERT INTO NOTIFICACIONES (EMPLEADO_ID, TIPO, TITULO, MENSAJE, REF_ID)
           VALUES (?, 'VACACIONES', ?, ?, ?)`,
          [
            vac.EMPLEADO_ID,
            titulo,
            `Tus vacaciones del ${vac.FECHA_INICIO} al ${vac.FECHA_FIN} han sido ${textoEstado}.`,
            vacaciones_id,
          ]
        );
      }

      return NextResponse.json({ mensaje: "Solicitud actualizada" }, { status: 200 });
    }

    return NextResponse.json({ mensaje: "Acción no válida" }, { status: 400 });
  } catch (error) {
    console.error("Error en vacaciones:", error);
    return NextResponse.json({ mensaje: "Error interno del servidor" }, { status: 500 });
  }
}
