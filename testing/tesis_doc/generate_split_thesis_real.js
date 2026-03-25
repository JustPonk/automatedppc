const fs = require('fs');
const path = require('path');
const { 
    Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, 
    PageBreak, Table, TableRow, TableCell, WidthType, BorderStyle, 
    ShadingType 
} = require('docx');

const SOURCE_FILE = path.join(__dirname, 'TESIS_BORRADOR_COMPLETO.md');
const OUT_FILE_1 = path.join(__dirname, 'TESIS_PARTE_1.docx');
const OUT_FILE_2 = path.join(__dirname, 'TESIS_PARTE_2.docx');

// --- STYLES & HELPERS ---
const styles = {
    font: "Arial",
    size: 24, // 12pt
    heading1Size: 32, // 16pt
    heading2Size: 28, // 14pt
    heading3Size: 24, // 12pt
    tableHeaderSize: 22,
    tableCellSize: 20,
    codeSize: 20, // 10pt
};

function parseInlineFormatting(text, options = {}) {
    const runs = [];
    const parts = text.split(/(\*\*.*?\*\*)/);
    
    parts.forEach(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
            runs.push(new TextRun({ 
                text: part.slice(2, -2), 
                bold: true, 
                font: styles.font, 
                size: options.size || styles.size,
                color: options.color || "000000"
            }));
        } else if (part.length > 0) {
            runs.push(new TextRun({ 
                text: part, 
                font: styles.font, 
                size: options.size || styles.size,
                color: options.color || "000000"
            }));
        }
    });
    return runs;
}

function createPara(text, options = {}) {
    if (!text) return new Paragraph({ text: "" });
    
    return new Paragraph({
        children: parseInlineFormatting(text, options),
        alignment: options.alignment || AlignmentType.JUSTIFIED,
        spacing: { line: 360, after: 200, before: options.before || 0 }, 
        bullet: options.bullet,
        heading: options.heading,
        pageBreakBefore: options.pageBreakBefore
    });
}

function createHeading(text, level) {
    let size = styles.heading1Size;
    if (level === HeadingLevel.HEADING_2) size = styles.heading2Size;
    if (level === HeadingLevel.HEADING_3) size = styles.heading3Size;
    
    const displayText = text.replace(/^#+\s*/, '');

    return new Paragraph({
        children: [new TextRun({ text: displayText, bold: true, font: styles.font, size, color: "000000" })],
        heading: level,
        alignment: level === HeadingLevel.HEADING_1 ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: level === HeadingLevel.HEADING_1
    });
}

function createTable(headers, rows) {
    const tableRows = [];

    // Header
    if (headers && headers.length > 0) {
        tableRows.push(new TableRow({
            children: headers.map(h => new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: h.trim(), bold: true, color: "FFFFFF", font: styles.font, size: styles.tableHeaderSize })],
                    alignment: AlignmentType.CENTER
                })],
                shading: { fill: "2E74B5", type: ShadingType.CLEAR },
                verticalAlign: "center",
                margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }))
        }));
    }

    // Body
    rows.forEach(r => {
        tableRows.push(new TableRow({
            children: r.map(c => new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: c ? c.trim() : "", font: styles.font, size: styles.tableCellSize })],
                    alignment: AlignmentType.LEFT
                })],
                margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }))
        }));
    });

    return new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
    });
}

function createCodeBlock(lines) {
    const textContent = lines.join('\n');
    return new Paragraph({
        children: [new TextRun({ text: textContent, font: "Courier New", size: styles.codeSize })],
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

// --- MAIN PARSER ---
function parseMarkdownToDocxChildren(markdownContent) {
    const lines = markdownContent.split(/\r?\n/);
    const children = [];
    
    let inCodeBlock = false;
    let codeBuffer = [];
    
    let inTable = false;
    let tableHeaders = [];
    let tableRows = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        const originalLine = lines[i]; 

        // 1. Handle Code Blocks
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                // End of code block
                if (codeBuffer.length > 0) {
                    children.push(createCodeBlock(codeBuffer));
                }
                codeBuffer = [];
                inCodeBlock = false;
            } else {
                // Start of code block
                inCodeBlock = true;
            }
            continue;
        }
        if (inCodeBlock) {
            codeBuffer.push(originalLine); // Keep indentation
            continue;
        }

        // 2. Handle Tables
        if (line.startsWith('|')) {
            const cells = line.split('|').filter((c, idx, arr) => {
                // Filter out the first and last empty strings if the user uses pipes at ends e.g. | col | col |
                return !(idx === 0 && c === '') && !(idx === arr.length - 1 && c === '');
            });
            
            if (!inTable) {
                // Start of table (try to detect header)
                inTable = true;
                tableHeaders = cells;
                // Check if next line is separator
                if (lines[i+1] && lines[i+1].trim().startsWith('|') && lines[i+1].includes('---')) {
                    i++; // Skip separator line
                }
            } else {
                tableRows.push(cells);
            }
            continue;
        } else {
            if (inTable) {
                // End of table detected
                children.push(createTable(tableHeaders, tableRows));
                inTable = false;
                tableHeaders = [];
                tableRows = [];
            }
        }

        // 3. Handle Page Breaks
        if (line.includes('page-break-after: ALWAYS')) {
            children.push(new Paragraph({ children: [new PageBreak()] }));
            continue;
        }
        if (line === '---') {
             continue; // Ignore horizontal rules or treat as separator
        }

        // 4. Handle Headers
        if (line.startsWith('# ')) {
            children.push(createHeading(line, HeadingLevel.HEADING_1));
            continue;
        }
        if (line.startsWith('## ')) {
            children.push(createHeading(line, HeadingLevel.HEADING_2));
            continue;
        }
        if (line.startsWith('### ')) {
            children.push(createHeading(line, HeadingLevel.HEADING_3));
            continue;
        }

        // 5. Handle Lists
        if (line.startsWith('* ') || line.startsWith('- ')) {
            const text = line.replace(/^[\*\-]\s+/, '');
            children.push(createPara(text, { bullet: { level: 0 } }));
            continue;
        }
        
        // 6. Handle Regular Paragraphs
        if (line.length > 0) {
            // Heuristic for title centering
            const options = {};
            if (
                line.includes('SERVICIO NACIONAL') || 
                line.includes('DIRECCIÓN ZONAL') ||
                line.includes('PROYECTO DE INNOVACIÓN') ||
                line.includes('TÍTULO DEL PROYECTO') ||
                (line.includes('LIMA, PERÚ') && i < 30) // Only at start
            ) {
                options.alignment = AlignmentType.CENTER;
                if (line.includes('IMPLEMENTACIÓN')) options.bold = true;
            }
            
            children.push(createPara(line, options));
        } else {
            children.push(new Paragraph({ text: "" }));
        }
    }
    
    if (inTable) {
        children.push(createTable(tableHeaders, tableRows));
    }

    return children;
}


// --- EXECUTION ---
async function generate() {
    console.log("Leyendo archivo:", SOURCE_FILE);
    // Simple way to read text in Node
    const content = fs.readFileSync(SOURCE_FILE, 'utf-8');
    
    // Split content
    const splitMarker = "# CAPÍTULO IV";
    const parts = content.split(splitMarker);
    
    // Just in case it fails to split exactly
    let contentPart1 = content;
    let contentPart2 = "";

    if (parts.length >= 2) {
        contentPart1 = parts[0];
        // Reconstruct part 2 with the header
        contentPart2 = splitMarker + parts.slice(1).join(splitMarker);
    } else {
        console.warn("Marcador de división no encontrado. Se generará todo en Parte 1.");
    }

    console.log("Generando Parte 1...");
    const docChildren1 = parseMarkdownToDocxChildren(contentPart1);
    const doc1 = new Document({
        styles: { paragraphStyles: [{ id: "Normal", name: "Normal", run: { font: styles.font, size: styles.size } }] },
        sections: [{ children: docChildren1 }]
    });

    // Save Doc 1
    const buffer1 = await Packer.toBuffer(doc1);
    fs.writeFileSync(OUT_FILE_1, buffer1);
    console.log(`Creado: ${OUT_FILE_1}`);

    if (contentPart2) {
        console.log("Generando Parte 2...");
        const docChildren2 = parseMarkdownToDocxChildren(contentPart2);
        const doc2 = new Document({
            styles: { paragraphStyles: [{ id: "Normal", name: "Normal", run: { font: styles.font, size: styles.size } }] },
            sections: [{ 
                // Reset page numbering? Not strictly necessary but good.
                properties: { page: { pageNumbers: { start: 1, formatType: "decimal" } } },
                children: docChildren2 
            }]
        });

        // Save Doc 2
        const buffer2 = await Packer.toBuffer(doc2);
        fs.writeFileSync(OUT_FILE_2, buffer2);
        console.log(`Creado: ${OUT_FILE_2}`);
    }
}

generate().catch(err => console.error(err));
