// app/api/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { pool } from '@/app/lib/db';

export async function POST(peticion: Request) {
  try {
    const body = await peticion.json();
    const { email, password } = body;

    // Comprobamos si el correo existe en la base de datos
    const [empleadosEncontrados]: any = await pool.query(
      'SELECT * FROM EMPLEADOS WHERE EMAIL = ?',
      [email]
    );

    if (empleadosEncontrados.length === 0) {
      return NextResponse.json(
        { mensaje: "El usuario no existe" },
        { status: 404 }
      );
    }

    // Si el correo existe, sacamos al empleado de la lista
    const empleado = empleadosEncontrados[0];

    // Comprobamos la contraseña con bcrypt
    const passwordCorrecta = await bcrypt.compare(password, empleado.PASSWORD);
    if (!passwordCorrecta) {
      return NextResponse.json(
        { mensaje: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // Le quitamos la contraseña a los datos antes de enviarlos por seguridad
    const { PASSWORD, ...datosEmpleado } = empleado;
    
    return NextResponse.json(
      { mensaje: "¡Login correcto!", usuario: datosEmpleado },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error en el login:", error);
    return NextResponse.json(
      { mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}