import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  buildDashboardStats,
  buildSummaryChartData,
  type DashboardInterval,
  type DashboardSubmission,
} from "@/lib/dashboard-chart-utils";

type PdfDocument = InstanceType<typeof jsPDF>;

type PdfWithAutoTable = PdfDocument & {
  lastAutoTable?: {
    finalY?: number;
  };
};

type RgbColor = [number, number, number];

type ReportBranding = {
  companyName: string;
  reportTitle: string;
  reportSubtitle: string;
  coverTitle: string;
  coverSubtitle: string;
  footerText: string;
  primaryColor: RgbColor;
  accentColor: RgbColor;
  darkColor: RgbColor;
  mutedColor: RgbColor;
  lightBorderColor: RgbColor;
  lightBackgroundColor: RgbColor;
  whiteColor: RgbColor;
  showCoverPage: boolean;
  leftLogoUrl: string | null;
  rightLogoUrl: string | null;
};

type GenerateDashboardPdfReportParams = {
  fileName?: string;
  title: string;
  interval: DashboardInterval;
  activeFilters: string[];
  submissions: DashboardSubmission[];
  generatedAt?: Date;
  generatedByName?: string;
  generatedByEmail?: string;
  showCoverPage?: boolean;
  branding?: Partial<ReportBranding>;
};

/**
 * CONFIGURACIÓN PRINCIPAL DEL REPORTE
 *
 * PERSONALIZA AQUÍ:
 * - companyName: nombre oficial de tu empresa
 * - reportTitle: título principal del reporte
 * - reportSubtitle: subtítulo institucional
 * - coverTitle / coverSubtitle: textos de la portada
 * - footerText: texto del pie de página
 * - colores corporativos
 * - leftLogoUrl / rightLogoUrl: logos oficiales
 *
 * LOGOS:
 * Coloca tus logos dentro de /public, por ejemplo:
 * /public/branding/logo-coresa.png
 * /public/branding/logo-cliente.png
 *
 * Luego cambia:
 * leftLogoUrl: "/branding/logo-coresa.png"
 * rightLogoUrl: "/branding/logo-cliente.png"
 *
 * Si aún no tienes los logos, déjalos en null.
 */
const DEFAULT_BRANDING: ReportBranding = {
  companyName: "CORESA IT",
  reportTitle: "Reporte Ejecutivo del Dashboard",
  reportSubtitle: "Resumen de actividad y comportamiento de repositorios",
  coverTitle: "Reporte Ejecutivo",
  coverSubtitle:
    "Documento generado a partir de los filtros activos del dashboard",
  footerText: "CORESA IT · Reporte Ejecutivo del Dashboard",

  /**
   * COLORES PERSONALIZABLES
   *
   * primaryColor: color principal para títulos/encabezados
   * accentColor: color de acento corporativo
   * darkColor: color de texto fuerte
   * mutedColor: color de texto secundario
   * lightBorderColor: bordes suaves
   * lightBackgroundColor: fondos suaves de cajas y tablas
   * whiteColor: blanco
   */
  primaryColor: [17, 24, 39],
  accentColor: [56, 212, 48],
  darkColor: [17, 24, 39],
  mutedColor: [107, 114, 128],
  lightBorderColor: [209, 213, 219],
  lightBackgroundColor: [249, 250, 251],
  whiteColor: [255, 255, 255],

  /**
   * PORTADA POR DEFECTO
   * Esto se puede sobrescribir desde el modal del dashboard.
   */
  showCoverPage: true,

  /**
   * RUTAS DE LOGOS
   * Reemplázalas por tus logos reales cuando los tengas listos.
   */
  leftLogoUrl: null,
  rightLogoUrl: null,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function getIntervalLabelInSpanish(interval: DashboardInterval) {
  switch (interval) {
    case "day":
      return "Diario";
    case "week":
      return "Semanal";
    case "month":
      return "Mensual";
    case "year":
      return "Anual";
    default:
      return "Mensual";
  }
}

function getIntervalDescriptionInSpanish(interval: DashboardInterval) {
  switch (interval) {
    case "day":
      return "Agrupación diaria";
    case "week":
      return "Agrupación semanal";
    case "month":
      return "Agrupación mensual";
    case "year":
      return "Agrupación anual";
    default:
      return "Agrupación mensual";
  }
}

function buildVendorSummary(submissions: DashboardSubmission[]) {
  const vendorMap = new Map<string, number>();

  for (const submission of submissions) {
    vendorMap.set(
      submission.vendorName,
      (vendorMap.get(submission.vendorName) ?? 0) + 1,
    );
  }

  return Array.from(vendorMap.entries())
    .map(([vendor, total]) => ({ vendor, total }))
    .sort((a, b) => b.total - a.total || a.vendor.localeCompare(b.vendor));
}

function drawStatCard(
  pdf: PdfDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string | number,
  branding: ReportBranding,
) {
  pdf.setDrawColor(...branding.lightBorderColor);
  pdf.setFillColor(...branding.whiteColor);
  pdf.roundedRect(x, y, width, height, 4, 4, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...branding.mutedColor);
  pdf.text(label.toUpperCase(), x + 4, y + 7);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(...branding.darkColor);
  pdf.text(String(value), x + 4, y + 17);
}

function getLastAutoTableFinalY(pdf: PdfDocument, fallback: number) {
  const typedPdf = pdf as PdfWithAutoTable;
  return typedPdf.lastAutoTable?.finalY
    ? typedPdf.lastAutoTable.finalY + 10
    : fallback;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("No fue posible convertir la imagen a Data URL."));
    };

    reader.onerror = () => {
      reject(new Error("No fue posible leer la imagen."));
    };

    reader.readAsDataURL(blob);
  });
}

async function loadImageAsDataUrl(imageUrl: string | null) {
  if (!imageUrl) return null;

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}

function drawHeaderLogos(
  pdf: PdfDocument,
  branding: ReportBranding,
  leftLogoDataUrl: string | null,
  rightLogoDataUrl: string | null,
  pageWidth: number,
) {
  /**
   * PERSONALIZA EL TAMAÑO DE LOS LOGOS AQUÍ
   * Si tus logos tienen otra proporción, ajusta width/height.
   */
  const logoWidth = 24;
  const logoHeight = 24;
  const logoTop = 8;

  if (leftLogoDataUrl) {
    pdf.addImage(leftLogoDataUrl, "PNG", 12, logoTop, logoWidth, logoHeight);
  }

  if (rightLogoDataUrl) {
    pdf.addImage(
      rightLogoDataUrl,
      "PNG",
      pageWidth - 12 - logoWidth,
      logoTop,
      logoWidth,
      logoHeight,
    );
  }

  /**
   * Si aún no tienes logos, se mostrará el nombre de la empresa
   * como respaldo en la parte superior derecha.
   */
  if (!leftLogoDataUrl && !rightLogoDataUrl) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...branding.darkColor);
    pdf.text(branding.companyName, pageWidth - 12, 14, { align: "right" });
  }
}

function drawInfoBox(
  pdf: PdfDocument,
  x: number,
  y: number,
  width: number,
  title: string,
  lines: string[],
  branding: ReportBranding,
) {
  const lineHeight = 6;
  const boxHeight = 12 + lines.length * lineHeight + 6;

  pdf.setDrawColor(...branding.lightBorderColor);
  pdf.setFillColor(...branding.lightBackgroundColor);
  pdf.roundedRect(x, y, width, boxHeight, 4, 4, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...branding.darkColor);
  pdf.text(title, x + 4, y + 8);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(...branding.mutedColor);

  let currentY = y + 15;
  for (const line of lines) {
    pdf.text(line, x + 4, currentY);
    currentY += lineHeight;
  }
}

function drawPageHeader(
  pdf: PdfDocument,
  branding: ReportBranding,
  pageWidth: number,
  title: string,
  subtitle: string,
  leftLogoDataUrl: string | null,
  rightLogoDataUrl: string | null,
) {
  /**
   * BANDA SUPERIOR DELGADA
   * No se usa fondo oscuro en la página, solo una línea/banda elegante.
   */
  pdf.setFillColor(...branding.accentColor);
  pdf.rect(0, 0, pageWidth, 5, "F");

  drawHeaderLogos(
    pdf,
    branding,
    leftLogoDataUrl,
    rightLogoDataUrl,
    pageWidth,
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(...branding.darkColor);
  pdf.text(title, 12, 18);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(...branding.mutedColor);
  pdf.text(subtitle, 12, 24);

  pdf.setDrawColor(...branding.lightBorderColor);
  pdf.setLineWidth(0.8);
  pdf.line(12, 30, pageWidth - 12, 30);
}

function drawCoverPage(
  pdf: PdfDocument,
  branding: ReportBranding,
  generatedAt: Date,
  generatedByName: string,
  generatedByEmail: string,
  intervalLabel: string,
  activeFilters: string[],
  leftLogoDataUrl: string | null,
  rightLogoDataUrl: string | null,
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;

  /**
   * PORTADA LIMPIA, SIN FONDO AZUL
   */
  pdf.setFillColor(...branding.accentColor);
  pdf.rect(0, 0, pageWidth, 7, "F");

  drawHeaderLogos(
    pdf,
    branding,
    leftLogoDataUrl,
    rightLogoDataUrl,
    pageWidth,
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.setTextColor(...branding.darkColor);
  pdf.text(branding.coverTitle, margin, 55);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(...branding.mutedColor);
  const subtitleLines = pdf.splitTextToSize(
    branding.coverSubtitle,
    pageWidth - margin * 2,
  );
  pdf.text(subtitleLines, margin, 66);

  pdf.setDrawColor(...branding.accentColor);
  pdf.setLineWidth(1.2);
  pdf.line(margin, 82, pageWidth - margin, 82);

  drawInfoBox(
    pdf,
    margin,
    95,
    pageWidth - margin * 2,
    "Información del reporte",
    [
      `Empresa: ${branding.companyName}`,
      `Generado por: ${generatedByName}`,
      `Correo del usuario: ${generatedByEmail}`,
      `Fecha de generación: ${formatDateTime(generatedAt)}`,
      `Intervalo seleccionado: ${intervalLabel}`,
    ],
    branding,
  );

  const filtersText =
    activeFilters.length === 0
      ? ["Sin filtros adicionales activos."]
      : pdf.splitTextToSize(
          activeFilters.join("  |  "),
          pageWidth - margin * 2 - 8,
        );

  drawInfoBox(
    pdf,
    margin,
    150,
    pageWidth - margin * 2,
    "Filtros activos",
    Array.isArray(filtersText) ? filtersText : [filtersText],
    branding,
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(...branding.mutedColor);
  pdf.text(
    "Documento interno de seguimiento y análisis.",
    margin,
    pageHeight - 18,
  );
}

export async function generateDashboardPdfReport({
  fileName = "reporte-dashboard.pdf",
  title,
  interval,
  activeFilters,
  submissions,
  generatedAt = new Date(),
  generatedByName = "Usuario no identificado",
  generatedByEmail = "correo-no-disponible",
  showCoverPage,
  branding,
}: GenerateDashboardPdfReportParams): Promise<void> {
  const mergedBranding: ReportBranding = {
    ...DEFAULT_BRANDING,
    ...branding,
  };

  const finalShowCoverPage = showCoverPage ?? mergedBranding.showCoverPage;

  const pdf = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  const stats = buildDashboardStats(submissions);
  const summaryByPeriod = buildSummaryChartData(submissions, interval);
  const vendorSummary = buildVendorSummary(submissions);
  const intervalLabel = getIntervalLabelInSpanish(interval);
  const intervalDescription = getIntervalDescriptionInSpanish(interval);

  /**
   * CARGA DE LOGOS
   * Si configuras rutas reales dentro de /public, aquí se cargarán.
   */
  const [leftLogoDataUrl, rightLogoDataUrl] = await Promise.all([
    loadImageAsDataUrl(mergedBranding.leftLogoUrl),
    loadImageAsDataUrl(mergedBranding.rightLogoUrl),
  ]);

  if (finalShowCoverPage) {
    drawCoverPage(
      pdf,
      mergedBranding,
      generatedAt,
      generatedByName,
      generatedByEmail,
      intervalLabel,
      activeFilters,
      leftLogoDataUrl,
      rightLogoDataUrl,
    );

    pdf.addPage();
  }

  drawPageHeader(
    pdf,
    mergedBranding,
    pageWidth,
    mergedBranding.reportTitle,
    `${mergedBranding.companyName} · ${mergedBranding.reportSubtitle}`,
    leftLogoDataUrl,
    rightLogoDataUrl,
  );

  let currentY = 42;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(...mergedBranding.darkColor);
  pdf.text(title, margin, currentY);

  currentY += 7;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(75, 85, 99);
  pdf.text(`Generado: ${formatDateTime(generatedAt)}`, margin, currentY);
  pdf.text(
    `Intervalo seleccionado: ${intervalLabel}`,
    pageWidth - margin,
    currentY,
    { align: "right" },
  );

  currentY += 5;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...mergedBranding.mutedColor);
  pdf.text(intervalDescription, pageWidth - margin, currentY, {
    align: "right",
  });

  currentY += 10;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...mergedBranding.darkColor);
  pdf.text("Filtros aplicados", margin, currentY);

  currentY += 5;

  if (activeFilters.length === 0) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(...mergedBranding.mutedColor);
    pdf.text("Sin filtros adicionales activos.", margin, currentY);
    currentY += 10;
  } else {
    const filterLines = pdf.splitTextToSize(
      activeFilters.join("  |  "),
      contentWidth,
    );
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81);
    pdf.text(filterLines, margin, currentY);
    currentY += filterLines.length * 5 + 4;
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...mergedBranding.darkColor);
  pdf.text("Indicadores principales", margin, currentY);

  currentY += 5;

  const cardGap = 4;
  const cardWidth = (contentWidth - cardGap) / 2;
  const cardHeight = 22;

  drawStatCard(
    pdf,
    margin,
    currentY,
    cardWidth,
    cardHeight,
    "Total de repositorios",
    stats.totalRepositories,
    mergedBranding,
  );

  drawStatCard(
    pdf,
    margin + cardWidth + cardGap,
    currentY,
    cardWidth,
    cardHeight,
    "Repositorios este mes",
    stats.repositoriesThisMonth,
    mergedBranding,
  );

  currentY += cardHeight + 4;

  drawStatCard(
    pdf,
    margin,
    currentY,
    cardWidth,
    cardHeight,
    "Vendedor líder",
    stats.topVendor,
    mergedBranding,
  );

  drawStatCard(
    pdf,
    margin + cardWidth + cardGap,
    currentY,
    cardWidth,
    cardHeight,
    "Cliente principal",
    stats.topClient,
    mergedBranding,
  );

  currentY += cardHeight + 10;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...mergedBranding.darkColor);
  pdf.text("Resumen por vendedor", margin, currentY);

  currentY += 3;

  autoTable(pdf, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Vendedor", "Repositorios"]],
    body:
      vendorSummary.length > 0
        ? vendorSummary.map((item) => [item.vendor, String(item.total)])
        : [["Sin datos", "0"]],
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      textColor: [17, 24, 39],
      lineColor: mergedBranding.lightBorderColor,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: mergedBranding.accentColor,
      textColor: mergedBranding.whiteColor,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: mergedBranding.lightBackgroundColor,
    },
  });

  currentY = getLastAutoTableFinalY(pdf, currentY + 30);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...mergedBranding.darkColor);
  pdf.text("Resumen por período", margin, currentY);

  currentY += 3;

  autoTable(pdf, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Período", "Total"]],
    body:
      summaryByPeriod.length > 0
        ? summaryByPeriod.map((item) => [item.period, String(item.total)])
        : [["Sin datos", "0"]],
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      textColor: [17, 24, 39],
      lineColor: mergedBranding.lightBorderColor,
      lineWidth: 0.2,
    },
    headStyles: {
      /**
       * AQUÍ QUITAMOS EL AZUL:
       * Ahora esta tabla usa el color principal institucional.
       * Si deseas otro color, cámbialo aquí.
       */
      fillColor: mergedBranding.primaryColor,
      textColor: mergedBranding.whiteColor,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: mergedBranding.lightBackgroundColor,
    },
  });

  currentY = getLastAutoTableFinalY(pdf, currentY + 30);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...mergedBranding.darkColor);
  pdf.text("Repositorios incluidos en el reporte", margin, currentY);

  currentY += 3;

  autoTable(pdf, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["ID", "Repositorio", "Vendedor", "Cliente", "Empresa", "Fecha"]],
    body:
      submissions.length > 0
        ? submissions.map((item) => [
            `#${item.submitId}`,
            item.submitName,
            item.vendorName,
            item.clientName,
            item.companyName,
            formatDate(item.createdAt),
          ])
        : [["-", "Sin datos", "-", "-", "-", "-"]],
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [17, 24, 39],
      lineColor: mergedBranding.lightBorderColor,
      lineWidth: 0.2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: mergedBranding.primaryColor,
      textColor: mergedBranding.whiteColor,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: mergedBranding.lightBackgroundColor,
    },
  });

  const totalPages = pdf.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);

    pdf.setDrawColor(...mergedBranding.lightBorderColor);
    pdf.line(margin, 288, pageWidth - margin, 288);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...mergedBranding.mutedColor);
    pdf.text(mergedBranding.footerText, margin, 293);
    pdf.text(`Página ${page} de ${totalPages}`, pageWidth - margin, 293, {
      align: "right",
    });
  }

  pdf.save(fileName);
}