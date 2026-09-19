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

  // ── Header Banner ────────────────────────────────────────────────────────
  doc.setFillColor(30, 27, 75); // Dark Indigo
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('RealEstateIQ', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(199, 210, 254);
  doc.text('AI-Powered Property Valuation Report', 14, 26);

  doc.setFontSize(8);
  doc.setTextColor(224, 231, 255);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 135, 18);
  doc.text(`Report ID: RIQ-${prediction._id ? prediction._id.slice(-8).toUpperCase() : Math.random().toString(36).substring(2, 10).toUpperCase()}`, 135, 26);

  // ── Key Valuation Card ───────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 38, 3, 3, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTIMATED MARKET VALUE', 20, 50);

  doc.setTextColor(79, 70, 229);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${Math.round(predictedPrice).toLocaleString()}`, 20, 60);

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(`Price per sqft: Rs. ${pricePerSqft ? Math.round(pricePerSqft).toLocaleString() : 'N/A'}`, 20, 68);

  // 95% Confidence Interval box
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(110, 47, 80, 28, 2, 2, 'F');

  doc.setTextColor(67, 56, 202);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('95% CONFIDENCE RANGE', 114, 54);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text(`Rs. ${lowRange.toLocaleString()} - Rs. ${highRange.toLocaleString()}`, 114, 62);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(99, 102, 241);
  doc.text(`Margin: ± Rs. ${margin.toLocaleString()}`, 114, 69);

  // ── Property Specifications Table ─────────────────────────────────────────
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Property Specifications', 14, 88);

  autoTable(doc, {
    startY: 92,
    head: [['Feature', 'Input Value', 'Impact on Valuation']],
    body: [
      ['Location (City)', inputFeatures.location, 'High (Location coefficient)'],
      ['Total Area', `${inputFeatures.area.toLocaleString()} sqft`, 'Primary Predictor (~70% importance)'],
      ['Bedrooms', `${inputFeatures.bedrooms} Bedrooms`, 'Moderate (~5.7% importance)'],
      ['Bathrooms', `${inputFeatures.bathrooms} Bathrooms`, 'Moderate (~7.2% importance)'],
      ['House Age', `${inputFeatures.house_age} Years`, 'Depreciation Factor (~4.8%)'],
      ['Parking Spaces', `${inputFeatures.parking} Spaces`, 'Minor (~1.7% importance)'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
  });

  // ── Feature Importance Table ──────────────────────────────────────────────
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 150;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Model Insights & Feature Importance', 14, finalY + 10);

  const importanceEntries = Object.entries(featureImportance || {}).sort(([, a], [, b]) => b - a);
  const importanceBody = importanceEntries.map(([feat, val]) => [
    feat.replace('location_', 'Location: ').replace('_', ' '),
    `${(val * 100).toFixed(2)}%`,
    val > 0.1 ? 'High Impact' : val > 0.03 ? 'Moderate Impact' : 'Low Impact',
  ]);

  autoTable(doc, {
    startY: finalY + 14,
    head: [['Feature / Factor', 'Relative Weight (%)', 'Impact Level']],
    body: importanceBody,
    theme: 'grid',
    headStyles: { fillColor: [55, 48, 163], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });

  // ── Model Details Box ─────────────────────────────────────────────────────
  const finalY2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 210;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, finalY2 + 8, 182, 22, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('MODEL METADATA', 18, finalY2 + 14);

  doc.setFont('helvetica', 'normal');
  doc.text(`Algorithm: ${algorithm || 'LinearRegression'}`, 18, finalY2 + 20);
  doc.text(`Model Version: ${modelVersion}`, 18, finalY2 + 26);
  doc.text(`R² Accuracy: 0.9965`, 90, finalY2 + 20);
  doc.text(`Mean Abs Error: Rs. 8,126.70`, 90, finalY2 + 26);
  doc.text(`Dataset: ${datasetVersion}`, 145, finalY2 + 20);
  doc.text(`Prediction Date: ${new Date(createdAt).toLocaleDateString()}`, 145, finalY2 + 26);

  // ── Footer / Disclaimer ───────────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const disclaimer =
    'DISCLAIMER: This automated valuation is generated using a Machine Learning model for demonstration and analytical purposes only. ' +
    'The model is trained on a synthetic Sri Lanka housing dataset. It does not constitute an appraisal or financial advice.';
  doc.text(doc.splitTextToSize(disclaimer, 182), 14, 280);

  // Save PDF
  const filename = `RealEstateIQ_Valuation_${inputFeatures.location}_${Math.round(predictedPrice)}.pdf`;
  doc.save(filename);
}
