import { Calculator } from './components/Calculator/Calculator';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div>
          <h1>IRPF Transparente</h1>
          <p>
            Calculadora interactiva del IRPF, cotizaciones sociales y salario neto
            en España · 2012 – 2026
          </p>
        </div>
      </header>
      <main className={styles.main}>
        <Calculator />
      </main>
      <footer className={styles.footer}>
        <p>
          Datos y algoritmo basados en el script Python original de{' '}
          <a
            href="https://github.com/jongonzlz/Calculadora-de-Salarios-y-Progresividad-en-Fr-o"
            target="_blank"
            rel="noopener noreferrer"
          >
            jongonzlz/Calculadora-de-Salarios-y-Progresividad-en-Fr-o
          </a>
          . Código abierto en{' '}
          <a
            href="https://github.com/manuartero/irpf-transparente.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
