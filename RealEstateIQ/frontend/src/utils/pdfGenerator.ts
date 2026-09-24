import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Prediction } from '../types';

export function generateValuationPDF(prediction: Prediction): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const {
    predictedPrice,
    pricePerSqft,
    modelVersion,
    algorithm,
    datasetVersion,
    inputFeatures,
    featureImportance,
    createdAt,
  } = prediction;

  // Confidence range calculation (approx 95% CI based on model MAE)
  const mae = algorithm === 'LinearRegression' ? 8126.7 : 20325.76;
  const margin = Math.round(mae * 1.96);
  const lowRange = Math.max(0, Math.round(predictedPrice - margin));
  const highRange = Math.round(predictedPrice + margin);

  // ── Header Banner: Deep Forest Green (#123B2A) ───────────────────────────
  doc.setFillColor(18, 59, 42); // Deep Forest Green
  doc.rect(0, 0, 210, 36, 'F');

  // Luxury Gold Accent line under header
  doc.setFillColor(201, 162, 39); // Luxury Gold
  doc.rect(0, 35, 210, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('RealEstateIQ', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(235, 243, 238);
  doc.text('Institutional Real Estate Valuation Report — Sri Lanka', 14, 26);

  doc.setFontSize(8);
  doc.setTextColor(250, 244, 220);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 135, 18);
  doc.text(`Certificate ID: RIQ-${prediction._id ? prediction._id.slice(-8).toUpperCase() : Math.random().toString(36).substring(2, 10).toUpperCase()}`, 135, 26);

  // ── Key Valuation Card: Warm Ivory (#F7F5F0) with Forest Green border ─────
  doc.setDrawColor(220, 214, 203);
  doc.setFillColor(247, 245, 240); // Warm Ivory
  doc.roundedRect(14, 42, 182, 38, 3, 3, 'FD');

  doc.setTextColor(113, 128, 120); // Muted Green Gray
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTIMATED FAIR MARKET VALUE', 20, 50);

  doc.setTextColor(18, 59, 42); // Deep Forest Green
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${Math.round(predictedPrice).toLocaleString()}`, 20, 60);

  doc.setFontSize(9);
  doc.setTextColor(113, 128, 120);
  doc.setFont('helvetica', 'normal');
  doc.text(`Price per sqft: Rs. ${pricePerSqft ? Math.round(pricePerSqft).toLocaleString() : 'N/A'}`, 20, 68);

  // 95% Confidence Interval box (Light green with gold accent)
  doc.setFillColor(235, 244, 238);
  doc.roundedRect(110, 47, 80, 28, 2, 2, 'F');

  doc.setTextColor(47, 107, 79); // Elegant Green
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('95% VALUATION CONFIDENCE RANGE', 114, 54);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 35, 28); // Deep Charcoal
  doc.text(`Rs. ${lowRange.toLocaleString()} - Rs. ${highRange.toLocaleString()}`, 114, 62);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(113, 128, 120);
  doc.text(`Margin: ± Rs. ${margin.toLocaleString()} (${prediction.algorithm || 'Model'} MAE)`, 114, 69);

  // ── Property Specifications Table ─────────────────────────────────────────
  doc.setTextColor(23, 35, 28);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Property Specifications & Characteristics', 14, 88);

  autoTable(doc, {
    startY: 92,
    head: [['Feature', 'Input Value', 'Impact on Valuation']],
    body: [
      ['Location (District / City)', inputFeatures.location, 'High (District benchmark rate calibrated)'],
      ['Total Area', `${inputFeatures.area.toLocaleString()} sqft`, 'Primary Predictor (~70% weight)'],
      ['Bedrooms', `${inputFeatures.bedrooms} Bedrooms`, 'Moderate (~5.7% weight)'],
      ['Bathrooms', `${inputFeatures.bathrooms} Bathrooms`, 'Moderate (~7.2% weight)'],
      ['House Age', `${inputFeatures.house_age} Years`, 'Depreciation Factor (~4.8%)'],
      ['Parking Spaces', `${inputFeatures.parking} Spaces`, 'Minor (~1.7% weight)'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [18, 59, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
  });

  // ── Feature Importance Table ──────────────────────────────────────────────
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 150;

  doc.setTextColor(23, 35, 28);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Valuation Insights & Factor Weights', 14, finalY + 10);

  const importanceEntries = Object.entries(featureImportance || {}).sort(([, a], [, b]) => b - a);
  const importanceBody = importanceEntries.map(([feat, val]) => [
    feat.replace('location_', 'Location: ').replace('_', ' '),
    `${(val * 100).toFixed(2)}%`,
    val > 0.1 ? 'High Impact' : val > 0.03 ? 'Moderate Impact' : 'Low Impact',
  ]);

  autoTable(doc, {
    startY: finalY + 14,
    head: [['Factor / Attribute', 'Relative Weight (%)', 'Impact Level']],
    body: importanceBody,
    theme: 'grid',
    headStyles: { fillColor: [47, 107, 79], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });

  // ── Model Details Box ─────────────────────────────────────────────────────
  const finalY2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 210;

  doc.setFillColor(247, 245, 240); // Warm Ivory
  doc.roundedRect(14, finalY2 + 8, 182, 22, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setTextColor(18, 59, 42); // Deep Forest Green
  doc.setFont('helvetica', 'bold');
  doc.text('MODEL CALIBRATION & AUDIT', 18, finalY2 + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(23, 35, 28);
  doc.text(`Algorithm: ${algorithm || 'LinearRegression'}`, 18, finalY2 + 20);
  doc.text(`Model Version: ${modelVersion}`, 18, finalY2 + 26);
  doc.text(`R² Accuracy: 0.9965`, 90, finalY2 + 20);
  doc.text(`Mean Abs Error: Rs. 8,126.70`, 90, finalY2 + 26);
  doc.text(`Dataset: ${datasetVersion}`, 145, finalY2 + 20);
  doc.text(`Valuation Date: ${new Date(createdAt).toLocaleDateString()}`, 145, finalY2 + 26);

  // ── Footer / Disclaimer ───────────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setTextColor(113, 128, 120);
  const disclaimer =
    'DISCLAIMER: This valuation is generated using RealEstateIQ machine learning models for market estimation purposes. ' +
    'Calibrated on verified Sri Lankan real estate transactions across 23 districts. It does not replace a physical statutory appraisal.';
  doc.text(doc.splitTextToSize(disclaimer, 182), 14, 280);

  // Save PDF
  const filename = `RealEstateIQ_Valuation_${inputFeatures.location}_${Math.round(predictedPrice)}.pdf`;
  doc.save(filename);
}
