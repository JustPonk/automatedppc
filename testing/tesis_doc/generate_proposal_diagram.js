const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname);

class SvgBuilder {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.elements = [];
    }

    addRect(x, y, w, h, fill, stroke = 'none', strokeWidth = 0, rx = 0) {
        this.elements.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`);
    }

    addText(x, y, text, fontSize, fill, anchor = "middle", fontWeight = "normal") {
        const lines = text.split('\n');
        lines.forEach((line, i) => {
            this.elements.push(`<text x="${x}" y="${y + (i * fontSize * 1.2)}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${fill}" text-anchor="${anchor}" font-weight="${fontWeight}">${line}</text>`);
        });
    }

    addArrow(x1, y1, x2, y2, stroke = "black", strokeWidth = 2) {
        this.elements.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" />`);
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 10;
        const x3 = x2 - headLen * Math.cos(angle - Math.PI / 6);
        const y3 = y2 - headLen * Math.sin(angle - Math.PI / 6);
        const x4 = x2 - headLen * Math.cos(angle + Math.PI / 6);
        const y4 = y2 - headLen * Math.sin(angle + Math.PI / 6);
        const path = `M ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`;
        this.elements.push(`<path d="${path}" fill="${stroke}" />`);
    }

    build() {
        return `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg" style="background-color: white;">
            <rect width="100%" height="100%" fill="white" />
            ${this.elements.join('\n')}
        </svg>`;
    }
}

function generateArchitectureDiagram() {
    const width = 1000;
    const height = 700;
    const svg = new SvgBuilder(width, height);

    svg.addText(width / 2, 40, "Arquitectura de Solución: JeffAutomates", 24, "#1F4E79", "middle", "bold");

    const z1x = 50, z1w = 280; // Frontend
    const z2x = 360, z2w = 280; // Logic
    const z3x = 670, z3w = 280; // BI
    const zoneY = 80;
    const zoneH = 450;

    svg.addRect(z1x, zoneY, z1w, zoneH, "#F0F8FF", "#BDD7EE", 2, 10);
    svg.addRect(z2x, zoneY, z2w, zoneH, "#FFF2CC", "#FFD966", 2, 10);
    svg.addRect(z3x, zoneY, z3w, zoneH, "#E2EFDA", "#A9D08E", 2, 10);

    // Zone 1: Frontend
    svg.addText(z1x + z1w/2, zoneY + 30, "1. Frontend (PWA)", 18, "#2E74B5", "middle", "bold");
    svg.addText(z1x + z1w/2, zoneY + 55, "Next.js 15 + TypeScript", 14, "#555", "middle");

    svg.addRect(z1x + 20, zoneY + 80, z1w - 40, 50, "white", "#2E74B5", 1, 5);
    svg.addText(z1x + z1w/2, zoneY + 110, "ExcelUploader\n(Drag & Drop)", 14, "black", "middle");

    svg.addRect(z1x + 20, zoneY + 150, z1w - 40, 50, "white", "#2E74B5", 1, 5);
    svg.addText(z1x + z1w/2, zoneY + 180, "KpisDataForm\n(Formulario Ppal)", 14, "black", "middle");

    svg.addRect(z1x + 20, zoneY + 220, z1w - 40, 50, "white", "#2E74B5", 1, 5);
    svg.addText(z1x + z1w/2, zoneY + 250, "Tailwind CSS\n(Estilos)", 14, "black", "middle");

    svg.addRect(z1x + 40, zoneY + 350, z1w - 80, 60, "#D9E1F2", "#2E74B5", 2, 15);
    svg.addText(z1x + z1w/2, zoneY + 380, "Persistencia Local\n(Offline Mode)", 12, "black", "middle", "bold");


    // Zone 2: Logic
    svg.addText(z2x + z2w/2, zoneY + 30, "2. Lógica de Negocio", 18, "#BF8F00", "middle", "bold");
    svg.addText(z2x + z2w/2, zoneY + 55, "Validación en Cascada", 14, "#555", "middle");

    const dX = z2x + 40, dW = z2w - 80, dH = 40;
    
    svg.addRect(dX, zoneY + 100, dW, dH, "white", "black", 1);
    svg.addText(z2x + z2w/2, zoneY + 125, "1. Seleccionar SEDE", 14, "black");
    
    svg.addArrow(z2x + z2w/2, zoneY + 140, z2x + z2w/2, zoneY + 170);

    svg.addRect(dX, zoneY + 170, dW, dH, "white", "black", 1);
    svg.addText(z2x + z2w/2, zoneY + 195, "2. Filtrar GRUPO", 14, "black");

    svg.addArrow(z2x + z2w/2, zoneY + 210, z2x + z2w/2, zoneY + 240);

    svg.addRect(dX, zoneY + 240, dW, dH, "white", "black", 1);
    svg.addText(z2x + z2w/2, zoneY + 265, "3. Filtrar ACTIVIDAD", 14, "black");

    svg.addRect(dX - 10, zoneY + 320, dW + 20, 50, "#C6E0B4", "#385723", 2, 5);
    svg.addText(z2x + z2w/2, zoneY + 350, "DATA LIMPIA\n(Sin Errores)", 14, "#385723", "middle", "bold");


    // Zone 3: BI
    svg.addText(z3x + z3w/2, zoneY + 30, "3. Dashboards Power BI", 18, "#385723", "middle", "bold");
    
    svg.addRect(z3x + 20, zoneY + 80, z3w - 40, 100, "white", "#385723", 1);
    svg.addText(z3x + z3w/2, zoneY + 110, "Resumen Ejecutivo", 14, "black", "middle", "bold");
    svg.addText(z3x + z3w/2, zoneY + 140, "KPI: Budget vs Actual\nGauge Chart", 12, "#555", "middle");

    svg.addRect(z3x + 20, zoneY + 200, z3w - 40, 100, "white", "#385723", 1);
    svg.addText(z3x + z3w/2, zoneY + 230, "Semáforo de Alertas", 14, "black", "middle", "bold");
    svg.addText(z3x + z3w/2, zoneY + 260, "DAX: SWITCH(Risk)", 12, "#555", "middle");
    svg.addText(z3x + z3w/2, zoneY + 280, "🔴 Crítico  🟡 Riesgo", 12, "black", "middle");

    
    // Connections
    svg.addArrow(z1x + z1w, zoneY + 200, z2x, zoneY + 200, "#555", 3); // Front to Logic
    svg.addArrow(z2x + z2w, zoneY + 350, z3x, zoneY + 250, "#555", 3); // Logic to BI


    // Timeline
    const tY = 560, tH = 100;
    svg.addRect(50, tY, 900, tH, "#f9f9f9", "#999", 1);
    
    svg.addText(width/2, tY + 25, "Cronograma de Ejecución (4 Meses)", 16, "#333", "middle", "bold");

    const mY = tY + 40, mW = 200, gap = 20, startX = 75;

    svg.addRect(startX, mY, mW, 40, "#D9D9D9", "#555", 1);
    svg.addText(startX + mW/2, mY + 25, "Mes 1: Limpieza", 12, "black");

    svg.addRect(startX + mW + gap, mY, mW, 40, "#BDD7EE", "#555", 1);
    svg.addText(startX + mW + gap + mW/2, mY + 25, "Mes 2: Desarrollo Web", 12, "black");

    svg.addRect(startX + (mW + gap)*2, mY, mW, 40, "#FFF2CC", "#555", 1);
    svg.addText(startX + (mW + gap)*2 + mW/2, mY + 25, "Mes 3: Integra. PowerBI", 12, "black");

    svg.addRect(startX + (mW + gap)*3, mY, mW, 40, "#C6E0B4", "#555", 1);
    svg.addText(startX + (mW + gap)*3 + mW/2, mY + 25, "Mes 4: Go-Live", 12, "black");


    fs.writeFileSync(path.join(OUT_DIR, 'arquitectura_solucion.svg'), svg.build());
}

generateArchitectureDiagram();
console.log("Diagrama generado en testing/tesis_doc/arquitectura_solucion.svg");
