import { redirect } from 'next/navigation';

export default function PaginaPrincipal() {
  // Si alguien entra a la web principal, lo mandamos de golpe a la ruta /login
  redirect('/login');
}


