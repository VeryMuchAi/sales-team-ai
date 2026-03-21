import { redirect } from 'next/navigation';

/** El registro público está deshabilitado. */
export default function SignupPage() {
  redirect('/login');
}
