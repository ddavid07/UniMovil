import { useState, type FormEvent } from 'react';
import { adminApiClient, type SessionUser } from '../api/admin-client';

interface SignInViewProps {
  onSignedIn: (user: SessionUser) => void;
}

export function SignInView({ onSignedIn }: SignInViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = await adminApiClient.signIn(email.trim(), password);
      onSignedIn(response.user);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card" style={{ maxWidth: 460, margin: '2rem auto' }}>
      <h2>Acceso al panel de gestión</h2>
      <p className="muted-text">
        Inicia sesión con una cuenta de gestor o administrador autorizada por el
        servidor. La sesión se valida mediante cookie segura BFF sin almacenar tokens en
        el navegador.
      </p>

      {error ? (
        <div role="alert" className="alert-error">
          {error}
        </div>
      ) : null}

      <form className="section-stack" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="admin-email">Correo de acceso</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="admin-password">Contraseña</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button className="button button-primary" type="submit" disabled={busy}>
          {busy ? 'Comprobando credenciales...' : 'Iniciar sesión'}
        </button>
      </form>
    </section>
  );
}
