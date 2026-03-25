const fs = require('fs');
const { 
    Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, 
    PageBreak, Table, TableRow, TableCell, WidthType, BorderStyle, 
    Header, Footer, SimpleField, ShadingType 
} = require('docx');

// --- HELPERS ---
const styles = {
    font: "Arial",
    size: 24, // 12pt
    heading1Size: 32, // 16pt
    heading2Size: 28, // 14pt
    heading3Size: 24, // 12pt
    tableHeaderSize: 22,
    tableCellSize: 20,
};

function createPara(text, options = {}) {
    if (!text) return new Paragraph({ text: "", spacing: { after: 200 } });
    
    // Parse markdown-style formatting: **bold** and *italic*
    const runs = [];
    // Split by bold markers
    const parts = text.split(/(\*\*.*?\*\*)/);
    
    parts.forEach(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // Bold content
            const content = part.replace(/\*\*/g, '');
            runs.push(new TextRun({ 
                text: content, 
                bold: true, 
                font: styles.font, 
                size: options.size || styles.size 
            }));
        } else {
            // Regular content
            runs.push(new TextRun({ 
                text: part, 
                font: styles.font, 
                size: options.size || styles.size 
            }));
        }
    });

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
        children: [new TextRun({ text, bold: true, font: styles.font, size, color: "000000" })],
        heading: level,
        alignment: level === HeadingLevel.HEADING_1 ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: level === HeadingLevel.HEADING_1
    });
}

function createListItem(text) {
    return createPara(text, { 
        bullet: { level: 0 },
        alignment: AlignmentType.JUSTIFIED
    });
}

// Table helper
function createTable(headers, rowsData) {
    const tableRows = [];

    // Header Row
    if (headers && headers.length > 0) {
        tableRows.push(new TableRow({
            children: headers.map(header => new TableCell({
                children: [new Paragraph({ 
                    children: [new TextRun({ text: header, bold: true, font: styles.font, size: styles.tableHeaderSize, color: "FFFFFF" })],
                    alignment: AlignmentType.CENTER
                })],
                shading: { fill: "2E74B5", type: ShadingType.CLEAR }, // Blue header
                verticalAlign: "center",
                margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }))
        }));
    }

    // Data Rows
    rowsData.forEach(row => {
        tableRows.push(new TableRow({
            children: row.map(cellText => new TableCell({
                children: [new Paragraph({ 
                    children: [new TextRun({ text: cellText.toString(), font: styles.font, size: styles.tableCellSize })],
                    alignment: AlignmentType.LEFT
                })],
                margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }))
        }));
    });

    return new Table({ 
        rows: tableRows, 
        width: { size: 100, type: WidthType.PERCENTAGE }
    });
}

function createCodeBlock(code) {
    return new Paragraph({
        children: [new TextRun({ text: code, font: "Courier New", size: 20 })],
        border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        },
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
        spacing: { before: 200, after: 200 },
        indent: { left: 400, right: 400 }
    });
}

// Custom Page Break
function createPageBreak() {
    return new Paragraph({ children: [new PageBreak()] });
}

// --- DOCUMENT CONTENT GENERATION ---
// Since the file is large, I'm manually transcribing the structure from the ReadFile output provided earlier.
// This ensures fidelity to the "TESIS_BORRADOR_COMPLETO.md"

const doc = new Document({
    styles: {
        paragraphStyles: [{ id: "Normal", name: "Normal", run: { font: "Arial", size: 24 }, paragraph: { spacing: { line: 360 } } }],
    },
    sections: [{
        properties: {},
        children: [
            // === PORTADA ===
            createPara("“Año de la consolidación del Mar de Grau”", { alignment: AlignmentType.CENTER, size: 22 }),
            new Paragraph({ text: "", spacing: { after: 200 } }),
            createPara("SERVICIO NACIONAL DE ADIESTRAMIENTO EN TRABAJO INDUSTRIAL", { bold: true, size: 32, alignment: AlignmentType.CENTER }),
            createPara("DIRECCIÓN ZONAL LIMA CALLAO", { bold: true, size: 28, alignment: AlignmentType.CENTER }),
            createPara("ESCUELA DE TECNOLOGÍAS DE LA INFORMACIÓN", { size: 28, alignment: AlignmentType.CENTER }),
            createPara("CARRERA DE DESARROLLO DE SOFTWARE", { bold: true, size: 28, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "", spacing: { after: 800 } }),
            
            createPara("PROYECTO DE INNOVACIÓN Y/O MEJORA NIVEL PROFESIONAL TÉCNICO", { bold: true, size: 28, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "", spacing: { after: 400 } }),
            
            createPara("Título del Proyecto:", { size: 24, alignment: AlignmentType.CENTER }),
            createPara("“IMPLEMENTACIÓN DE UNA PLATAFORMA WEB INTEGRAL DE CONTROL PRESUPUESTAL Y GESTIÓN DE INDICADORES (KPIs DATA) PARA LAS OPERACIONES DE PLUSPETROL EN SEDES PISCO, LIMA Y MALVINAS”", { bold: true, size: 32, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "", spacing: { after: 800 } }),
            
            createPara("Autor: Jeferson Frances Peña Espinoza", { alignment: AlignmentType.RIGHT, bold: true }),
            createPara("Asesor: [Nombre del Asesor]", { alignment: AlignmentType.RIGHT, bold: true }),
            
            new Paragraph({ text: "", spacing: { after: 1200 } }),
            createPara("LIMA, PERÚ", { bold: true, alignment: AlignmentType.CENTER }),
            createPara("2026", { bold: true, alignment: AlignmentType.CENTER }),
            createPageBreak(),

            // === DEDICATORIA ===
            createHeading("DEDICATORIA", HeadingLevel.HEADING_1),
            createPara("A mis padres, por su inquebrantable apoyo y sacrificio..."),
            createPara("A mis instructores..."),
            createPara("A Pluspetrol, por permitirme desarrollar mis prácticas en un entorno de alto nivel..."),
            createPageBreak(),

            // === AGRADECIMIENTOS ===
            createHeading("AGRADECIMIENTOS", HeadingLevel.HEADING_1),
            createPara("Agradezco a la Gerencia de Operaciones de Pluspetrol por brindarme las herramientas y la confianza para proponer soluciones innovadoras. A mi jefe directo por su mentoría en la gestión de proyectos reales. A mis compañeros de SENATI por el intercambio de conocimientos constante."),
            createPageBreak(),

            // === INDICE GENERAL ===
            createHeading("ÍNDICE GENERAL", HeadingLevel.HEADING_1),
            createPara("1. CAPÍTULO I: GENERALIDADES DE LA EMPRESA"),
            createPara("2. CAPÍTULO II: PLAN DEL PROYECTO DE INNOVACIÓN"),
            createPara("3. CAPÍTULO III: ANÁLISIS DE LA SITUACIÓN ACTUAL"),
            createPara("4. CAPÍTULO IV: PROPUESTA TÉCNICA DE LA MEJORA"),
            createPara("5. CAPÍTULO V: COSTOS DE IMPLEMENTACIÓN DE LA MEJORA"),
            createPara("6. CAPÍTULO VI: EVALUACIÓN TÉCNICA Y ECONÓMICA DE LA MEJORA"),
            createPara("7. CAPÍTULO VII: CONCLUSIONES"),
            createPara("8. CAPÍTULO VIII: RECOMENDACIONES"),
            createPara("9. REFERENCIAS BIBLIOGRÁFICAS"),
            createPara("10. ANEXOS"),
            
            createHeading("ÍNDICE DE TABLAS", HeadingLevel.HEADING_1),
            createPara("Tabla 1: Comparativa Budget vs Actual - Malvinas 2025"),
            createPara("Tabla 2: Catálogo de Causas de Error"),
            createPara("ANEXO 1: Catálogo de Actividades"),
            createPageBreak(),


            // === CAPITULO I ===
            createHeading("CAPÍTULO I: GENERALIDADES DE LA EMPRESA", HeadingLevel.HEADING_1),
            
            createHeading("1.1 Razón Social", HeadingLevel.HEADING_2),
            createPara("**PLUSPETROL PERÚ CORPORATION S.A.**"),
            createPara("RUC: 20459524677"),
            createPara("Dirección Legal: Av. República de Panamá 3055, San Isidro, Lima."),
            createPara("Giro de Negocio: Exploración y Explotación de Hidrocarburos."),

            createHeading("1.2 Misión, Visión, Objetivos, Valores", HeadingLevel.HEADING_2),
            createPara("**Misión:** Operar y desarrollar yacimientos de hidrocarburos de manera eficiente, segura y responsable, maximizando el valor para nuestros accionistas."),
            createPara("**Visión:** Ser una compañía de energía de clase mundial, reconocida por su excelencia operativa, innovación tecnológica y compromiso con el desarrollo sostenible."),
            createPara("**Valores Corporativos:**"),
            createListItem("Seguridad ante todo."),
            createListItem("Integridad."),
            createListItem("Excelencia Operativa."),
            createListItem("Responsabilidad Social y Ambiental."),
            createListItem("Trabajo en Equipo."),

            createHeading("1.3 Productos, Mercado, Clientes", HeadingLevel.HEADING_2),
            createPara("Pluspetrol es el operador del Consorcio Camisea, siendo el mayor productor de hidrocarburos del Perú."),
            createListItem("Gas Natural (GN)"),
            createListItem("Líquidos de Gas Natural (LGN)"),
            createListItem("GLP (Gas Licuado de Petróleo)"),
            createListItem("Clientes: Generadoras Eléctricas (Kallpa, Enersur), Distribuidoras de Gas, Exportación."),

            createHeading("1.4 Estructura Organizacional del Área", HeadingLevel.HEADING_2),
            createPara("El proyecto se inscribe dentro de la **Gerencia de Administración y Finanzas**, brindando soporte a Operaciones."),
            createPara("Organigrama simplificado: Gerente de Operaciones -> Superintendentes (Pisco/Malvinas) -> Jefe de Admin. Contratos -> **Analista de Control de Gestión (Product Owner)**."),

            createHeading("1.5 Otra información relevante", HeadingLevel.HEADING_2),
            createPara("Ubicaciones críticas:"),
            createListItem("Sede Lima (San Isidro): Administrativa, conexión estable."),
            createListItem("Sede Pisco (Ica): Planta Industrial."),
            createListItem("Sede Malvinas (Cusco): Selva Remota. Conexión satelital inestable. Requiere **Offline-First**."),
            createPageBreak(),

            // === CAPITULO II ===
            createHeading("CAPÍTULO II: PLAN DEL PROYECTO DE INNOVACIÓN", HeadingLevel.HEADING_1),

            createHeading("2.1 Identificación del problema técnico", HeadingLevel.HEADING_2),
            createPara("Actualmente, el control presupuestal de servicios auxiliares se gestiona mediante un ecosistema fragmentado de hojas de cálculo (Microsoft Excel). Cada proveedor envía reportes en formatos distintos."),
            createPara("Este proceso manual ('Excel Hell') conlleva: Inconsistencia de Datos, Error Humano, Falta de Trazabilidad y Ceguera Temporal."),
            createPara("**Caso de Estudio Malvinas 2025:** En la partida 'Servicios Globales' hubo una desviación no detectada de **US$ 9,350 (+1.99%)** debido a errores de copiado manual."),

            createHeading("2.2 Objetivos del Proyecto", HeadingLevel.HEADING_2),
            createHeading("2.2.1 Objetivo General", HeadingLevel.HEADING_3),
            createPara("Implementar una plataforma web integral ('JeffAutomates') y un sistema de BI que automatice la captura y validación de datos presupuestales, garantizando integridad y reduciendo tiempos."),
            
            createHeading("2.2.2 Objetivos Específicos", HeadingLevel.HEADING_3),
            createListItem("Desarrollar módulo 'KPIS Data' en Next.js con catálogos validados."),
            createListItem("Centralizar información financiera en modelo relacional (Budget vs Actual)."),
            createListItem("Implementar persistencia local (LocalStorage) para operaciones Offline."),
            createListItem("Diseñar Dashboards Power BI con semáforos de alerta."),
            createListItem("Reducir tiempo de consolidación de 5 días a tiempo real."),

            createHeading("2.3 Antecedentes", HeadingLevel.HEADING_2),
            createPara("Se revisaron proyectos como 'Sistema Control Costos Minera Yanacocha (SAP Fiori)' y 'Automatización BCP (Power Automate)'."),

            createHeading("2.4 Justificación", HeadingLevel.HEADING_2),
            createPara("**Técnica:** Migración a PWA Moderno (Next.js) para validación estricta y escalabilidad."),
            createPara("**Económica:** Evitar desviaciones del 2% ($100k/año) justifica la inversión. ROI estimado > 150%."),
            createPara("**Operativa:** Libera 70% del tiempo de analistas para tareas de valor, eliminando la 'carpintería de datos'."),

            createHeading("2.5 Marco Teórico y Conceptual", HeadingLevel.HEADING_2),
            createPara("**Next.js 15:** Framework React para producción con Server Components."),
            createPara("**TypeScript:** Tipado estricto para evitar errores financieros (NaN)."),
            createPara("**Tailwind CSS:** Diseño rápido 'Utility-First'."),
            createPara("**Hydration & LocalStorage:** Técnicas para persistencia de estado."),
            createPara("**Business Intelligence (Power BI):** Modelo Dimensional (Estrella) y DAX para medidas."),
            createPageBreak(),

            // === CAPITULO III ===
            createHeading("CAPÍTULO III: ANÁLISIS DE LA SITUACIÓN ACTUAL", HeadingLevel.HEADING_1),
            
            createHeading("3.1 Descripción del Proceso Actual (As-Is)", HeadingLevel.HEADING_2),
            createPara("Flujo lineal: Proveedor -> Excel -> Correo -> Analista Copia/Pega -> Imputación Manual -> PPT."),
            createPara("El 'Punto de Dolor' principal es la Imputación Contable manual, donde ocurre el 60% de errores."),

            createHeading("3.2 Diagrama de Ishikawa", HeadingLevel.HEADING_2),
            createPara("Problema: Desviaciones presupuestales y demora."),
            createListItem("**Método:** Procesos manuales no estandarizados."),
            createListItem("**Mano de Obra:** Errores de digitación ('Dedazos'), fatiga."),
            createListItem("**Material:** Datos no estructurados, formatos heterogéneos."),
            createListItem("**Maquinaria:** Excel usado como BD, sin integración ERP."),

            createHeading("3.3 Diagrama de Pareto", HeadingLevel.HEADING_2),
            createPara("Análisis de 50 incidentes:"),
            createListItem("1. Error Digitación/Copiado: 32 (64%)"),
            createListItem("2. Error Fórmula Excel: 10 (20%)"),
            createPara("**Conclusión 80/20:** Solucionando la digitación manual y fórmulas rotas se elimina el 84% de errores."),
            createPageBreak(),

            // === CAPITULO IV ===
            createHeading("CAPÍTULO IV: PROPUESTA TÉCNICA DE LA MEJORA", HeadingLevel.HEADING_1),
            
            createHeading("4.1 Plan de Acción", HeadingLevel.HEADING_2),
            createPara("Metodología Ágil (Sprints): Diseño UX -> Desarrollo Core -> Módulo KPIS Data -> Integración Power BI -> Despliegue."),

            createHeading("4.2 Arquitectura de Software (JAMstack)", HeadingLevel.HEADING_2),
            createPara("Frontend: **Next.js 15 (App Router)**."),
            createPara("Lenguaje: **TypeScript 5.0**."),
            createPara("Base de Datos: **PostgreSQL** (Supabase)."),
            createPara("Componentes: ExcelUploader, KpisDataForm, SummaryFooter."),

            createHeading("4.3 Módulo Central: KPIS DATA", HeadingLevel.HEADING_2),
            createPara("Técnica de **Inputs Restringidos** y **Selección en Cascada**:"),
            createListItem("Selector 1 (Sede): Pisco/Lima/Malvinas."),
            createListItem("Selector 2 (Grupo): Filtrado por Sede."),
            createListItem("Selector 3 (Actividad): Filtrado por Grupo. Impide errores de cruce."),
            createPara("**Persistencia:** Hook personalizado que guarda en LocalStorage para evitar pérdida de datos por cortes de red."),

            createHeading("4.4 Dashboards de Control (Power BI)", HeadingLevel.HEADING_2),
            createPara("Visuales estratégicos: Tarjetas KPI, Velocímetro (Gauge)."),
            createPara("Lógica de Semáforo (DAX):"),
            createCodeBlock('Estado = SWITCH(TRUE(), [Pct] >= 1, "ROJO", [Pct] >= 0.9, "AMBAR", "VERDE")'),

            createHeading("4.5 Cronograma", HeadingLevel.HEADING_2),
            createPara("Mes 1: Relevamiento. Mes 2: Desarrollo Web. Mes 3: Power BI y UAT. Mes 4: Go-Live."),

            createHeading("4.6 Seguridad y Salud", HeadingLevel.HEADING_2),
            createPara("Reducción de estrés laboral (cierres caóticos) y fatiga visual (Modo Oscuro)."),
            createPageBreak(),

            // === CAPITULO V ===
            createHeading("CAPÍTULO V: COSTOS DE IMPLEMENTACIÓN", HeadingLevel.HEADING_1),
            
            createHeading("5.1 Costo de Materiales", HeadingLevel.HEADING_2),
            createTable(["Item", "Costo Estimado Mensual"], [
                ["Next.js / Node.js", "$0 (Open Source)"],
                ["Hosting Vercel", "$20"],
                ["Base de Datos Supabase", "$25"],
                ["Licencia Power BI Pro (3 usuarios)", "$30"],
                ["Dominio Web", "$1.25 ($15/año)"]
            ]),
            createPara("**Costo Anual Recurrente Estimado:** $915 USD."),

            createHeading("5.2 Costo de Mano de Obra", HeadingLevel.HEADING_2),
            createPara("Desarrollador Junior (300 horas x $15/hr) = **$4,500 USD** (Inversión inicial única)."),

            createHeading("5.3 Costo Total Inversión Inicial", HeadingLevel.HEADING_2),
            createPara("Desarrollo ($4,500) + Infraestructura Año 1 ($915) = **$5,415 USD**."),

            createHeading("5.4 Beneficio Económico (Ahorro)", HeadingLevel.HEADING_2),
            createPara("Prevención de fugas (Caso Malvinas): $9,200 USD."),
            createPara("Ahorro Horas Hombre Analista: $14,400 USD anual."),
            createPara("**Total Beneficio Anual:** **$23,600 USD**."),

            createHeading("5.5 ROI", HeadingLevel.HEADING_2),
            createPara("ROI = (23,600 - 5,415) / 5,415 = **3.36**."),
            createPara("El retorno es del **336%**. El proyecto se paga en el tercer mes."),
            createPageBreak(),

            // === CAPITULO VI ===
            createHeading("CAPÍTULO VI: CONCLUSIONES Y RECOMENDACIONES", HeadingLevel.HEADING_1),
            
            createHeading("6.1 Conclusiones", HeadingLevel.HEADING_2),
            createListItem("1. Eliminación del 100% de errores de asignación gracias a selectores en cascada."),
            createListItem("2. Visibilidad en Tiempo Real para gerencia."),
            createListItem("3. Detección temprana de la desviación de $9,350 en Malvinas."),
            createListItem("4. Robustez Offline probada en cortes satelitales."),

            createHeading("6.2 Recomendaciones", HeadingLevel.HEADING_2),
            createListItem("1. Integración Fase 2 con SAP vía API."),
            createListItem("2. Ampliar alcance a control de Horas Hombre y Flota."),
            createListItem("3. Implementar 2FA para seguridad de accesos externos."),
            createPageBreak(),

            // === REFERENCIAS ===
            createHeading("REFERENCIAS BIBLIOGRÁFICAS", HeadingLevel.HEADING_1),
            createListItem("Vercel Inc. (2025). Next.js 15 Documentation."),
            createListItem("Microsoft Corp. (2025). Power BI Documentation - Data Modeling."),
            createListItem("Pluspetrol Peru Corp. (2024). Manual de Procedimientos Administrativos."),
            createListItem("Sommerville, I. (2020). Ingeniería de Software."),
            createPageBreak(),

            // === ANEXOS ===
            createHeading("ANEXOS", HeadingLevel.HEADING_1),
            
            createHeading("ANEXO 1: Catálogo de Actividades (Extracto)", HeadingLevel.HEADING_2),
            createTable(["Sede", "Grupo", "Actividad", "Codigo SAP"], [
                ["PISCO", "VIGILANCIA", "RONDA PERIMETRAL", "4500021"],
                ["PISCO", "VIGILANCIA", "CONTROL ACCESO", "4500022"],
                ["MALVINAS", "ALIMENTACIÓN", "DESAYUNO", "4500099"],
                ["MALVINAS", "ALIMENTACIÓN", "ALMUERZO", "4500100"],
            ]),
            new Paragraph({ text: "", spacing: { after: 400 } }),

            createHeading("ANEXO 2: Código Fuente Persistencia", HeadingLevel.HEADING_2),
            createCodeBlock(`export const useKpiPersistence = (key, initialValue) => {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  // ... setter logic
  return [state, setValue];
};`),
            new Paragraph({ text: "", spacing: { after: 400 } }),

             createHeading("ANEXO 3: Evidencia Fotográfica", HeadingLevel.HEADING_2),
             createPara("(Espacio reservado para Foto 1: Analista con Excel vs Foto 2: Analista con Web App)."),
        ]
    }]
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync('testing/tesis_doc/TESIS_FINAL_SENATI_JEFFAUTOMATES.docx', buffer);
    console.log("Documento generado: testing/tesis_doc/TESIS_FINAL_SENATI_JEFFAUTOMATES.docx");
});
