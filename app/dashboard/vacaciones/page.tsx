"use client";
import React, { useEffect, useState } from 'react';
import estilos from '../dashboard.module.css';
import { puedeGestionarHorarios } from '@/app/lib/permisos'; // necesario para la sección de validaciones
import { useUsuario } from '@/app/lib/hooks/useUsuario';

export default function VacacionesPage() {
  const usuario = useUsuario();
  const mostrarGestionHorarios = usuario ? puedeGestionarHorarios(usuario.PUESTO_ID) : false;

  const [misVacaciones, setMisVacaciones] = useState<any[]>([]);
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [resumen, setResumen] = useState({ diasAprobados: 0, diasPendientes: 0, diasReservados: 0, diasDisponibles: 22, limiteAnual: 22 });
  const anioActual = new Date().getFullYear();

  useEffect(() => {
    if (!usuario) return;
    cargarVacaciones(usuario);
  }, [usuario]);

  const cargarVacaciones = async (user = usuario) => {
    if (!user) return;

    const res = await fetch('/api/vacaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion: 'listar',
        empleado_id: user.ID,
        puesto_id: user.PUESTO_ID,
        anio: anioActual
      })
    });

    if (res.ok) {
      const data = await res.json();
      setMisVacaciones(data.misVacaciones || []);
      setPendientes(data.pendientes || []);
      setResumen(data.resumen || { diasAprobados: 0, diasPendientes: 0, diasReservados: 0, diasDisponibles: 22, limiteAnual: 22 });
    }
  };

  const solicitarVacaciones = async (evento: React.FormEvent) => {
    evento.preventDefault();
    const res = await fetch('/api/vacaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion: 'solicitar',
        empleado_id: usuario.ID,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      })
    });

    const data = await res.json();
    alert(data.mensaje);
    if (res.ok) {
      setFechaInicio('');
      setFechaFin('');
      cargarVacaciones();
    }
  };

  const validarVacaciones = async (vacacionesId: number, estado: string) => {
    const res = await fetch('/api/vacaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion: 'validar',
        empleado_id: usuario.ID,
        puesto_id: usuario.PUESTO_ID,
        vacaciones_id: vacacionesId,
        estado
      })
    });

    const data = await res.json();
    alert(data.mensaje);
    if (res.ok) cargarVacaciones();
  };

  if (!usuario) return null;

  return (
    <main className={estilos.contenidoCompacto}>
        <section className={estilos.panelDetalle}>
          <h1>Mi pacto de vacaciones {anioActual}</h1>
          <div className={estilos.datosGrid} style={{ marginBottom: '1.5rem' }}>
            <div>
              <span>Límite anual</span>
              <strong>{resumen.limiteAnual} días laborables</strong>
            </div>
            <div>
              <span>Días disponibles</span>
              <strong>{resumen.diasDisponibles} días</strong>
            </div>
            <div>
              <span>Días aprobados</span>
              <strong>{resumen.diasAprobados} días</strong>
            </div>
            <div>
              <span>Días pendientes</span>
              <strong>{resumen.diasPendientes} días</strong>
            </div>
          </div>
          <p className={estilos.textoVacio} style={{ marginBottom: '1rem' }}>
            Puedes repartir tus 22 días laborables a lo largo del año sin restricciones de reparto, siempre que no superes el total anual.
          </p>
          <form className={estilos.formVacaciones} onSubmit={solicitarVacaciones}>
            <label>
              Inicio
              <input type="date" min={`${anioActual}-01-01`} max={`${anioActual}-12-31`} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
            </label>
            <label>
              Fin
              <input type="date" min={`${anioActual}-01-01`} max={`${anioActual}-12-31`} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
            </label>
            <button type="submit" className={estilos.botonAccion}>Solicitar</button>
          </form>

          <div className={estilos.listaVacaciones}>
            {misVacaciones.map((item) => (
              <div key={item.ID} className={estilos.filaInfo}>
                <span>{item.FECHA_INICIO} - {item.FECHA_FIN} · {item.DIAS_LABORABLES} día(s)</span>
                <strong>{item.ESTADO}</strong>
              </div>
            ))}
            {misVacaciones.length === 0 && <p className={estilos.textoVacio}>No tienes vacaciones solicitadas este año.</p>}
          </div>
        </section>

        {mostrarGestionHorarios && (
          <section className={estilos.panelDetalle}>
            <h2>Solicitudes pendientes</h2>
            <div className={estilos.listaVacaciones}>
              {pendientes.map((item) => (
                <div key={item.ID} className={estilos.filaValidacion}>
                  <div>
                    <strong>{item.EMPLEADO_NOMBRE}</strong>
                    <span>{item.FECHA_INICIO} - {item.FECHA_FIN} · {item.DIAS_LABORABLES} día(s)</span>
                  </div>
                  <div className={estilos.accionesFila}>
                    <button onClick={() => validarVacaciones(item.ID, 'APROBADA')}>Validar</button>
                    <button onClick={() => validarVacaciones(item.ID, 'RECHAZADA')}>Rechazar</button>
                  </div>
                </div>
              ))}
              {pendientes.length === 0 && <p className={estilos.textoVacio}>No hay solicitudes pendientes.</p>}
            </div>
          </section>
        )}
      </main>
  );
}
