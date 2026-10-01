import "./App.css";

export default function App() {
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <p className="admin-eyebrow">UniMovil</p>
        <h1>Administración</h1>
      </header>
      <section aria-labelledby="setup-title" className="setup-card">
        <h2 id="setup-title">Panel preparado</h2>
        <p>
          La base de la aplicación administrativa está lista para incorporar la
          gestión del campus.
        </p>
      </section>
    </main>
  );
}
