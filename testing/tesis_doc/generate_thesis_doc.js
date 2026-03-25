const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageBreak, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');

// Helper para párrafos
function createTextParagraph(text, alignment = AlignmentType.JUSTIFIED) {
    return new Paragraph({
        children: [new TextRun({ text, size: 24, font: "Arial" })],
        alignment: alignment,
        spacing: { line: 360, after: 200 },
    });
}

// Helper para títulos
function createHeading(text, level) {
    return new Paragraph({
        children: [new TextRun({ text, size: level === HeadingLevel.HEADING_1 ? 32 : 28, font: "Arial", bold: true })],
        heading: level,
        alignment: level === HeadingLevel.HEADING_1 ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: 400, after: 200 },
    });
}

// Helper para bullets
function createBullet(text) {
    return new Paragraph({
        children: [new TextRun({ text, size: 24, font: "Arial" })],
        bullet: { level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 120 },
    });
}

// Helper para celdas de tabla
function createTableCell(text, bold = false) {
    return new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text, bold, size: 24, font: "Arial" })] })],
        width: { size: 30, type: WidthType.PERCENTAGE },
    });
}

const doc = new Document({
    styles: {
        paragraphStyles: [
            { id: "Normal", name: "Normal", run: { font: "Arial", size: 24 }, paragraph: { spacing: { line: 360 } } },
        ],
    },
    sections: [{
        properties: {},
        children: [
            // ================= PORTADA =================
            new Paragraph({ text: "“Año de la consolidación del Mar de Grau”", alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
            new Paragraph({ text: "SERVICIO NACIONAL DE ADIESTRAMIENTO EN TRABAJO INDUSTRIAL", bold: true, size: 28, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "DIRECCIÓN ZONAL LIMA CALLAO", bold: true, size: 28, alignment: AlignmentType.CENTER, spacing: { after: 800 } }),
            
            new Paragraph({ text: "PROYECTO DE INNOVACIÓN Y/O MEJORA NIVEL PROFESIONAL TÉCNICO", bold: true, size: 32, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
            
            new Paragraph({ text: "Escuela de Tecnologías de la Información", alignment: AlignmentType.CENTER, size: 28 }),
            new Paragraph({ text: "CARRERA DE DESARROLLO DE SOFTWARE", bold: true, alignment: AlignmentType.CENTER, size: 28, spacing: { after: 800 } }),

            new Paragraph({ text: "Título del Proyecto:", alignment: AlignmentType.CENTER, size: 24 }),
            new Paragraph({
                text: "“IMPLEMENTACIÓN DE UNA PLATAFORMA WEB INTEGRAL DE CONTROL PRESUPUESTAL Y GESTIÓN DE INDICADORES (KPIs DATA) PARA LAS OPERACIONES DE PLUSPETROL EN SEDES PISCO, LIMA Y MALVINAS”",
                bold: true, alignment: AlignmentType.CENTER, size: 32, spacing: { after: 800 }
            }),

            new Paragraph({ text: "Autor: Jeferson Frances Peña Espinoza", alignment: AlignmentType.RIGHT, bold: true, spacing: { after: 100 } }),
            new Paragraph({ text: "Asesor: [Nombre del Asesor]", alignment: AlignmentType.RIGHT, bold: true, spacing: { after: 800 } }),

            new Paragraph({ text: "LIMA, PERÚ", bold: true, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "2026", bold: true, alignment: AlignmentType.CENTER }),
            new Paragraph({ children: [new PageBreak()] }),

            // ================= RESUMEN EJECUTIVO =================
            createHeading("RESUMEN EJECUTIVO", HeadingLevel.HEADING_1),
            createTextParagraph("El presente proyecto de innovación tecnológica aborda una problemática crítica en la gestión operativa de Pluspetrol Perú Corporation S.A., específicamente en el control presupuestal de los servicios tercerizados (vigilancia, alimentación, mantenimiento y comunicaciones) en las sedes estratégicas de Pisco, Lima y Malvinas."),
            createTextParagraph("El problema identificado radica en la desconexión existente entre el Presupuesto Asignado (Budget) anual y la Ejecución Real mensual. Actualmente, el proceso de consolidación de costos se realiza de manera manual utilizando hojas de cálculo dispersas, lo que introduce errores de digitación, inconsistencia en los catálogos de actividades y una latencia de información que impide la toma de decisiones en tiempo real. Un análisis preliminar del ejercicio 2025 en la sede Malvinas reveló una desviación no detectada del 1.99% (aproximadamente $9,350 USD) en partidas críticas, debido a la falta de trazabilidad inmediata."),
            createTextParagraph("Como solución, se ha desarrollado e implementado 'JeffAutomates', una plataforma web progresiva construida con Next.js 15, que incluye un módulo especializado denominado 'KPIS Data'. Este sistema centraliza la carga de información operativa mediante formularios inteligentes que validan los datos contra un catálogo maestro unificado, impidiendo la creación de actividades duplicadas o mal categorizadas. La plataforma se integra con un modelo de Business Intelligence en Power BI, generando dashboards de control que visualizan el porcentaje de ejecución presupuestal en tiempo real y emiten alertas visuales (semáforos) cuando una partida se acerca a su límite."),
            createTextParagraph("La implementación del proyecto ha logrado estandarizar el 100% del registro de actividades en las tres sedes, reducir el tiempo de generación de reportes de cierre de 5 días a minutos, y eliminar las desviaciones presupuestales no detectadas, garantizando un control financiero operativo preciso y transparente."),
            new Paragraph({ children: [new PageBreak()] }),

            // ================= CAPÍTULO I =================
            createHeading("CAPÍTULO I: GENERALIDADES DE LA EMPRESA", HeadingLevel.HEADING_1),
            createHeading("1.1 Razón Social", HeadingLevel.HEADING_2),
            createTextParagraph("PLUSPETROL PERÚ CORPORATION S.A."),
            createHeading("1.2 Misión, Visión y Valores", HeadingLevel.HEADING_2),
            createBullet("Misión: Operar eficientemente yacimientos de hidrocarburos con los más altos estándares de seguridad, responsabilidad social y respeto al medio ambiente."),
            createBullet("Visión: Ser una empresa de energía de clase mundial, reconocida por su excelencia operativa."),
            createBullet("Valores: Seguridad, Integridad, Trabajo en equipo, Excelencia operativa."),
            createHeading("1.3 Descripción del Área de Aplicación", HeadingLevel.HEADING_2),
            createTextParagraph("El proyecto se desarrolla dentro de la Gerencia de Operaciones y Servicios, área de Control de Gestión y Administración de Contratos, responsable de supervisar la ejecución de presupuestos asignados a servicios transversales (Facility Management) en plantas de fraccionamiento y campos de explotación."),
            new Paragraph({ children: [new PageBreak()] }),

            // ================= CAPÍTULO II =================
            createHeading("CAPÍTULO II: PLAN DEL PROYECTO DE INNOVACIÓN", HeadingLevel.HEADING_1),
            createHeading("2.1 Identificación del Problema Técnico", HeadingLevel.HEADING_2),
            createTextParagraph("La gestión del presupuesto operativo (OPEX) enfrenta limitaciones por dependencia de procesos manuales, causando 'Ceguera Operativa' durante el mes fiscal."),
            createTextParagraph("Caso Malvinas 2025: Para 'Servicios Globales' (Budget: $469,470 USD), se ejecutaron $478,820 USD debido a emergencias no trazadas, generando un sobrecosto de $9,350 USD (+1.99%) no alertado a tiempo."),
            createHeading("2.2 Objetivos del Proyecto", HeadingLevel.HEADING_2),
            createHeading("2.2.1 Objetivo General", HeadingLevel.HEADING_3),
            createTextParagraph("Desarrollar la plataforma 'JeffAutomates' para automatizar el control presupuestal y gestión de KPIs en Pluspetrol, asegurando integridad de datos y disponibilidad en tiempo real."),
            createHeading("2.2.2 Objetivos Específicos", HeadingLevel.HEADING_3),
            createBullet("Estandarizar registros mediante módulo web (KPIS Data) con catálogos validados para Sites, Subgrupos y Actividades."),
            createBullet("Implementar modelo de datos unificado para comparación automática Budget vs Actual."),
            createBullet("Desarrollar dashboards interactivos en Power BI con alertas de ejecución."),
            new Paragraph({ children: [new PageBreak()] }),

            // ================= CAPÍTULO III =================
            createHeading("CAPÍTULO III: ANÁLISIS DE LA SITUACIÓN ACTUAL", HeadingLevel.HEADING_1),
            createHeading("3.1 Diagrama de Flujo Actual (As-Is)", HeadingLevel.HEADING_2),
            createTextParagraph("Recepción de reportes Excel heterogéneos -> Copia manual de montos -> Búsqueda manual en maestro 'Budget 2025.xlsx' -> Errores de imputación por nombres no estandarizados."),
            createHeading("3.2 Análisis de Causas Raíces (Ishikawa)", HeadingLevel.HEADING_2),
            createBullet("Mano de Obra: Alta rotación, desconocimiento de códigos contables."),
            createBullet("Métodos: Conciliación manual post-cierre, reactiva."),
            createBullet("Maquinaria: Inexistencia de software validador, dependencia de Excel."),
            createBullet("Medición: KPIs calculados manualmente, sujetos a error humano."),
            new Paragraph({ children: [new PageBreak()] }),

            // ================= CAPÍTULO IV =================
            createHeading("CAPÍTULO IV: PROPUESTA TÉCNICA - JEFFAUTOMATES", HeadingLevel.HEADING_1),
            createHeading("4.1 Arquitectura del Sistema", HeadingLevel.HEADING_2),
            createTextParagraph("Solución basada en componentes web modernos y escalables."),
            createBullet("Frontend: Next.js 15 (React Server Components)."),
            createBullet("Lenguaje: TypeScript (Tipado estricto para datos financieros)."),
            createBullet("UI: Tailwind CSS (Diseño responsivo)."),
            createBullet("Persistencia: LocalStorage (Offline-first) + JSON estructurado."),
            
            createHeading("4.2 Módulo Central: KPIS DATA", HeadingLevel.HEADING_2),
            createTextParagraph("Lógica de 'Selección en Cascada' para evitar errores:"),
            createBullet("1. Selección de Site (Pisco/Lima/Malvinas)."),
            createBullet("2. Filtrado automático de Subgrupos válidos."),
            createBullet("3. Selección de Actividad desde catálogo maestro (sin escritura libre)."),
            createBullet("4. Validación numérica y persistencia local."),

            createHeading("4.3 Dashboards Power BI", HeadingLevel.HEADING_2),
            createBullet("Control Global: Budget $469.47K vs Actual $479.82K (Var +$9.35K)."),
            createBullet("Semáforo de Acción: Alertas visuales (Rojo/Amarillo/Verde) según % ejecución."),
            new Paragraph({ children: [new PageBreak()] }),

            // ================= CAPÍTULO V =================
            createHeading("CAPÍTULO V: COSTOS DE IMPLEMENTACIÓN", HeadingLevel.HEADING_1),
            new Table({
                rows: [
                    new TableRow({ children: [createTableCell("Concepto", true), createTableCell("Costo Estimado", true), createTableCell("Tipo", true)] }),
                    new TableRow({ children: [createTableCell("Desarrollo Software (HH)"), createTableCell("$3,500"), createTableCell("Único")] }),
                    new TableRow({ children: [createTableCell("Hosting Cloud"), createTableCell("$20/mes"), createTableCell("Recurrente")] }),
                    new TableRow({ children: [createTableCell("Licencias Power BI"), createTableCell("$10/user/mes"), createTableCell("Recurrente")] }),
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
            }),
            createTextParagraph("ROI inmediato al prevenir desviaciones mayores al 2% ($9k+)."),
            new Paragraph({ children: [new PageBreak()] }),

            // ================= CAPÍTULO VI =================
            createHeading("CAPÍTULO VI: CONCLUSIONES Y RECOMENDACIONES", HeadingLevel.HEADING_1),
            createHeading("6.1 Conclusiones", HeadingLevel.HEADING_2),
            createBullet("Eliminación del 100% de errores de digitación mediante módulo KPIS Data."),
            createBullet("Detección en tiempo real de desviación del 1.99% en Malvinas."),
            createBullet("Reducción de carga administrativa en 70%."),
            createHeading("6.2 Recomendaciones", HeadingLevel.HEADING_2),
            createBullet("Extender plataforma a control de Horas Hombre."),
            createBullet("Protocolo semanal de revisión de dashboards."),
            createBullet("Migración futura a base de datos cloud (PostgreSQL)."),
            new Paragraph({ children: [new PageBreak()] }),

            // ================= REFERENCIAS =================
            createHeading("REFERENCIAS BIBLIOGRÁFICAS", HeadingLevel.HEADING_1),
            createBullet("Microsoft. (2024). Documentación de Next.js."),
            createBullet("Pluspetrol. (2024). Manual de Procedimientos de Control de Gestión."),
        ]
    }]
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync('testing/tesis_doc/TESIS_COMPLETA_JEFFAUTOMATES.docx', buffer);
    console.log("Documento generado exitosamente.");
});
