// app/dashboard/fichajes/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import estilos from '../dashboard.module.css';
import estilosFichajes from './fichajes.module.css';
import { puedeGestionarHorarios } from '@/app/lib/permisos';
import { useUsuario } from '@/app/lib/hooks/useUsuario';

export default function FichajesPage() {
  const usuario = useUsuario();
  const mostrarGestionHorarios = usuario ? puedeGestionarHorarios(usuario.PUESTO_ID) : false;

  const hoy = new Date().toISOString().split('T')[0];
  const inicioMes = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;

  const [desde, setDesde] = useState(inicioMes);
  const [hasta, setHasta] = useState(hoy);
  const [propios, setPropios] = useState<any[]>([]);
  const [equipo, setEquipo] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    cargarFichajes(usuario, inicioMes, hoy);
  }, [usuario]);

  const cargarFichajes = async (user: any, fechaDesde: string, fechaHasta: string) => {
    setCargando(true);
    try {
      const res = await fetch('/api/mis-fichajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleado_id: user.ID,
          responsable_id: puedeGestionarHorarios(user.PUESTO_ID) ? user.ID : null,
          fecha_inicio: fechaDesde,
          fecha_fin: fechaHasta,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPropios(data.propios || []);
        setEquipo(data.equipo || []);
      }
    } finally {
      setCargando(false);
    }
  };

  const formatearFechaHora = (valor: string | null) => {
    if (!valor) return <span className={estilosFichajes.badgeAbierto}>Abierto</span>;
    return valor.replace('T', ' ').substring(0, 16);
  };

  const formatearDuracion = (dur: string | null) => {
    if (!dur) return '—';
    const partes = dur.split(':');
    if (partes.length < 2) return dur;
    return `${partes[0]}h ${partes[1]}m`;
  };

  if (!usuario) return null;

  const FilasFichaje = ({ fichajes }: { fichajes: any[] }) => {
    if (fichajes.length === 0) return <p className={estilosFichajes.vacio}>No hay fichajes en ese periodo.</p>;
    return (
      <div className={estilosFichajes.listaFichajes}>
        {fichajes.map((f) => (
          <div key={f.ID} className={`${estilosFichajes.cardFichaje} ${!f.FECHA_HORA_SALIDA ? estilosFichajes.abierto : ''}`}>
            <span className={estilosFichajes.nombreEmpleado}>{f.EMPLEADO_NOMBRE}</span>
            <div className={estilosFichajes.datoCelda}>
              <span className={estilosFichajes.etiqueta}>Entrada</span>
              <span className={estilosFichajes.valor}>{f.FECHA_HORA_ENTRADA ? f.FECHA_HORA_ENTRADA.replace('T', ' ').substring(0, 16) : '—'}</span>
            </div>
            <div className={estilosFichajes.datoCelda}>
              <span className={estilosFichajes.etiqueta}>Salida</span>
              <span className={estilosFichajes.valor}>{f.FECHA_HORA_SALIDA ? f.FECHA_HORA_SALIDA.replace('T', ' ').substring(0, 16) : '—'}</span>
            </div>
            <div className={estilosFichajes.datoCelda}>
              <span className={estilosFichajes.etiqueta}>Duración</span>
              <span className={estilosFichajes.valor}>{formatearDuracion(f.DURACION)}</span>
            </div>
            {f.FECHA_HORA_SALIDA
              ? <span className={estilosFichajes.badgeCerrado}>Cerrado</span>
              : <span className={estilosFichajes.badgeAbierto}>En curso</span>
            }
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className={estilos.contenido} style={{ maxWidth: 1100, width: '100%', alignSelf: 'center' }}>
        <h1 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 800, color: '#1f2937' }}>Fichajes</h1>

        <div className={estilosFichajes.panelFiltros}>
          <label>Desde: <input type="date" value={desde} onChange={e => setDesde(e.target.value)} /></label>
          <label>Hasta: <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} /></label>
          <button className={estilosFichajes.botonBuscar} onClick={() => cargarFichajes(usuario, desde, hasta)}>
            Buscar
          </button>
        </div>

        {cargando ? (
          <p className={estilosFichajes.cargando}>Cargando fichajes...</p>
        ) : (
          <>
            <div className={estilosFichajes.seccion}>
              <div className={estilosFichajes.seccionCabecera}>
                <h2>Mis fichajes</h2>
                {propios.length > 0 && <span className={estilosFichajes.contadorFichajes}>{propios.length}</span>}
              </div>
              <FilasFichaje fichajes={propios} />
            </div>

            {mostrarGestionHorarios && (
              <div className={estilosFichajes.seccion}>
                <div className={estilosFichajes.seccionCabecera}>
                  <h2>Fichajes de mi equipo</h2>
                  {equipo.length > 0 && <span className={estilosFichajes.contadorFichajes}>{equipo.length}</span>}
                </div>
                <FilasFichaje fichajes={equipo} />
              </div>
            )}
          </>
        )}
    </main>
  );
}