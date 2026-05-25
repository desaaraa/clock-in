// app/dashboard/planificacion-mes/page.tsx
"use client";
import React, { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import estilos from './planificacion.module.css';
import {
  agruparDiasMesPorSemanas,
  calcularHorasEntre,
  crearFechaLocalDesdeISO,
  formatearFechaLocal,
  normalizarFechaISO,
  obtenerIndiceDiaLunes,
  obtenerInicioSemanaLunes,
  sumarHorasTurnos,
} from '@/app/lib/fechas';
import { useUsuario } from '@/app/lib/hooks/useUsuario';

export default function PlanificacionMesPage() {
  const usuario = useUsuario();
  const [datos, setDatos] = useState<any[]>([]);
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());
  const [leyendaDinamica, setLeyendaDinamica] = useState<any[]>([]);
  const [detalleDiaActivo, setDetalleDiaActivo] = useState<string | null>(null);

  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const inicialesDias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Cargamos datos del mes cuando el usuario esté disponible y/o cambie el mes
  useEffect(() => {
    if (!usuario) return;
    cargarDatos(usuario.ID, mesActual + 1, anioActual);
  }, [usuario, mesActual, anioActual]);

  // La leyenda se carga solo una vez al montar el componente
  useEffect(() => {
    cargarLeyendaDesdeBBDD();
  }, []);

  // Buscar los turnos en la API
  const cargarLeyendaDesdeBBDD = async () => {
    try {
      const res = await fetch('/api/turnos');
      if (res.ok) {
        const data = await res.json();
        setLeyendaDinamica(data); // Guardamos la lista real de XAMPP
      }
    } catch (error) {
      console.error("Error al cargar la leyenda:", error);
    }
  };

  const cargarDatos = async (id: number, m: number, a: number) => {
    try {
      const res = await fetch('/api/planificacion-mes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: id, mes: m, anio: a })
      });
      if (res.ok) {
        const data = await res.json();
        setDatos(data);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  const cambiarMes = (desplazamiento: number) => {
    const nuevaFecha = new Date(anioActual, mesActual + desplazamiento, 1);
    setMesActual(nuevaFecha.getMonth());
    setAnioActual(nuevaFecha.getFullYear());
    setDetalleDiaActivo(null);
  };

  const calcularPosicion = (horaStr: string) => {
    if (!horaStr) return 0;
    const [h, m] = horaStr.split(':').map(Number);
    let totalMinutos = h * 60 + m;
    if (h < 6) totalMinutos += 24 * 60; 
    const minutosDesdeInicio = totalMinutos - (6 * 60);
    return (minutosDesdeInicio / (24 * 60)) * 100; 
  };

  // Calcula el ancho de la barra según la duración real
  const calcularAncho = (entrada: string, salida: string) => {
    if (!entrada || !salida) return 0;
    const [hE, mE] = entrada.split(':').map(Number);
    const [hS, mS] = salida.split(':').map(Number);

    const minE = hE * 60 + mE;
    let minS = hS * 60 + mS;

    // Si la hora de salida es un número menor o igual que la entrada (ej. de 22 a 06), 
    // es porque ha cruzado la medianoche. Le sumamos 24h a la salida.
    if (minS <= minE) {
      minS += 24 * 60;
    }

    const duracionMinutos = minS - minE;
    return (duracionMinutos / (24 * 60)) * 100;
  };

  const datosPorFecha = useMemo<Record<string, any[]>>(() => {
    return datos.reduce((acc, turno) => {
      const fecha = normalizarFechaISO(turno.FECHA);
      if (!acc[fecha]) acc[fecha] = [];
      acc[fecha].push(turno);
      return acc;
    }, {} as Record<string, any[]>);
  }, [datos]);

  const semanas = useMemo(() => agruparDiasMesPorSemanas(anioActual, mesActual), [anioActual, mesActual]);

  const calcularResumenSemanas = () => {
    const resumenSemanas: Record<string, number> = {};
    let totalMes = 0;
    Object.entries(datosPorFecha).forEach(([fecha, turnosDia]) => {
      const semanaId = formatearFechaLocal(obtenerInicioSemanaLunes(crearFechaLocalDesdeISO(fecha)));
      const horas = sumarHorasTurnos(turnosDia);

      if (!resumenSemanas[semanaId]) resumenSemanas[semanaId] = 0;
      resumenSemanas[semanaId] += horas;
      totalMes += horas;
    });
    return { resumenSemanas, totalMes };
  };

  const resumen = useMemo(() => calcularResumenSemanas(), [datosPorFecha]);

  const obtenerTurnosDia = (fecha: string) => datosPorFecha[fecha] || [];

  const obtenerTextoDetalleDia = (fecha: string) => {
    const turnosDia = obtenerTurnosDia(fecha);

    if (turnosDia.length === 0) {
      return 'Sin turno asignado';
    }

    const totalDia = sumarHorasTurnos(turnosDia);
    const detalleTurnos = turnosDia
      .map((turno: any) => `${turno.TURNO_CODIGO} · ${turno.HORA_ENTRADA.slice(0, 5)}-${turno.HORA_SALIDA.slice(0, 5)}`)
      .join(' | ');

    return `Total ${totalDia.toFixed(1)}h · ${detalleTurnos}`;
  };

  const descargarPdf = () => {
    if (!usuario) return;
    const diasMes = new Date(anioActual, mesActual + 1, 0).getDate();
    const nombreMes = nombresMeses[mesActual];
    const nombreArchivo = `Horario_${nombreMes}_${anioActual}_${usuario.NOMBRE}_${usuario.APELLIDOS}.pdf`;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Horario mensual · ${usuario.NOMBRE} ${usuario.APELLIDOS}`, 14, 20);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`${nombreMes} ${anioActual}`, 14, 28);
    doc.setTextColor(0);

    const filas = Array.from({ length: diasMes }, (_, indice: number) => {
      const fecha = formatearFechaLocal(new Date(anioActual, mesActual, indice + 1));
      const fechaLocal = crearFechaLocalDesdeISO(fecha);
      const turnosDia = obtenerTurnosDia(fecha);
      const totalDia = sumarHorasTurnos(turnosDia);
      const nombreDia = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][obtenerIndiceDiaLunes(fechaLocal)];
      const turnosTexto = turnosDia.length > 0
        ? turnosDia.map((turno: any) => `${turno.TURNO_CODIGO} ${turno.HORA_ENTRADA.slice(0, 5)}-${turno.HORA_SALIDA.slice(0, 5)}`).join(' · ')
        : 'Sin turno';
      return [nombreDia, fecha, turnosTexto, `${totalDia.toFixed(1)}h`];
    });

    autoTable(doc, {
      startY: 34,
      head: [['Día', 'Fecha', 'Turnos', 'Total']],
      body: filas,
      headStyles: { fillColor: [253, 224, 71], textColor: 30, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 253, 231] },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 30 }, 2: { cellWidth: 105 }, 3: { cellWidth: 20 } },
    });

    doc.save(nombreArchivo);
  };

  if (!usuario) return null;

  return (
    <div className={estilos.limitadorAncho}>
        
        <nav className={estilos.navbarPlanificacion}>
          <button className={estilos.botonNav} onClick={() => cambiarMes(-1)}>Anterior</button>
          
          <div className={estilos.titulosCentrados}>
            <h1 className={estilos.nombreEmpleado}>{usuario.NOMBRE} {usuario.APELLIDOS}</h1>
            <h2 className={estilos.tituloMesAnio}>{nombresMeses[mesActual]} | {anioActual}</h2>
            <button type="button" className={estilos.botonSecundario} onClick={descargarPdf}>
              Descargar PDF
            </button>
          </div>

          <button className={estilos.botonNav} onClick={() => cambiarMes(1)}>Siguiente</button>
        </nav>

        <div className={estilos.ganttScrollArea}>
          <div className={estilos.ganttInner}>
            {semanas.map((semana) => (
              <div key={semana.id} className={estilos.semanaBlock}>
                <div className={estilos.semanaTitulo}>
                  <div className={estilos.semanaNombre}>Semana {semana.indice}</div>
                  <div className={estilos.semanaHoras}>
                    {/* Generamos las 24 horas desde las 6 hasta las 5 am */}
                    {Array.from({ length: 24 }, (_, i) => (i + 6) % 24).map(h => (
                      <div key={h} className={estilos.bloqueHora}>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {semana.fechas.map((fecha: string) => {
                  const fechaLocal = crearFechaLocalDesdeISO(fecha);
                  const turnosDia = obtenerTurnosDia(fecha);
                  const totalDia = sumarHorasTurnos(turnosDia);
                  const detalleVisible = detalleDiaActivo === fecha;

                  return (
                  <div key={fecha} className={estilos.filaDia}>
                    <span className={estilos.diaLabel}>{inicialesDias[obtenerIndiceDiaLunes(fechaLocal)]} - {fechaLocal.getDate()}</span>
                    <div
                      className={estilos.carril}
                      role="button"
                      tabIndex={0}
                      title={obtenerTextoDetalleDia(fecha)}
                      aria-label={obtenerTextoDetalleDia(fecha)}
                      onClick={() => setDetalleDiaActivo((actual) => actual === fecha ? null : fecha)}
                      onKeyDown={(evento) => {
                        if (evento.key === 'Enter' || evento.key === ' ') {
                          evento.preventDefault();
                          setDetalleDiaActivo((actual) => actual === fecha ? null : fecha);
                        }
                      }}
                    >
                      <div className={estilos.malla}></div>
                      {turnosDia.map((t: any, idx: number) => (
                        <div key={idx} className={estilos.barra} style={{
                          left: `${calcularPosicion(t.HORA_ENTRADA)}%`,
                          width: `${calcularAncho(t.HORA_ENTRADA, t.HORA_SALIDA)}%`,
                          backgroundColor: t.COLOR_HEX
                        }}>{t.TURNO_CODIGO}</div>
                      ))}
                      <div className={`${estilos.tooltipDia} ${detalleVisible ? estilos.tooltipVisible : ''}`}>
                        <strong>Total del día: {totalDia.toFixed(1)}h</strong>
                        <span>
                          {turnosDia.length > 0
                            ? turnosDia.map((turno: any) => `${turno.TURNO_CODIGO} · ${turno.HORA_ENTRADA.slice(0, 5)}-${turno.HORA_SALIDA.slice(0, 5)} · ${calcularHorasEntre(turno.HORA_ENTRADA, turno.HORA_SALIDA).toFixed(1)}h`).join(' | ')
                            : 'Sin turno asignado'}
                        </span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className={estilos.zonaInferior}>
          
          <div className={estilos.resumen}>
            <h3>Resumen de Horas</h3>
            <table>
              <thead>
                <tr><th>Semana</th><th>Horas Totales</th></tr>
              </thead>
              <tbody>
                {semanas.map((semana) => (
                  <tr key={semana.id}>
                    <td>Semana {semana.indice}</td>
                    <td>{resumen.resumenSemanas[semana.id] ? resumen.resumenSemanas[semana.id].toFixed(1) : 0}h</td>
                  </tr>
                ))}
                <tr className={estilos.totalRow}>
                  <td>TOTAL MES</td>
                  <td>{resumen.totalMes.toFixed(1)}h</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={estilos.leyenda}>
            <h3>Leyenda de Turnos</h3>
            <div className={estilos.leyendaGrid}>
              {/* mapeamos directamente lo que viene de la base de datos */}
              {leyendaDinamica.map((item, index) => (
                <div key={index} className={estilos.leyendaItem}>
                  <span style={{ backgroundColor: item.COLOR_HEX }}></span> 
                  <b>{item.CODIGO}</b> - {item.DESCRIPCION}
                </div>
              ))}
            </div>
          </div>

        </div>
    </div>
  );
}
