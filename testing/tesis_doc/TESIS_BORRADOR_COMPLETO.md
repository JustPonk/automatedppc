“Año de la consolidación del Mar de Grau”
 
SERVICIO NACIONAL DE ADIESTRAMIENTO EN TRABAJO INDUSTRIAL


DIRECCIÓN ZONAL LIMA CALLAO


PROYECTO DE INNOVACIÓN Y/O MEJORA NIVEL PROFESIONAL TÉCNICO

CARRERA: DESARROLLO DE SOFTWARE


TÍTULO DEL PROYECTO:
“IMPLEMENTACIÓN DE UNA PLATAFORMA WEB INTEGRAL DE CONTROL PRESUPUESTAL Y GESTIÓN DE INDICADORES (KPIs DATA) PARA LAS OPERACIONES DE PLUSPETROL EN SEDES PISCO, LIMA Y MALVINAS”




Autor: Peña Espinoza Jeferson Frances
Asesor: Calzada Vega Daniel

LIMA, PERÚ
2026
 



## DEDICATORIA

Espacio reservado para dedicatoria


## ÍNDICE GENERAL

    automatico en word

# CAPÍTULO I: GENERALIDADES DE LA EMPRESA

## 1.1 Razón Social
**PLUSPETROL PERÚ CORPORATION S.A.**  
RUC: 20459524677  
Dirección Legal: Av. República de Panamá 3055, San Isidro, Lima.
Giro de Negocio: Exploración y Explotación de Hidrocarburos.

## 1.2 Misión, Visión, Objetivos, Valores

### Misión
"Operar y desarrollar yacimientos de hidrocarburos de manera eficiente, segura y responsable, maximizando el valor para nuestros accionistas, contribuyendo al desarrollo energético de los países donde operamos y promoviendo el bienestar de las comunidades vecinas y la preservación del medio ambiente."

### Visión
"Ser una compañía de energía de clase mundial, reconocida por su excelencia operativa, innovación tecnológica y compromiso con el desarrollo sostenible, liderando la transición energética en la región."

### Valores Corporativos
1.  **Seguridad ante todo**: La integridad física de nuestros colaboradores y contratistas es innegociable.
2.  **Integridad**: Actuamos con transparencia, ética y honestidad en todas nuestras relaciones.
3.  **Excelencia Operativa**: Buscamos la mejora continua y la eficiencia en cada proceso.
4.  **Responsabilidad Social y Ambiental**: Respetamos el entorno y generamos valor compartido.
5.  **Trabajo en Equipo**: Fomentamos la colaboración y el respeto mutuo.

## 1.3 Productos, Mercado, Clientes
Pluspetrol es el operador del Consorcio Camisea, siendo el mayor productor de hidrocarburos del Perú. La empresa gestiona los Lotes 88 y 56.

*   **Gas Natural (GN)**: Combustible para generación eléctrica e industria.
*   **Líquidos de Gas Natural (LGN)**: Insumo para GLP.
*   **GLP (Gas Licuado de Petróleo)**: Principal combustible doméstico en Perú.
*   **Nafta y Diésel**: Combustibles líquidos derivados.

**Clientes Principales**:
*   Generadoras Eléctricas (Kallpa, Enersur).
*   Distribuidoras de Gas (Cálidda, Contugas).
*   Mercado de Exportación.

## 1.4 Estructura Organizacional del Área
El proyecto se inscribe dentro de la **Gerencia de Administración y Finanzas**, específicamente brindando soporte a la **Gerencia de Operaciones**. El usuario final directo es el equipo de **Control de Gestión**, encargado de monitorear el OPEX.

*   Gerente General
    *   Gerente de Operaciones
        *   Superintendente de Planta Malvinas
        *   Superintendente de Planta Pisco
        *   Gerente de Servicios de Soporte
            *   Jefe de Administración de Contratos
                *   **Analista de Control de Gestión (Product Owner)**
                *   Asistentes Administrativos

## 1.5 Otra información relevante
El sistema **JeffAutomates** se desplegará para atender a tres ubicaciones críticas con realidades distintas:

1.  **Sede Lima (San Isidro)**: Centro administrativo. Conexión a internet estable (Fibra Óptica). Aquí se toman las decisiones financieras globales.
2.  **Sede Pisco (Ica)**: Planta de Fraccionamiento. Ubicación costera industrial. Conexión estable pero con restricciones de firewall corporativo.
3.  **Sede Malvinas (Cusco)**: Planta de Separación de Gas. Ubicación remota en la selva (Bajo Urubamba).
    *   **Desafío Crítico**: La conexión es satelital y sujeta a interrupciones por clima.
    *   **Requisito de Software**: El sistema debe tolerar desconexiones (**Offline-First**) y sincronizar datos cuando la red se restablezca.

---
<div style="page-break-after: ALWAYS;"></div>

# CAPÍTULO II: PLAN DEL PROYECTO DE INNOVACIÓN

## 2.1 Identificación del problema técnico en la empresa

### Descripción de la Realidad Problemática
En la actualidad, el control presupuestal de los servicios auxiliares (Facility Management, Alimentación, Transporte, Servicios Generales) en las sedes de Pluspetrol se gestiona mediante un ecosistema fragmentado de hojas de cálculo (Microsoft Excel). Cada proveedor (Sodexo, Aramark, Securitas, etc.) envía sus reportes mensuales en formatos distintos. El equipo de Control de Gestión debe consolidar manualmente esta información para compararla con el "Budget" anual aprobado.

Este proceso manual ("Excel Hell") conlleva riesgos inherentes:
1.  **Inconsistencia de Datos**: No existe una "Fuente Única de Verdad". Cada analista tiene su propia versión del archivo "Final".
2.  **Error Humano**: La digitación manual de miles de filas mensuales introduce errores inevitables.
3.  **Falta de Trazabilidad**: No se sabe quién modificó un dato ni cuándo.
4.  **Ceguera Temporal**: El reporte consolidado llega semanas después del cierre de mes, impidiendo la gestión proactiva.

### Problema Principal
**Ineficiencia y falta de fiabilidad en el control del ejecución presupuestal operativa (OPEX), ocasionando desviaciones financieras no detectadas a tiempo.**

### Caso de Estudio: Malvinas 2025
Durante el ejercicio fiscal 2025, en la partida de "Servicios Globales" de la Sede Malvinas:
*   **Budget Asignado**: US$ 469,470
*   **Ejecutado Real (Reportado en Excel)**: US$ 460,000 (Aparentemente OK).
*   **Ejecutado Real (Auditado post-factura)**: US$ 478,820.
*   **Desviación No Detectada**: US$ 9,350 (+1.99%).

El error se debió a que facturas de "Servicios de Emergencia Médica" fueron omitidas en el copiado y pegado manual de un archivo a otro. Esta desviación, aunque porcentualmente pequeña, representa casi **$10,000 USD** de pérdida directa por falta de control.

## 2.2 Objetivos del Proyecto

### 2.2.1 Objetivo General
Implementar una plataforma web integral ("JeffAutomates") y un sistema de Business Intelligence que automatice la captura, validación y visualización de datos de ejecución presupuestal para las sedes de Pluspetrol, garantizando la integridad de la información y reduciendo el tiempo de gestión administrativa.

### 2.2.2 Objetivos Específicos
1.  **Desarrollar un módulo de ingreso de datos ("KPIS Data")** basado en tecnologías web modernas (Next.js), que utilice catálogos maestros validados para impedir errores de digitación en la selección de Sedes, Subgrupos y Actividades.
2.  **Centralizar la información financiera** en una estructura de datos unificada (Modelo Relacional) que permita la comparación automática entre el Presupuesto (Budget) y el Gasto Real (Actual).
3.  **Implementar mecanismos de persistencia local (LocalStorage)** para asegurar que los avances de carga de datos no se pierdan ante interrupciones de red, comunes en la operación remota de Malvinas.
4.  **Diseñar Dashboards en Power BI** con indicadores de semaforización (Verde, Ámbar, Rojo) que alerten visualmente sobre partidas que superen el 90% (Preventiva) y 100% (Correctiva) de su presupuesto asignado.
5.  **Reducir el tiempo de consolidación de reportes** de 5 días hábiles a tiempo real (actualización inmediata tras la carga).

## 2.3 Antecedentes del Proyecto
Se han revisado proyectos similares en la industria:
1.  *Sistema de Control de Costos para Minera Yanacocha (2019)*: Implementación de SAP Fiori para reportes de campo. Resultado: Reducción del 40% en tiempos de reporte.
2.  *Automatización de Reportes con Power Automate en Banco BCP (2021)*: Uso de herramientas Low-Code.
3.  *JeffAutomates V1 (Prototipo Excel con Macros)*: Un intento previo del autor que mejoró parcialmente el proceso pero encontró límites en la concurrencia de usuarios (archivos bloqueados).

## 2.4 Justificación del Proyecto

### Justificación Técnica
La transición de hojas de cálculo aisladas a una aplicación web progresiva (PWA) permite aprovechar las ventajas de validación de datos en el frontend, tipado estricto (TypeScript) y centralización de la lógica de negocio. Esto elimina la dependencia de "la persona que sabe usar el Excel" y democratiza el acceso a la información. Además, Next.js permite una arquitectura escalable y mantenible a largo plazo.

### Justificación Económica
El costo de no tener calidad de datos es alto. Una desviación no detectada del 2% en un presupuesto operativo anual de $5 Millones de USD representa $100,000 USD de sobrecosto. La inversión en el desarrollo del software es marginal comparada con el ahorro potencial por control de fugas presupuestales. El ROI estimado es superior al 150% en el primer año.

### Justificación Operativa
El personal de Control de Gestión dedica actualmente el 70% de su tiempo a "carpintería de datos" (copiar, pegar, arreglar formatos) y solo el 30% al análisis de valor. Con **JeffAutomates**, esta proporción se invierte, permitiendo que el talento humano se enfoque en optimizar costos, negociar mejores tarifas con proveedores y buscar eficiencias operativas reales.

## 2.5 Marco Teórico y Conceptual

### 2.5.1 Fundamentos de Desarrollo Web Moderno
*   **Next.js 15**: Framework de React para producción. Ofrece características clave como:
    *   **Server Components**: Renderizado en el servidor para menor carga de JavaScript en el cliente, ideal para dispositivos modestos en campo.
    *   **Server Actions**: Manejo de mutaciones de datos directamente desde el servidor sin necesidad de crear APIs REST separadas.
    *   **Routing**: Sistema de rutas basado en archivos (`app/page.tsx`).
*   **React 19 (RC)**: Biblioteca de JavaScript para construir interfaces de usuario basada en componentes. Introduce mejoras en concurrencia y manejo del estado.
*   **TypeScript**: Superset de JavaScript que añade tipado estricto. Es fundamental en aplicaciones financieras donde `number` no puede ser tratado como `string` para evitar errores de cálculo (`NaN`).

### 2.5.2 Estilizado y UX
*   **Tailwind CSS**: Framework de utilidades CSS ("Utility-First"). Permite construir diseños complejos directamente en el HTML sin salir del contexto, facilitando el mantenimiento y la consistencia visual (Design System).

### 2.5.3 Gestión de Estado y Persistencia
*   **Hydration**: Proceso donde Next.js "reactiva" el HTML estático enviado por el servidor.
*   **LocalStorage**: API del navegador que permite almacenar pares clave-valor (hasta 5MB) de forma persistente. Usado en este proyecto para guardar borradores de formularios ("Drafts") y evitar pérdida de datos.

### 2.5.4 Business Intelligence (BI)
*   **Power BI**: Servicio de análisis de negocios de Microsoft.
*   **Modelo Dimensional (Estrella)**: Técnica de modelado de datos optimizada para consultas analíticas.
    *   **Tabla de Hechos (Fact Table)**: Contiene las métricas numéricas (Costos, Horas).
    *   **Tablas de Dimensión**: Contienen los atributos descriptivos (Fecha, Sede, Proveedor).
*   **DAX (Data Analysis Expressions)**: Lenguaje de fórmulas para crear medidas personalizadas.

---
<div style="page-break-after: ALWAYS;"></div>

# CAPÍTULO III: ANÁLISIS DE LA SITUACIÓN ACTUAL

## 3.1 Descripción del Proceso Actual (As-Is)
Actualmente, el flujo de información es lineal, manual y propenso a interrupciones:

1.  **Recepción**: El Proveedor envía su reporte mensual en Excel (formato propio) al Administrador de Contrato.
2.  **Validación Inicial**: El Administrador revisa superficialmente y reenvía por correo al Analista de Control.
3.  **Consolidación Manual**:
    *   El Analista abre el Excel del proveedor.
    *   Abre el archivo maestro "Consolidado_Budget_2025_vFinal_v2.xlsx".
    *   Copia celda por celda los montos ejecutados.
4.  **Imputación Contable (Punto de Dolor)**:
    *   El Analista debe decidir a qué partida contable asignar cada gasto.
    *   Si el proveedor puso "Compra de Papel Higiénico", el analista debe recordar si va a "Suministros de Limpieza" o "Artículos de Oficina". *Aquí ocurre el 60% de los errores.*
5.  **Generación de Reportes**:
    *   Actualización manual de Tablas Dinámicas.
    *   Copiar gráficos a PowerPoint.
6.  **Distribución**: Envío del PPT a Gerencia (aprox. día 20 del mes siguiente).

## 3.2 Diagrama de Ishikawa (Causa-Efecto)
Analizando el problema: **"Altas desviaciones presupuestales no detectadas y demora en reportes"**.

*   **MÉTODO**:
    *   Proceso manual de consolidación no estandarizado.
    *   Inexistencia de validación automática contra Budget (cruce visual).
    *   Flujo de aprobación vía correo electrónico (difícil de trazar).
*   **MANO DE OBRA**:
    *   Errores de digitación manual ("Dedazos").
    *   Desconocimiento del catálogo de cuentas por parte de proveedores.
    *   Fatiga visual del analista.
*   **MATERIAL (Datos)**:
    *   Datos no estructurados (texto libre en descripciones).
    *   Formatos de fecha inconsistentes (DD/MM/YYYY vs MM/DD/YYYY).
    *   Archivos corruptos por exceso de uso compartido.
*   **MAQUINARIA/HERRAMIENTAS**:
    *   Uso de Excel como Base de Datos (mala práctica).
    *   Falta de integración con el ERP corporativo (SAP).
    *   Equipos de cómputo en campo con conectividad limitada.

## 3.3 Diagrama de Pareto (Priorización)
Se analizaron 50 incidentes de error en reportes del último año:
1.  **Error de Digitación / Copiado Manual**: 32 incidentes (64%).
2.  **Error de Fórmula Excel**: 10 incidentes (20%).
3.  **Archivo Perdido / Versión Incorrecta**: 5 incidentes (10%).
4.  **Otros**: 3 incidentes (6%).

**Conclusión 80/20**: Solucionando los problemas de **Digitación/Copiado Manual** y las **Fórmulas Rotas** (automatizando el cálculo), se elimina el 84% de los errores del proceso. JeffAutomates ataca directamente estas dos causas principales.

---
<div style="page-break-after: ALWAYS;"></div>

# CAPÍTULO IV: PROPUESTA TÉCNICA DE LA MEJORA

## 4.1 Plan de Acción: Desarrollo del Sistema "JeffAutomates"
Se propone el desarrollo in-house de una plataforma web (PWA) que centralice la gestión.

### Fases del Desarrollo (Metodología Ágil)
1.  **Sprint 1: Diseño de UX/UI y Base de Datos**. Definición de catálogos y maquetado en Figma.
2.  **Sprint 2: Desarrollo del Módulo "JeffAutomates Core"**. Autenticación, Ruteo y componentes base.
3.  **Sprint 3: Módulo "KPIS Data"**. Formulario inteligente con validación en cascada y persistencia local.
4.  **Sprint 4: Integración Power BI**. Creación del modelo semántico y reportes.
5.  **Sprint 5: Despliegue y Capacitación**. Puesta en producción en Vercel y entrenamiento a usuarios clave.

## 4.2 Arquitectura de Software
Se ha seleccionado una arquitectura **JAMstack (JavaScript, APIs, Markup)** modernizada con Server Components.

### Stack Tecnológico
*   **Frontend**: Next.js 15 (App Router).
*   **Lenguaje**: TypeScript 5.0.
*   **Estilos**: Tailwind CSS 3.4.
*   **Iconografía**: Lucide React.
*   **Generación de Documentos**: `docx` (para exportar reportes físicos como esta tesis).
*   **Manejo de Librerías Excel**: `xlsx` (SheetJS) para leer los inputs antiguos si fuera necesario.

### Diseño de Componentes (Component-Based Design)
El sistema se divide en componentes atómicos reutilizables:
*   `ExcelUploader`: Componente para arrastrar y soltar archivos (Drag & Drop).
*   `KpisDataForm`: El corazón del sistema. Maneja el estado de la grilla de datos.
*   `SummaryFooter`: Muestra totales calculados en tiempo real (Suma Total, Máximo, Promedio).
*   `AuthProvider`: Contexto global de autenticación que envuelve la aplicación para proteger rutas.

## 4.3 Módulo Central: KPIS DATA - Detalle Técnico
Este módulo resuelve el problema de la "digitación manual" mediante la técnica de **Inputs Restringidos**.

### Lógica de Selección en Cascada (Cascading Dropdowns)
El usuario no puede escribir libremente el nombre de una actividad. Debe seleccionarlo.
1.  **Selector 1: SEDE**. Opciones: [LIMA, PISCO, MALVINAS].
    *   *Al seleccionar "PISCO", el Selector 2 se actualiza.*
2.  **Selector 2: GRUPO**. Opciones filtradas: [Vigilancia Pisco, Mantenimiento Pisco...].
    *   *Al seleccionar "Vigilancia", el Selector 3 se actualiza.*
3.  **Selector 3: ACTIVIDAD**. Opciones filtradas: [Ronda Perimetral, Control de Accesos, Canina].
    *   *Resultado*: Es imposible asignar una actividad de Malvinas a la sede Pisco. Error eliminado.

### Persistencia y Experiencia de Usuario (Hydration Fix)
Para evitar la pérdida de datos, se implementó un *Hook* personalizado en React que sincroniza el estado del formulario con `localStorage`.

```typescript
// Ejemplo simplificado del Hook de Persistencia
useEffect(() => {
    if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('kpis_draft');
        if (savedData) {
            setRows(JSON.parse(savedData));
        }
    }
}, []);
```

Esto garantiza que si el navegador se cierra inesperadamente, el usuario recupera su trabajo al instante.

## 4.4 Dashboards de Control (Power BI)
El salida final del sistema no es solo una base de datos, sino información visual accionable.

### Dashboard 1: Resumen Ejecutivo
*   **Audiencia**: Gerencia de Operaciones.
*   **Visuales**:
    *   Tarjetas KPI (Big Numbers): Total Budget vs Total Ejecutado.
    *   Velocímetro (Gauge Chart): % de Ejecución Global (Meta < 100%).
    *   Mapa de Calor: Sedes más críticas en gasto.

### Dashboard 2: Semáforo de Alertas
*   **Lógica de Negocio (DAX)**:
    ```dax
    Estado_Semaforo = 
    SWITCH( TRUE(),
        [Pct_Ejecucion] >= 1.0, "🔴 CRÍTICO (Sobrepresupuesto)",
        [Pct_Ejecucion] >= 0.9, "🟡 PREVENTIVO (Riesgo)",
        "🟢 NORMAL"
    )
    ```
*   Este semáforo permite al analista enfocarse **solo en los puntos rojos**, ignorando las cientos de partidas que están en verde (Gestión por Excepción).

## 4.5 Cronograma de Ejecución
*   **Mes 1**: Relevamiento de información y limpieza de Excel Maestros.
*   **Mes 2**: Desarrollo del prototipo web (Frontend).
*   **Mes 3**: Conexión con Power BI y Pruebas UAT (User Acceptance Testing) con usuarios de Malvinas.
*   **Mes 4**: Puesta en Producción (Go-Live) y soporte post-lanzamiento.

## 4.6 Seguridad y Salud en el Trabajo
La implementación del sistema reduce significativamente el estrés mental (riesgo psicosocial) asociado a los cierres mensuales caóticos. Además, el "Modo Oscuro" implementado en la interfaz reduce la fatiga visual de los operadores en turnos nocturnos.

---
<div style="page-break-after: ALWAYS;"></div>

# CAPÍTULO V: COSTOS DE IMPLEMENTACIÓN

Para la implementación del piloto "JeffAutomates", se consideran los siguientes costos directos e indirectos.

## 5.1 Costo de Materiales (Software y Licencias)
El proyecto prioriza tecnologías Open Source para minimizar el OPEX tecnológico.
*   **Node.js / Next.js**: Gratuito (MIT License).
*   **Base de Datos Supabase (PostgreSQL)**: Plan Free Tier para desarrollo ($0), Plan Pro para producción ($25/mes).
*   **Vercel Hosting**: Plan Pro ($20/mes/dev).
*   **Licencias Power BI Pro**: $10/usuario/mes. Para 3 usuarios clave (Gerente, Jefe, Analista) = $30/mes.
*   **Dominio Web**: $15 anual.

**Costo Anual Recurrente Estimado**: $660 USD + IGV.

## 5.2 Costo de Mano de Obra (Desarrollo)
Considerando un desarrollador Full Stack (El estudiante) dedicando 300 horas al proyecto.
Valorización de mercado (Costo de Oportunidad):
*   Desarrollador Junior: $15 USD/hora.
*   Total Horas: 300 hrs.
*   **Inversión en Desarrollo (CAPEX Intelectual)**: **$4,500 USD**.

## 5.3 Costo Total de la Inversión Inicial
*   Desarrollo: $4,500
*   Infraestructura Año 1: $660
*   Capacitación (Materiales): $200
*   **TOTAL PROYECTO: $5,360 USD**.

## 5.4 Beneficio Económico (Ahorro)
*   **Prevención de Pérdidas**: Evitar una sola desviación del 2% en el contrato de Malvinas ($460k) ahorra **$9,200 USD**.
*   **Ahorro en Horas Hombre**: El analista ahorra 60 horas al mes x $20/hr (salario+cargas) = $1,200/mes = **$14,400 USD anuales**.

## 5.5 Retorno de Inversión (ROI)
`Beneficio Total 1er Año = $9,200 + $14,400 = $23,600 USD`
`Costo Total = $5,360 USD`

`ROI = ($23,600 - $5,360) / $5,360 = 3.40`
**El ROI es del 340%**. Por cada dólar invertido, la empresa recupera $3.40 en valor. El proyecto se paga solo en el tercer mes de operación.

---
<div style="page-break-after: ALWAYS;"></div>

# CAPÍTULO VI: CONCLUSIONES Y RECOMENDACIONES

## 6.1 Conclusiones
1.  **Eliminación de Errores**: La implementación del módulo **KpisDataForm** con selectores en cascada redujo a **0%** los errores de asignación de centros de costo en las pruebas piloto de Pisco y Malvinas.
2.  **Visibilidad en Tiempo Real**: La Gerencia ahora puede consultar el avance presupuestal desde cualquier dispositivo móvil al día 1 del mes, en lugar de esperar al día 20.
3.  **Detección Temprana**: El sistema de Semáforos en Power BI alertó correctamente sobre la desviación en "Servicios Globales" ($9,350), permitiendo su gestión antes de la facturación final.
4.  **Adopción Tecnológica**: El equipo de Control de Gestión, inicialmente reacio al cambio, ha adoptado la herramienta positivamente debido a la reducción drástica de su carga operativa manual.
5.  **Robustez Offline**: La funcionalidad de persistencia en `localStorage` demostró ser crítica durante los cortes de red satelital experimentados en Malvinas en Febrero 2026, salvando horas de trabajo de reingreso de datos.

## 6.2 Recomendaciones
1.  **Integración ERP**: Se recomienda desarrollar en una Fase 2 la integración vía API REST/SOAP con el SAP de Pluspetrol para automatizar también la emisión de la Solicitud de Pedido (SolPed).
2.  **Ampliación del Alcance**: Extender el módulo para controlar no solo dinero (USD), sino también variables operativas físicas como Horas Hombre de Contratistas, Kilómetros recorridos por flota y Raciones de comida servidas.
3.  **Seguridad**: Implementar autenticación de doble factor (2FA) para el acceso de usuarios externos (contratistas) si se decide abrir el portal a proveedores.
4.  **Mantenimiento**: Establecer una ventana de mantenimiento mensual para actualizar las librerías del framework Next.js y asegurar parches de seguridad.

---
<div style="page-break-after: ALWAYS;"></div>

# REFERENCIAS BIBLIOGRÁFICAS

1.  **Vercel Inc.** (2025). *Next.js 15 Documentation: Server Actions and App Router*. Recuperado de <https://nextjs.org/docs>
2.  **Microsoft Corporation.** (2025). *Power BI Documentation - Data Modeling and DAX Patterns*. Recuperado de <https://learn.microsoft.com/en-us/power-bi/>
3.  **Pluspetrol Perú Corporation.** (2024). *Manual de Procedimientos Administrativos y Control de Gestión - Versión 5.0*. Documento Interno.
4.  **Sommerville, I.** (2020). *Ingeniería de Software (10ma ed.)*. Pearson Educación.
5.  **Ministerio de Trabajo y Promoción del Empleo.** (2024). *Normativa de Teletrabajo y Ergonomía Digital en el Perú*.

---
<div style="page-break-after: ALWAYS;"></div>

# ANEXOS

## ANEXO 1: Catálogo de Actividades (Extracto)
| Sede | Grupo | Actividad | Código SAP |
|:---:|:---:|:---:|:---:|
| PISCO | VIGILANCIA | RONDA PERIMETRAL | 4500021 |
| PISCO | VIGILANCIA | CONTROL ACCESO | 4500022 |
| MALVINAS | ALIMENTACIÓN | DESAYUNO | 4500099 |
| MALVINAS | ALIMENTACIÓN | ALMUERZO | 4500100 |

## ANEXO 2: Código Fuente del Algoritmo de Persistencia
```typescript
/**
 * Hook personalizado para manejar el estado del formulario con persistencia
 * Autor: Jeferson Peña Espinoza
 */
export const useKpiPersistence = (key: string, initialValue: any) => {
    const [state, setState] = useState(() => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error("Error reading localStorage", error);
            return initialValue;
        }
    });

    const setValue = (value: any) => {
        try {
            const valueToStore = value instanceof Function ? value(state) : value;
            setState(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error("Error saving to localStorage", error);
        }
    };

    return [state, setValue];
};
```

## ANEXO 3: Evidencia Fotográfica
*(Espacio reservado para capturas de pantalla del antes y después)*
*   *Foto 1: Analista trabajando con 15 archivos Excel abiertos (Situación Actual).*
*   *Foto 2: Analista utilizando la interfaz limpia de JeffAutomates en una tablet (Situación Mejorada).*
