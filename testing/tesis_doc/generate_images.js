const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname);

// --- HELPER SVG BUILDER ---
class SvgBuilder {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.elements = [];
        this.defs = [];
    }

    addRect(x, y, w, h, fill, stroke = 'none', strokeWidth = 0) {
        this.elements.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`);
    }

    addLine(x1, y1, x2, y2, stroke, strokeWidth) {
        this.elements.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" />`);
    }

    addText(x, y, text, fontSize, fill, anchor = "middle", fontWeight = "normal") {
        this.elements.push(`<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${fill}" text-anchor="${anchor}" font-weight="${fontWeight}">${text}</text>`);
    }

    addCircle(cx, cy, r, fill, stroke = 'none') {
        this.elements.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" />`);
    }

    addPath(d, fill, stroke, strokeWidth) {
        this.elements.push(`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`);
    }

    build() {
        return `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="white" />
            ${this.elements.join('\n')}
        </svg>`;
    }
}

// --- 1. GENERAR PARETO CHART ---
function generatePareto() {
    const width = 800;
    const height = 500;
    const padding = 60;
    const svg = new SvgBuilder(width, height);

    // Data from Thesis
    const data = [
        { label: "Digitación", value: 32, cum: 64 },
        { label: "Fórmulas", value: 10, cum: 84 },
        { label: "Archivos", value: 5, cum: 94 },
        { label: "Otros", value: 3, cum: 100 }
    ];

    const maxVal = 50; // Y-axis max for bars
    const barWidth = 80;
    const graphWidth = width - (padding * 2);
    const graphHeight = height - (padding * 2);
    
    // Axes
    svg.addLine(padding, height - padding, width - padding, height - padding, "black", 2); // X
    svg.addLine(padding, height - padding, padding, padding, "black", 2); // Y Left
    svg.addLine(width - padding, height - padding, width - padding, padding, "black", 2); // Y Right

    // Axis Labels
    svg.addText(padding - 20, padding, "Frecuencia", 14, "black", "end");
    svg.addText(width - padding + 20, padding, "% Acumulado", 14, "black", "start");

    // Plot Data
    const stepX = graphWidth / data.length;
    let prevX = 0;
    let prevY = 0;

    data.forEach((d, i) => {
        const x = padding + (stepX * i) + (stepX - barWidth) / 2;
        const barHeight = (d.value / maxVal) * graphHeight;
        const y = height - padding - barHeight;

        // Bar
        svg.addRect(x, y, barWidth, barHeight, "#2E74B5"); // Blue bars
        svg.addText(x + barWidth/2, y - 10, d.value.toString(), 14, "black");
        
        // X Label
        svg.addText(x + barWidth/2, height - padding + 20, d.label, 12, "black");

        // Line Point (Cumulative)
        const lineX = x + barWidth/2;
        const lineY = height - padding - (d.cum / 100 * graphHeight);
        
        if (i > 0) {
            svg.addLine(prevX, prevY, lineX, lineY, "#C00000", 3); // Red line
        } else {
            // Start from 0? or first point. Usually Pareto starts line at first bar top or 0.
            // Let's start line from first bar center
        }

        svg.addCircle(lineX, lineY, 5, "#C00000");
        svg.addText(lineX, lineY - 10, d.cum + "%", 12, "#C00000");

        prevX = lineX;
        prevY = lineY;
    });

    // Title
    svg.addText(width/2, 30, "Diagrama de Pareto: Causas de Error en Reportes", 20, "black", "middle", "bold");

    fs.writeFileSync(path.join(OUT_DIR, 'grafico_pareto.svg'), svg.build());
}

// --- 2. GENERAR ISHIKAWA (Causa-Efecto) ---
function generateIshikawa() {
    const width = 900;
    const height = 500;
    const svg = new SvgBuilder(width, height);

    // Main Spine
    svg.addLine(100, height/2, 800, height/2, "black", 4);
    
    // Head (Problem)
    const headX = 800;
    const headY = height/2;
    svg.addPath(`M ${headX} ${headY} L ${headX-30} ${headY-20} L ${headX-30} ${headY+20} Z`, "black", "none", 0); // Arrow head
    
    svg.addRect(headX + 10, headY - 40, 180, 80, "#FFE699", "black", 2);
    svg.addText(headX + 100, headY, "Desviaciones\nPresupuestales", 16, "black", "middle", "bold");

    // Categories (Ribs)
    const categories = [
        { name: "MÉTODO", x: 200, y: 100, items: ["Procesos Manuales", "Sin Validación"] },
        { name: "MANO DE OBRA", x: 400, y: 100, items: ["Errores Digitación", "Fatiga"] },
        { name: "MATERIAL", x: 200, y: 400, items: ["Datos No Estructurados", "Formatos Distintos"] },
        { name: "MAQUINARIA", x: 400, y: 400, items: ["Excel como BD", "Sin ERP"] }
    ];

    categories.forEach(cat => {
        const isTop = cat.y < height/2;
        const endY = height/2;
        
        // Diagonal Line
        svg.addLine(cat.x, cat.y, cat.x + 100, endY, "black", 2);
        
        // Category Box
        svg.addRect(cat.x - 60, cat.y - 20, 160, 40, "#DEEBF7", "#2E74B5", 2);
        svg.addText(cat.x + 20, cat.y + 5, cat.name, 14, "#2E74B5", "middle", "bold");

        // Items (Sub-causes)
        cat.items.forEach((item, i) => {
            const itemY = isTop ? cat.y + 40 + (i*25) : cat.y - 40 - (i*25);
            const itemX = cat.x + 30 + (i*10); // indent
            
            // Small horizontal line for item
            // svg.addLine(itemX, itemY, itemX + 20, itemY, "gray", 1);
            svg.addText(itemX, itemY, "• " + item, 12, "black", "start");
        });
    });

    // Title
    svg.addText(width/2, 30, "Diagrama de Ishikawa: Causas del Problema", 20, "black", "middle", "bold");

    fs.writeFileSync(path.join(OUT_DIR, 'diagrama_ishikawa.svg'), svg.build());
}

// Run
generatePareto();
generateIshikawa();

console.log("Imagenes generadas SVG en testing/tesis_doc/");
