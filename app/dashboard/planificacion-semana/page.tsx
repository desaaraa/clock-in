"use client";
import React, { useEffect, useState } from 'react';
import estilos from './semana.module.css';
import { formatearFechaLocal, normalizarFechaISO, obtenerFinSemanaDomingo, obtenerIndiceDiaLunes, obtenerInicioSemanaLunes } from '@/app/lib/fechas';
import { useUsuario } from '@/app/lib/hooks/useUsuario';

export default function PlanificacionSemanaPage() {
  const usuario = useUsuario();
  const [datos, setDatos] = useState<any[]>([]);
  const [lunesActual, setLunesActual] = useState(() => obtenerInicioSemanaLunes(new Date()));

  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const nombresDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  // Se ejecuta cuando el usuario se carga o cuando cambia la semana
  useEffect(() => {
    if (!usuario || !lunesActual) return;
    cargarDatos(usuario.PUESTO_ID, lunesActual);
  }, [usuario, lunesActual]);

  const cargarDatos = async (puesto_id: number, fechaLunes: Date) => {
    // Calculamos el Domingo sumando 6 días al Lunes
    const fechaDomingo = new Date(fechaLunes);
    fechaDomingo.setDate(fechaLunes.getDate() + 6);

    const strInicio = formatearFechaLocal(fechaLunes);
    const strFin = formatearFechaLocal(fechaDomingo);

    try {
      const res = await fetch('/api/planificacion-semana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puesto_id: puesto_id, fechaInicio: strInicio, fechaFin: strFin })
      });
      if (res.ok) setDatos(await res.json());
    } catch (error) {
      console.error("Error:", error);
    }
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

  // Generamos un array con los 7 días de la semana actual
  const diasSemana = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(lunesActual);
    d.setDate(lunesActual.getDate() + i);
    return d;
  });

  const domingoActual = obtenerFinSemanaDomingo(lunesActual);
  const tituloSemana = lunesActual.getMonth() === domingoActual.getMonth() && lunesActual.getFullYear() === domingoActual.getFullYear()
    ? `Semana del ${lunesActual.getDate()} al ${domingoActual.getDate()} de ${nombresMeses[lunesActual.getMonth()]} de ${lunesActual.getFullYear()}`
    : `Semana del ${lunesActual.getDate()} de ${nombresMeses[lunesActual.getMonth()]} al ${domingoActual.getDate()} de ${nombresMeses[domingoActual.getMonth()]} de ${domingoActual.getFullYear()}`;

  if (!usuario) return null;

  return (
    <div className={estilos.limitadorAncho}>
        
        {/* CABECERA DE SEMANA */}
        <nav className={estilos.navbarPlanificacion}>
          <button className={estilos.botonNav} onClick={() => {
            const nuevoLunes = new Date(lunesActual);
            nuevoLunes.setDate(nuevoLunes.getDate() - 7);
            setLunesActual(nuevoLunes);
          }}>Semana Anterior</button>
          
          <div className={estilos.titulosCentrados}>
            <h1 className={estilos.nombreEmpleado}>Equipo de {usuario.NOMBRE}</h1>
            <h2 className={estilos.tituloMesAnio}>{tituloSemana}</h2>
          </div>

          <button className={estilos.botonNav} onClick={() => {
            const nuevoLunes = new Date(lunesActual);
            nuevoLunes.setDate(nuevoLunes.getDate() + 7);
            setLunesActual(nuevoLunes);
          }}>Semana Siguiente</button>
        </nav>

        {/* GANTT DEL EQUIPO */}
        <div className={estilos.ganttScrollArea}>
          <div className={estilos.ganttInner}>
            
            {/* Iteramos por cada DÍA de la semana */}
            {diasSemana.map((dia) => {
              const strFecha = formatearFechaLocal(dia);
              const turnosDia = datos.filter(d => normalizarFechaISO(d.FECHA) === strFecha);
              
              // Si no hay turnos este día, no dibujamos la caja
              if (turnosDia.length === 0) return null;

              // Extraemos una lista de compañeros únicos que trabajan ese día
              const compañerosUnicos = Array.from(new Set(turnosDia.map(t => `${t.NOMBRE} ${t.APELLIDOS}`)));

              return (
                <div key={strFecha} className={estilos.semanaBlock}>
                  
                  {/* Cabecera Amarilla del día con las horas */}
                  <div className={estilos.semanaTitulo}>
                    <div className={estilos.semanaNombre}>
                      {nombresDias[obtenerIndiceDiaLunes(dia)]} {dia.getDate()}
                    </div>
                    <div className={estilos.semanaHoras}>
                      {Array.from({ length: 24 }, (_, i) => (i + 6) % 24).map(h => (
                        <div key={h} className={estilos.bloqueHora}><span>{h}</span></div>
                      ))}
                    </div>
                  </div>

                  {/* Una fila por cada compañero que trabaje ese día */}
                  {compañerosUnicos.map((nombreCompi) => (
                    <div key={nombreCompi} className={estilos.filaDia}>
                      <span className={estilos.diaLabel}>{nombreCompi.split(' ')[0]} {/* Solo el primer nombre */}</span>
                      <div className={estilos.carril}>
                        <div className={estilos.malla}></div>
                        
                        {/* Dibujamos los turnos de este compañero en este día */}
                        {turnosDia.filter(t => `${t.NOMBRE} ${t.APELLIDOS}` === nombreCompi).map((t, idx) => (
                          <div key={idx} className={estilos.barra} style={{
                            left: `${calcularPosicion(t.HORA_ENTRADA)}%`,
                            width: `${calcularAncho(t.HORA_ENTRADA, t.HORA_SALIDA)}%`,
                            backgroundColor: t.COLOR_HEX
                          }}>{t.TURNO_CODIGO}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            {datos.length === 0 && (
              <div className={estilos.semanaBlock}>
                <div className={estilos.semanaTitulo}>
                  <div className={estilos.semanaNombre}>Semana actual</div>
                  <div className={estilos.semanaHoras}></div>
                </div>
                <div className={estilos.filaDia}>
                  <span className={estilos.diaLabel}>Info</span>
                  <div className={estilos.carril} style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem', color: '#4b5563' }}>
                    No hay planificación registrada entre lunes y domingo para esta semana.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

    </div>
  );
}
