// app/lib/hooks/useUsuario.ts

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


export interface UsuarioLogueado {
  ID: number;
  EMAIL: string;
  NOMBRE: string;
  APELLIDOS: string;
  PUESTO_ID: number;
  RESPONSABLE_ID: number | null;
}

export function useUsuario(): UsuarioLogueado | null {
  const [usuario, setUsuario] = useState<UsuarioLogueado | null>(null);
  const enrutador = useRouter();

  useEffect(() => {
    const guardado = localStorage.getItem('usuarioLogueado');

    // Si no hay sesión activa, redirigir al login inmediatamente
    if (!guardado) {
      enrutador.push('/login');
      return;
    }

    setUsuario(JSON.parse(guardado));
  }, [enrutador]);

  return usuario;
}
