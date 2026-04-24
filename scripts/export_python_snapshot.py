#!/usr/bin/env python3
"""Exporta un snapshot JSON del motor Python original (versión sin pandas/numpy)
para permitir tests de paridad en TypeScript sin dependencias de Python en CI.

Uso: `python3 scripts/export_python_snapshot.py`
Escribe `fixtures/parity.json`.
"""

import json
import math
import os

# =============================================================================
# Motor Python — copia literal de la lógica del script de referencia
# (auditoría IRPF/SS 2012-2026), sin pandas/numpy.
# =============================================================================

IPC_ANUAL_DIC = {
    2013: 0.003, 2014: -0.010, 2015: 0.000, 2016: 0.016, 2017: 0.011,
    2018: 0.012, 2019: 0.008, 2020: -0.005, 2021: 0.065, 2022: 0.057,
    2023: 0.031, 2024: 0.028, 2025: 0.029, 2026: 0.030,
}


def obtener_parametros(anio):
    p = {}
    p['base_max'] = {
        2012: 39150.0, 2013: 41108.4, 2014: 43164.0, 2015: 43272.0, 2016: 43704.0,
        2017: 45014.4, 2018: 45014.4, 2019: 48841.2, 2020: 48841.2, 2021: 48841.2,
        2022: 49672.8, 2023: 53946.0, 2024: 56646.0, 2025: 58914.0, 2026: 61214.4,
    }[anio]
    p['ss_tipos'] = {
        'comunes': [0.236, 0.047], 'desempleo': [0.055, 0.0155],
        'fogasa': [0.002, 0.0], 'fp': [0.006, 0.001], 'atep': [0.015, 0.0],
    }
    if anio == 2023: p['mei'] = [0.005, 0.001]
    elif anio == 2024: p['mei'] = [0.0058, 0.0012]
    elif anio == 2025: p['mei'] = [0.0067, 0.0013]
    elif anio >= 2026: p['mei'] = [0.0075, 0.0015]
    else: p['mei'] = [0.0, 0.0]

    if anio == 2025:
        p['solidaridad'] = [(1.10, 0.0092), (1.50, 0.0100), (float('inf'), 0.0117)]
    elif anio >= 2026:
        p['solidaridad'] = [(1.10, 0.0115), (1.50, 0.0125), (float('inf'), 0.0146)]
    else:
        p['solidaridad'] = []

    p['irpf_minimo'] = 5151 if anio <= 2014 else 5550
    p['minimo_exento'] = {
        2012: 11162, 2013: 11162, 2014: 11162, 2015: 12000, 2016: 12000, 2017: 12000,
        2018: 12643, 2019: 14000, 2020: 14000, 2021: 14000, 2022: 14000, 2023: 15000,
        2024: 15876, 2025: 15876, 2026: 15876,
    }[anio]
    p['gastos_fijos'] = 0 if anio <= 2014 else 2000

    def reduccion_trabajo(rn_previo):
        if anio <= 2014:
            if rn_previo <= 9180: return 4080.0
            elif rn_previo <= 13260: return 4080.0 - 0.35 * (rn_previo - 9180.0)
            else: return 2652.0
        elif 2015 <= anio <= 2017:
            if rn_previo <= 11250: return 3700.0
            elif rn_previo <= 14450: return 3700.0 - 1.15625 * (rn_previo - 11250.0)
            else: return 0.0
        elif anio == 2018:
            pre = 3700.0 if rn_previo <= 11250 else (
                3700.0 - 1.15625 * (rn_previo - 11250.0) if rn_previo <= 14450 else 0.0)
            post = 5565.0 if rn_previo <= 13115 else (
                max(0.0, 5565.0 - 1.5 * (rn_previo - 13115.0)) if rn_previo <= 16825 else 0.0)
            return (pre / 2.0) + (post / 2.0)
        elif 2019 <= anio <= 2022:
            if rn_previo <= 13115: return 5565.0
            elif rn_previo <= 16825: return max(0.0, 5565.0 - 1.5 * (rn_previo - 13115.0))
            else: return 0.0
        elif anio == 2023:
            if rn_previo <= 14047.50: return 6498.0
            elif rn_previo <= 19747.50: return max(0.0, 6498.0 - 1.14 * (rn_previo - 14047.50))
            else: return 0.0
        elif anio >= 2024:
            if rn_previo <= 14852: return 7302.0
            elif rn_previo <= 17673.52: return 7302.0 - 1.75 * (rn_previo - 14852.0)
            elif rn_previo <= 19747.50: return 2364.34 - 1.14 * (rn_previo - 17673.52)
            else: return 0.0
        return 0.0
    p['reduccion_trabajo'] = reduccion_trabajo

    if anio <= 2014:
        p['tramos_irpf'] = [
            (17707, 0.2475), (33007, 0.30), (53407, 0.40), (120000, 0.47),
            (175000, 0.49), (300000, 0.51), (float('inf'), 0.52),
        ]
    elif anio == 2015:
        p['tramos_irpf'] = [
            (12450, 0.195), (20200, 0.245), (34000, 0.305), (60000, 0.38),
            (float('inf'), 0.46),
        ]
    elif 2016 <= anio <= 2020:
        p['tramos_irpf'] = [
            (12450, 0.19), (20200, 0.24), (35200, 0.30), (60000, 0.37),
            (float('inf'), 0.45),
        ]
    else:
        p['tramos_irpf'] = [
            (12450, 0.19), (20200, 0.24), (35200, 0.30), (60000, 0.37),
            (300000, 0.45), (float('inf'), 0.47),
        ]

    def deduccion_smi(bruto):
        if anio == 2026:
            if bruto <= 17094: return 590.89
            else: return max(0.0, 590.89 - 0.20 * (bruto - 17094.0))
        elif anio == 2025:
            if bruto <= 16576: return 340.0
            elif bruto <= 18276: return max(0, 340.0 - 0.20 * (bruto - 16576.0))
        return 0.0
    p['deduccion_smi'] = deduccion_smi

    return p


def calcular_nomina(bruto, anio):
    p = obtener_parametros(anio)
    base_cot = min(bruto, p['base_max'])
    exc_base = max(0, bruto - p['base_max'])

    t_emp = sum(x[0] for x in p['ss_tipos'].values()) + p['mei'][0]
    t_tra = sum(x[1] for x in p['ss_tipos'].values()) + p['mei'][1]

    cot_emp = base_cot * t_emp
    cot_tra = base_cot * t_tra

    if p['solidaridad'] and exc_base > 0:
        l1 = p['base_max'] * 0.1
        l2 = p['base_max'] * 0.5
        e1 = min(exc_base, l1)
        e2 = min(max(0, exc_base - l1), l2 - l1)
        e3 = max(0, exc_base - l2)
        q_sol = (e1 * p['solidaridad'][0][1]
                 + e2 * p['solidaridad'][1][1]
                 + e3 * p['solidaridad'][2][1])
        cot_emp += q_sol * (5 / 6)
        cot_tra += q_sol * (1 / 6)

    coste_lab = bruto + cot_emp
    rn_previo = bruto - cot_tra
    red20 = p['reduccion_trabajo'](rn_previo)
    # Esquema en dos pasos como en procesar_ano — equivalente a max(0, A-B-C)
    # para valores positivos pero preserva el orden original.
    rendimiento_neto = max(0, rn_previo - p['gastos_fijos'])
    base_imp = max(0, rendimiento_neto - red20)

    q_integra = 0.0
    lim_ant = 0.0
    for lim, tipo in p['tramos_irpf']:
        if base_imp > lim:
            q_integra += (lim - lim_ant) * tipo
            lim_ant = lim
        else:
            q_integra += (base_imp - lim_ant) * tipo
            break

    q_min = p['irpf_minimo'] * p['tramos_irpf'][0][1]
    q_teorica = max(0, q_integra - q_min)
    q_smi = max(0, q_teorica - p['deduccion_smi'](bruto))

    lim_ret = max(0, (bruto - p['minimo_exento']) * 0.43)
    irpf_final = min(q_smi, lim_ret)
    neto = bruto - cot_tra - irpf_final

    return {
        'bruto': bruto,
        'cotEmpresa': cot_emp,
        'costeLaboral': coste_lab,
        'cotTrabajador': cot_tra,
        'rendimientoPrevio': rn_previo,
        'gastosFijos': p['gastos_fijos'],
        'reduccionArt20': red20,
        'baseImponible': base_imp,
        'cuotaIntegra': q_integra,
        'cuotaMinimoPersonal': q_min,
        'cuotaTeorica': q_teorica,
        'deduccionSmi': p['deduccion_smi'](bruto),
        'cuotaTrasSmi': q_smi,
        'limite43pct': lim_ret,
        'irpfFinal': irpf_final,
        'salarioNeto': neto,
    }


# =============================================================================
# Grid del snapshot: cubre tramos y boundaries piecewise del Art. 20
# =============================================================================
YEARS = [2012, 2015, 2018, 2020, 2023, 2024, 2025, 2026]
BRUTOS = [
    0, 10000, 15000, 17000, 18000, 20000, 25000,
    30000, 35000, 45000, 60000, 80000, 100000,
]

# Añadimos boundaries significativos (salarios cerca de la base máx., del
# umbral Art. 20, del límite 43%, etc.) para atrapar offs-by-one.
BOUNDARIES_EXTRA = [
    11162, 12450, 13115, 14047, 14852, 15876, 16576, 17094,
    17673, 18276, 19747, 20200, 35200, 60000,
]

def main():
    rows = []
    for year in YEARS:
        for bruto in sorted(set(BRUTOS + BOUNDARIES_EXTRA)):
            result = calcular_nomina(bruto, year)
            rows.append({'year': year, **result})

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_path = os.path.join(root, 'fixtures', 'parity.json')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump({
            'generator': 'scripts/export_python_snapshot.py',
            'rows': rows,
        }, f, indent=2, ensure_ascii=False)
    print(f'Wrote {len(rows)} rows to {out_path}')


if __name__ == '__main__':
    main()
