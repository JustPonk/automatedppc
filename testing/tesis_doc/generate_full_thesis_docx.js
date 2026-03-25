const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, Table, TableRow, TableCell, WidthType, BorderStyle, Header, Footer } = require('docx');

// --- HELPERS ---
const styles = {
    font: "Arial",
    size: 24, // 12pt
    heading1Size: 32, // 16pt
    heading2Size: 28, // 14pt
    heading3Size: 24, // 12pt
};

function createPara(text, options = {}) {
    const runs = [];
    if (text) {
        // Simple bold parser: **text**
        const parts = text.split(/(\*\*.*?\*\*)/);
        parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                runs.push(new TextRun({ 
                    text: part.replace(/\*\*/g, ''), 
                    bold: true, 
                    font: styles.font, 
                    size: options.size || styles.size 
                }));
            } else {
                runs.push(new TextRun({ 
                    text: part, 
                    font: styles.font, 
                    size: options.size || styles.size 
                }));
            }
        });
    }
    
    return new Paragraph({
        children: runs,
        alignment: options.alignment || AlignmentType.JUSTIFIED,
        spacing: { line: 360, after: 200, before: options.before || 0 }, // 1.5 spacing
        bullet: options.bullet,
        heading: options.heading,
    });
}

function createHeading(text, level) {
    let size = styles.heading1Size;
    if (level === HeadingLevel.HEADING_2) size = styles.heading2Size;
    if (level === HeadingLevel.HEADING_3) size = styles.heading3Size;

    return new Paragraph({
        children: [new TextRun({ text, bold: true, font: styles.font, size })],
        heading: level,
        alignment: level === HeadingLevel.HEADING_1 ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: 400, after: 200 },
    });
}

function createListItem(text, numbered = false) {
    return createPara(text, { 
        bullet: { level: 0 } 
    });
}

// Table helper
function createTable(data) {
    const rows = data.map((row, i) => {
        return new TableRow({
            children: row.map(cellText => new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: cellText, font: styles.font, size: 22, bold: i === 0 })] })], // Bold header
                width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
                margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }))
        });
    });
    return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });
}

// --- DOCUMENT CONTENT ---
const doc = new Document({
    styles: {
        paragraphStyles: [{ id: "Normal", name: "Normal", run: { font: "Arial", size: 24 }, paragraph: { spacing: { line: 360 } } }],
    },
    sections: [{
        properties: {},
        children: [
             // === PORTADA ===
             createPara("“Año de la consolidación del Mar de Grau”", { alignment: AlignmentType.CENTER, size: 22 }),
             createPara("", { before: 200 }),
             createPara("SERVICIO NACIONAL DE ADIESTRAMIENTO EN TRABAJO INDUSTRIAL", { bold: true, size: 32, alignment: AlignmentType.CENTER }),
             createPara("DIRECCIÓN ZONAL LIMA CALLAO", { bold: true, size: 28, alignment: AlignmentType.CENTER }),
             createPara("", { before: 800 }),
             createPara("PROYECTO DE INNOVACIÓN Y/O MEJORA NIVEL PROFESIONAL TÉCNICO", { bold: true, size: 28, alignment: AlignmentType.CENTER }),
             createPara("", { before: 400 }),
             createPara("Escuela de Tecnologías de la Información", { size: 28, alignment: AlignmentType.CENTER }),
             createPara("CARRERA DE DESARROLLO DE SOFTWARE", { bold: true, size: 28, alignment: AlignmentType.CENTER }),
             createPara("", { before: 800 }),
             createPara("Título del Proyecto:", { size: 24, alignment: AlignmentType.CENTER }),
             createPara("“IMPLEMENTACIÓN DE UNA PLATAFORMA WEB INTEGRAL DE CONTROL PRESUPUESTAL Y GESTIÓN DE INDICADORES (KPIs DATA) PARA LAS OPERACIONES DE PLUSPETROL EN SEDES PISCO, LIMA Y MALVINAS”", { bold: true, size: 32, alignment: AlignmentType.CENTER }),
             createPara("", { before: 800 }),
             createPara("Autor: Jeferson Frances Peña Espinoza", { alignment: AlignmentType.RIGHT, bold: true }),
             createPara("Asesor: [Nombre del Asesor]", { alignment: AlignmentType.RIGHT, bold: true }),
             createPara("", { before: 1200 }),
             createPara("LIMA, PERÚ", { bold: true, alignment: AlignmentType.CENTER }),
             createPara("2026", { bold: true, alignment: AlignmentType.CENTER }),
             new Paragraph({ children: [new PageBreak()] }),

             // === DEDICATORIA ===
             createHeading("DEDICATORIA", HeadingLevel.HEADING_1),
             createPara("A mis padres, por su inquebrantable apoyo y sacrificio..."),
             createPara("A mis instructores..."),
             createPara("A Pluspetrol, por permitirme desarrollar mis prácticas en un entorno de alto nivel..."),
             new Paragraph({ children: [new PageBreak()] }),

             // === AGRADECIMIENTOS ===
             createHeading("AGRADECIMIENTOS", HeadingLevel.HEADING_1),
             createPara("Agradezco a la Gerencia de Operaciones de Pluspetrol por brindarme las herramientas y la confianza para proponer soluciones innovadoras. A mi jefe directo por su mentoría en la gestión de proyectos reales. A mis compañeros de SENATI por el intercambio de conocimientos constante."),
             new Paragraph({ children: [new PageBreak()] }),

             // === INDICES ===
             createHeading("ÍNDICE GENERAL", HeadingLevel.HEADING_1),
             createPara("(Se recomienda actualizar el índice automático en Word)"),
             createPara("1. CAPÍTULO I: GENERALIDADES DE LA EMPRESA"),
             createPara("2. CAPÍTULO II: PLAN DEL PROYECTO DE INNOVACIÓN"),
             createPara("3. CAPÍTULO III: ANÁLISIS DE LA SITUACIÓN ACTUAL"),
             createPara("4. CAPÍTULO IV: PROPUESTA TÉCNICA DE LA MEJORA"),
             createPara("5. CAPÍTULO V: COSTOS DE IMPLEMENTACIÓN DE LA MEJORA"),
             createPara("6. CAPÍTULO VI: EVALUACIÓN TÉCNICA Y ECONÓMICA"),
             new Paragraph({ children: [new PageBreak()] }),

             // === CAPITULO I ===
             createHeading("CAPÍTULO I: GENERALIDADES DE LA EMPRESA", HeadingLevel.HEADING_1),
             
             createHeading("1.1 Razón Social", HeadingLevel.HEADING_2),
             createPara("**PLUSPETROL PERÚ CORPORATION S.A.**"),
             createPara("RUC: 20459524677"),
             createPara("Dirección Legal: Av. República de Panamá 3055, San Isidro, Lima."),
             createPara("Giro de Negocio: Exploración y Explotación de Hidrocarburos."),

             createHeading("1.2 Misión, Visión, Objetivos, Valores", HeadingLevel.HEADING_2),
             createPara("**Misión:** Operar y desarrollar yacimientos de hidrocarburos de manera eficiente, segura y responsable."),
             createPara("**Visión:** Ser una compañía de energía de clase mundial, reconocida por su excelencia operativa e innovación tecnológica."),
             createPara("**Valores Corporativos:**"),
             createListItem("Seguridad ante todo."),
             createListItem("Integridad."),
             createListItem("Excelencia Operativa."),
             createListItem("Responsabilidad Social."),

             createHeading("1.3 Productos, Mercado, Clientes", HeadingLevel.HEADING_2),
             createPara("Pluspetrol es el operador del Consorcio Camisea, gestionando los Lotes 88 y 56."),
             createListItem("Productos: Gas Natural (GN), Líquidos de Gas Natural (LGN), GLP, Nafta, Diésel."),
             createListItem("Clientes: Generadoras Eléctricas (Kallpa), Distribuidoras de Gas (Cálidda), Mercado de Exportación."),

             createHeading("1.4 Estructura Operativa", HeadingLevel.HEADING_2),
             createPara("El sistema se despliega en:"),
             createListItem("**Sede Lima**: Administrativa."),
             createListItem("**Sede Pisco**: Planta de Fraccionamiento (Industrial Costa)."),
             createListItem("**Sede Malvinas**: Planta de Separación (Industrial Selva Remota - Satelital)."),

             new Paragraph({ children: [new PageBreak()] }),

             // === CAPITULO II ===
             createHeading("CAPÍTULO II: PLAN DEL PROYECTO DE INNOVACIÓN", HeadingLevel.HEADING_1),

             createHeading("2.1 Identificación del problema", HeadingLevel.HEADING_2),
             createPara("Actualmente, el control presupuestal de servicios auxiliares (Facility Management) se gestiona mediante Excel fragmentados. Esto genera:"),
             createListItem("Inconsistencia de datos entre analistas."),
             createListItem("Errores humanos de digitación manual."),
             createListItem("Falta de trazabilidad y retraso en reportes (latencia de 20 días)."),
             
             createPara("**Caso Malvinas 2025:** Se detectó una desviación no reportada del 1.99% ($9,350 USD) en 'Servicios Globales' por errores de copiado manual."),

             createHeading("2.2 Objetivos del Proyecto", HeadingLevel.HEADING_2),
             createPara("**Objetivo General:** Implementar 'JeffAutomates', una plataforma web integral para automatizar la captura y visualización de costos operativos."),
             createPara("**Objetivos Específicos:**"),
             createListItem("Desarrollar módulo 'KPIS Data' en Next.js con validación de catálogos."),
             createListItem("Centralizar la información en un modelo relacional (Budget vs Actual)."),
             createListItem("Implementar persistencia local (LocalStorage) para funcionamiento Offline en Malvinas."),
             createListItem("Diseñar Dashboards en Power BI con semáforos de alerta."),

             createHeading("2.3 Justificación", HeadingLevel.HEADING_2),
             createPara("**Técnica:** Migración a Web Moderna (PWA) con React/Next.js elimina errores de Excel y permite validación estricta."),
             createPara("**Económica:** Evitar fugas presupuestales del 2% ($100k/año) justifica la inversión."),
             createPara("**Operativa:** Libera 70% del tiempo del analista para tareas de valor agregado."),

             new Paragraph({ children: [new PageBreak()] }),

             // === CAPITULO III ===
             createHeading("CAPÍTULO III: ANÁLISIS DE LA SITUACIÓN ACTUAL", HeadingLevel.HEADING_1),
             
             createHeading("3.1 Descripción del Proceso Actual", HeadingLevel.HEADING_2),
             createPara("Flujo lineal manual: Proveedor -> Excel -> Correo -> Copiar/Pegar -> Imputación Manual -> Reporte PPT."),
             createPara("El 60% de errores ocurre durante la 'Imputación Contable' manual por decidir 'al ojo' la cuenta contable."),

             createHeading("3.2 Diagrama de Ishikawa", HeadingLevel.HEADING_2),
             createPara("**Problema:** Desviaciones presupuestales."),
             createListItem("Método: Consolidación manual no estandarizada."),
             createListItem("Mano de Obra: Dedazos, desconocimiento de cuentas."),
             createListItem("Material: Datas no estructuradas, archivos corruptos."),
             createListItem("Maquinaria: Excel usado como Base de Datos."),

             createHeading("3.3 Diagrama de Pareto", HeadingLevel.HEADING_2),
             createPara("El 80% de los incidentes se debe a: **Error de Digitación** y **Fórmulas Rotas**. La automatización ataca estos dos puntos críticamente."),

             new Paragraph({ children: [new PageBreak()] }),

             // === CAPITULO IV ===
             createHeading("CAPÍTULO IV: PROPUESTA TÉCNICA - JEFFAUTOMATES", HeadingLevel.HEADING_1),

             createHeading("4.1 Plan de Acción", HeadingLevel.HEADING_2),
             createPara("Desarrollo ágil en Sprints: Diseño UX -> Desarrollo Core -> Módulo KPIS -> Power BI -> Despliegue."),

             createHeading("4.2 Arquitectura (JAMstack)", HeadingLevel.HEADING_2),
             createListItem("**Frontend:** Next.js 15 (App Router, Server Components)."),
             createListItem("**Lenguaje:** TypeScript 5.0 (Tipado estricto para montos)."),
             createListItem("**Estilos:** Tailwind CSS 3.4 (Diseño responsivo)."),
             createListItem("**Iconos:** Lucide React."),

             createHeading("4.3 Módulo Central: KPIS DATA", HeadingLevel.HEADING_2),
             createPara("Solución mediante **Inputs Restringidos** y **Selectores en Cascada**:"),
             createListItem("1. Selector Sede: [LIMA, PISCO, MALVINAS]."),
             createListItem("2. Selector Grupo: Se filtra según Sede."),
             createListItem("3. Selector Actividad: Se filtra según Grupo."),
             createPara("Esto elimina errores de asignación cruzada. Se implementa **LocalStorage** para persistencia ante cortes de red."),

             createHeading("4.4 Dashboards Power BI", HeadingLevel.HEADING_2),
             createPara("**Resumen Ejecutivo:** Tarjetas KPI (Budget vs Ejecutado) y Velocímetro de % Ejecución."),
             createPara("**Semáforo de Alertas (DAX):**"),
             createListItem("🔴 ROJO: > 100% Presupuesto."),
             createListItem("🟡 ÁMBAR: > 90% Presupuesto."),
             createListItem("🟢 VERDE: Normal."),

             new Paragraph({ children: [new PageBreak()] }),

             // === CAPITULO V ===
             createHeading("CAPÍTULO V: COSTOS DE IMPLEMENTACIÓN", HeadingLevel.HEADING_1),

             createHeading("5.1 Costos Directos", HeadingLevel.HEADING_2),
             createTable([
                 ["Concepto", "Costo Anual", "Tipo"],
                 ["Desarrollo (300 hrs x $15)", "$4,500", "Inversión (HH)"],
                 ["Hosting Vercel Pro", "$240", "Recurrente"],
                 ["Licencias Power BI (3 users)", "$360", "Recurrente"],
                 ["Base de Datos Supabase (Pro)", "$300", "Recurrente"]
             ]),
             createPara("**Total Inversión Primer Año:** $5,400 USD aprox."),

             createHeading("5.2 Beneficio Económico (Ahorro)", HeadingLevel.HEADING_2),
             createPara("**Prevención de Pérdidas:** Evitar 2% de desviación en Malvinas = $9,200 USD."),
             createPara("**Ahorro HH:** 60 hrs/mes analista = $14,400 USD anual."),
             createPara("**Total Beneficio:** ~$23,600 USD."),

             createHeading("5.3 ROI", HeadingLevel.HEADING_2),
             createPara("ROI = (23,600 - 5,400) / 5,400 = **3.37**."),
             createPara("**Retorno:** 337%. El proyecto se paga en 3 meses."),

             new Paragraph({ children: [new PageBreak()] }),

             // === CAPITULO VI ===
             createHeading("CAPÍTULO VI: CONCLUSIONES Y RECOMENDACIONES", HeadingLevel.HEADING_1),
             
             createHeading("6.1 Conclusiones", HeadingLevel.HEADING_2),
             createListItem("El módulo 'KPIS Data' redujo a 0% los errores de imputación gracias a los selectores en cascada."),
             createListItem("Visibilidad en tiempo real desde dispositivos móviles."),
             createListItem("El semáforo en Power BI detectó correctamente la desviación de $9,350 en pruebas."),
             createListItem("Alta adopción por parte de usuarios gracias a la interfaz intuitiva."),

             createHeading("6.2 Recomendaciones", HeadingLevel.HEADING_2),
             createListItem("Integrar vía API con SAP para automatizar SolPeds."),
             createListItem("Extender el sistema a control de Horas Hombre y Flota/Transporte."),
             createListItem("Implementar 2FA para accesos externos."),

             new Paragraph({ children: [new PageBreak()] }),

             createHeading("REFERENCIAS BIBLIOGRÁFICAS", HeadingLevel.HEADING_1),
             createListItem("Vercel Inc. (2025). Next.js 15 Documentation."),
             createListItem("Microsoft Corp. (2025). Power BI Data Modeling."),
             createListItem("Pluspetrol. (2024). Manual de Procedimientos de Control de Gestión."),

             new Paragraph({ children: [new PageBreak()] }),

             createHeading("ANEXOS", HeadingLevel.HEADING_1),
             createPara("**ANEXO 1: Catálogo de Actividades.**"),
             createTable([
                 ["Sede", "Grupo", "Actividad", "SAP"],
                 ["PISCO", "VIGILANCIA", "RONDA PERIMETRAL", "45001"],
                 ["PISCO", "VIGILANCIA", "CONTROL ACCESOS", "45002"],
                 ["MALVINAS", "ALIMENTACIÓN", "DESAYUNO", "45099"],
             ]),
             createPara(""),
             createPara("**ANEXO 2: Código Fuente Hook de Persistencia.**"),
             createPara("const useKpiPersistence = (key, val) => { ... }"),
        ]
    }]
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync('testing/tesis_doc/TESIS_COMPLETA_JEFFAUTOMATES_V2.docx', buffer);
    console.log("Documento Word generado exitosamente: testing/tesis_doc/TESIS_COMPLETA_JEFFAUTOMATES_V2.docx");
});
