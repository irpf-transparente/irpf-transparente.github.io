# IRPF Transparente

Sitio interactivo que democratiza el cálculo del IRPF, cotizaciones sociales y
salario neto en España entre 2012 y 2026, con especial foco en visualizar el
impacto de la **progresividad en frío** (tramos sin indexar frente a la
inflación).

- Introduce un salario bruto y un año, y ve el desglose completo de la nómina.
- Tres visualizaciones interactivas (visx / D3):
  - Reparto del bruto en neto, SS trabajador e IRPF.
  - Evolución del neto y del IRPF en un rango de 0 a 120k€ para el año elegido.
  - Comparativa del poder adquisitivo real entre 2012 y 2026 expresado en € de 2026.
- Los enlaces son compartibles: el año y el bruto se sincronizan con la URL
  (`?year=2024&bruto=45000`).

## Origen del cálculo

El motor matemático es un port directo a TypeScript del script Python de
[jongonzlz/Calculadora-de-Salarios-y-Progresividad-en-Fr-o](https://github.com/jongonzlz/Calculadora-de-Salarios-y-Progresividad-en-Fr-o).
Un fixture JSON generado desde ese mismo script se usa como oráculo de paridad
en los tests (`src/__tests__/payroll.parity.test.ts`), garantizando que la
implementación web coincide con la referencia euro a euro (±0,01 €).

## Stack

- Vite + React + TypeScript
- CSS Modules (sin Tailwind, sin CSS-in-JS)
- [visx](https://airbnb.io/visx/) para gráficas
- Vitest para tests
- Despliegue estático en GitHub Pages vía GitHub Actions

## Desarrollo

```bash
npm install
npm run dev        # servidor local en http://localhost:5173
npm test           # suite Vitest
npm run build      # genera dist/ estático
```

### Regenerar el fixture de paridad

Sólo hace falta si cambia la lógica del motor de referencia en Python:

```bash
python3 scripts/export_python_snapshot.py
```

## Despliegue

Cada push a `main` lanza `.github/workflows/deploy.yml`, que:

1. Instala dependencias, ejecuta los tests y construye `dist/`.
2. Sube el artefacto a GitHub Pages y lo despliega.

En los ajustes del repo → **Pages** → **Source**, seleccionar **GitHub Actions**.

## Licencia

MIT — ver [LICENSE](LICENSE).
