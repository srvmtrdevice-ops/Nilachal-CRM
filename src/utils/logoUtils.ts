import jsPDF from "jspdf";

/**
 * Nilachal Creatives Brand Colors
 */
export const BRAND_COLORS = {
  gold: "#f5bd1f",
  darkStone: "#1c1917",
  amberAccent: "#f59e0b",
  amberLight: "#fef3c7"
};

/**
 * Draws the Nilachal Creatives Circular Logo directly on a jsPDF document using vector commands.
 * This guarantees instantaneous rendering without asynchronous image loading dependencies.
 */
export function drawPdfLogo(doc: jsPDF, x: number, y: number, size: number = 24) {
  const radius = size / 2;
  const cx = x + radius;
  const cy = y + radius;

  // Save graphics state if supported
  doc.saveGraphicsState?.();

  // 1. Outer dark stroke ring
  doc.setDrawColor(28, 25, 23); // #1c1917
  doc.setLineWidth(size * 0.05);
  doc.circle(cx, cy, radius * 0.95, 'S');

  // 2. Inner filled yellow circle
  doc.setFillColor(245, 189, 31); // #f5bd1f
  doc.setDrawColor(245, 189, 31);
  doc.circle(cx, cy, radius * 0.82, 'FD');

  // 3. Brand Text: Nilachal
  doc.setTextColor(28, 25, 23);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size * 0.28);
  doc.text("Nilachal", cx, cy - radius * 0.1, { align: "center" });

  // 4. Brand Text: Creatives
  doc.setFontSize(size * 0.28);
  doc.text("Creatives", cx, cy + radius * 0.22, { align: "center" });

  // 5. Underline beneath Creatives
  doc.setDrawColor(28, 25, 23);
  doc.setLineWidth(size * 0.04);
  doc.line(cx - radius * 0.52, cy + radius * 0.38, cx + radius * 0.52, cy + radius * 0.32);

  // Restore state
  doc.restoreGraphicsState?.();
}

/**
 * Generates an SVG Data URL for the Nilachal Creatives Logo.
 */
export function getLogoSvgDataUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <circle cx="100" cy="100" r="92" fill="none" stroke="#1c1917" stroke-width="6" stroke-linecap="round" />
    <circle cx="100" cy="100" r="80" fill="#f5bd1f" />
    <g transform="rotate(-6 100 100)">
      <text x="100" y="86" font-family="'Space Grotesk', 'Arial Black', sans-serif" font-weight="900" font-size="28" text-anchor="middle" fill="#1c1917" letter-spacing="-1">Nilachal</text>
      <text x="100" y="116" font-family="'Space Grotesk', 'Arial Black', sans-serif" font-weight="900" font-size="28" text-anchor="middle" fill="#1c1917" letter-spacing="-1">Creatives</text>
      <line x1="42" y1="124" x2="158" y2="118" stroke="#1c1917" stroke-width="4" stroke-linecap="round" />
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
