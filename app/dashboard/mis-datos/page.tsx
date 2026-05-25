"use client";
import React, { useEffect, useState } from 'react';
import estilos from '../dashboard.module.css';
import { useUsuario } from '@/app/lib/hooks/useUsuario';

export default function MisDatosPage() {
  const usuario = useUsuario();
  const [datosEmpleado, setDatosEmpleado] = useState<any>(null);

  // Cargamos los datos del empleado cuando el hook devuelva el usuario
  useEffect(() => {
    if (!usuario) return;
    cargarDatosEmpleado(usuario.ID);
  }, [usuario]);

  const cargarDatosEmpleado = async (empleadoId: number) => {
    const res = await fetch('/api/empleado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empleado_id: empleadoId })
    });

    if (res.ok) setDatosEmpleado(await res.json());
  };

  if (!usuario) return null;

  return (
    <main className={estilos.contenido}>
      <section className={estilos.panelDetalle}>
      <h1>Mis datos</h1>
      {datosEmpleado && (
        <div className={estilos.datosGrid}>
          <div><span>DNI</span><strong>{datosEmpleado.DNI}</strong></div>
          <div><span>Nombre</span><strong>{datosEmpleado.NOMBRE} {datosEmpleado.APELLIDOS}</strong></div>
          <div><span>Email</span><strong>{datosEmpleado.EMAIL}</strong></div>
          <div><span>Puesto</span><strong>{datosEmpleado.PUESTO_NOMBRE || 'Sin puesto'}</strong></div>
          <div><span>Responsable</span><strong>{datosEmpleado.RESPONSABLE_NOMBRE || 'Sin responsable'}</strong></div>
        </div>
      )}
    </section>
    </main>
  );
}
