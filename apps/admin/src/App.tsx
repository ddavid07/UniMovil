import "./App.css";

export default function App() {
  return (
    <main
      aria-label="Presentación de UniMovil sobre el campus de Moncloa"
      className="presentation-screen"
    >
      <img
        alt="Universidad Complutense de Madrid"
        className="university-logo"
        src="/images/ucm-logo-secondary.jpg"
      />

      <section aria-labelledby="presentation-title" className="title-group">
        <h1 id="presentation-title">UNIMOVIL</h1>
        <p>próximamente…</p>
      </section>

      <a
        className="image-credit"
        href="https://venalacomplu.ucm.es/mapa-campus"
        rel="noreferrer"
        target="_blank"
      >
        Plano oficial del campus · UCM
      </a>
    </main>
  );
}
