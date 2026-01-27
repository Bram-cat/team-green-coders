import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { SolarRecommendation, RoofAnalysisResult, SolarPotentialResult } from '@/types/analysis'

interface PDFExportOptions {
  recommendation: SolarRecommendation
  roofAnalysis: RoofAnalysisResult
  solarPotential: SolarPotentialResult
  address?: string
  analysisType: 'plan' | 'improve'
}

export async function exportToPDF(options: PDFExportOptions): Promise<void> {
  const { recommendation, roofAnalysis, solarPotential, address, analysisType } = options

  // Create PDF document (A4 size)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Set default font
  pdf.setFont('helvetica', 'normal')

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = 0

  // Colors
  const colors = {
    primary: [4, 120, 87] as [number, number, number], // Emerald 700
    accent: [59, 130, 246] as [number, number, number], // Blue 500
    text: [31, 41, 55] as [number, number, number], // Gray 800
    muted: [107, 114, 128] as [number, number, number], // Gray 500
    light: [243, 244, 246] as [number, number, number], // Gray 100
    white: [255, 255, 255] as [number, number, number]
  }

  // ============ PAGE 1: COVER PAGE ============

  // Background Pattern / Style
  pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
  pdf.rect(0, 0, pageWidth, 120, 'F')

  // Title
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(42)
  pdf.setFont('helvetica', 'bold')
  pdf.text('SolarPEI', margin, 50)

  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Professional Solar Analysis Report', margin, 65)

  // Report Type Badge
  pdf.setFillColor(255, 255, 255, 0.2)
  pdf.roundedRect(margin, 75, 80, 10, 2, 2, 'F')
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  const reportType = analysisType === 'plan' ? 'NEW INSTALLATION STRATEGY' : 'SYSTEM OPTIMIZATION AUDIT'
  pdf.text(reportType, margin + 5, 81.5)

  // Address if available
  if (address) {
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Target Location:', margin, 140)
    pdf.setFont('helvetica', 'normal')
    const splitAddress = pdf.splitTextToSize(address, pageWidth - (margin * 2))
    pdf.text(splitAddress, margin, 150)
  }

  // Date
  pdf.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
  pdf.setFontSize(10)
  pdf.text(`ISSUED ON: ${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}`, margin, pageHeight - margin)

  // Branding
  pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
  pdf.setFont('helvetica', 'bold')
  pdf.text('SOLARPEI.CA', pageWidth - margin - 30, pageHeight - margin)

  // ============ PAGE 2: EXECUTIVE SUMMARY ============
  pdf.addPage()
  yPosition = margin

  // Section Header
  pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2])
  pdf.rect(0, 0, pageWidth, 40, 'F')
  pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Executive Summary', margin, 25)

  yPosition = 55

  // Suitability Box
  pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
  pdf.roundedRect(margin, yPosition, 50, 40, 4, 4, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(10)
  pdf.text('SUITABILITY', margin + 5, yPosition + 10)
  pdf.setFontSize(32)
  pdf.text(`${recommendation.suitabilityScore}%`, margin + 5, yPosition + 28)

  // Explanation text
  pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  const explanationLines = pdf.splitTextToSize(recommendation.explanation, pageWidth - margin - 80)
  pdf.text(explanationLines, margin + 60, yPosition + 5)

  yPosition += 50

  // System Highlights Grid
  const highlights = [
    { label: 'System Capacity', value: `${recommendation.systemSizeKW} kW` },
    { label: 'Calculated Yield', value: `${recommendation.estimatedAnnualProductionKWh.toLocaleString()} kWh/yr` },
    { label: 'Array Composition', value: `${recommendation.panelCount} Solar Modules` },
    { label: 'Physical Footprint', value: `${roofAnalysis.roofAreaSqMeters} m²` }
  ]

  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Core Specifications', margin, yPosition)
  yPosition += 10

  highlights.forEach((item, i) => {
    const x = margin + (i % 2) * (pageWidth / 2 - margin)
    const y = yPosition + Math.floor(i / 2) * 20

    pdf.setFillColor(249, 250, 251)
    pdf.roundedRect(x, y, (pageWidth / 2) - margin - 5, 15, 2, 2, 'F')

    pdf.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
    pdf.setFontSize(8)
    pdf.text(item.label.toUpperCase(), x + 5, y + 6)

    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text(item.value, x + 5, y + 12)
  })

  yPosition += 50

  // ============ FINANCIAL ASSESSMENT ============
  if (recommendation.financials) {
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
    pdf.text('Economic Projections', margin, yPosition)
    yPosition += 10

    const financialsArr = [
      { label: 'Estimated Capital Investment', value: `$${recommendation.financials.estimatedSystemCost.toLocaleString()}` },
      { label: 'Monthly Energy Offset', value: `$${recommendation.financials.monthlyAverageSavings.toFixed(0)}` },
      { label: 'Annual Electricity Savings', value: `$${recommendation.financials.annualElectricitySavings.toFixed(0)}` },
      { label: 'Estimated Payback Period', value: `${recommendation.financials.simplePaybackYears.toFixed(1)} Years` },
      { label: '25-Year Cumulative Savings', value: `$${recommendation.financials.twentyFiveYearSavings.toLocaleString()}` }
    ]

    financialsArr.forEach((item, i) => {
      pdf.setFillColor(i % 2 === 0 ? 255 : 248, 255, 255)
      pdf.rect(margin, yPosition, pageWidth - (margin * 2), 10, 'F')

      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(item.label, margin + 5, yPosition + 6.5)

      pdf.setFont('helvetica', 'bold')
      pdf.text(item.value, pageWidth - margin - 5, yPosition + 6.5, { align: 'right' })

      yPosition += 10
    })

    yPosition += 10
  }

  // ============ PAGE 3: TECHNICAL ROADMAP ============
  pdf.addPage()
  yPosition = margin

  pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Implementation Roadmap', margin, yPosition)
  yPosition += 15

  if (recommendation.suggestions && recommendation.suggestions.length > 0) {
    recommendation.suggestions.forEach((suggestion, i) => {
      // Check for space
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = margin
      }

      pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
      pdf.circle(margin + 3, yPosition - 1, 3, 'F')

      pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2])
      pdf.setFontSize(8)
      pdf.text((i + 1).toString(), margin + 2.2, yPosition - 0.2)

      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const lines = pdf.splitTextToSize(suggestion, pageWidth - margin - 20)
      pdf.text(lines, margin + 10, yPosition)

      yPosition += (lines.length * 5) + 8
    })
  }

  yPosition += 10

  // Technical Metadata
  pdf.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Site Metadata', margin, yPosition)
  yPosition += 10

  const metadata = [
    { k: 'Roof Pitch:', v: `${roofAnalysis.roofPitchDegrees}°` },
    { k: 'Orientation:', v: roofAnalysis.roofOrientation || 'Optimal South' },
    { k: 'Solar Irradiance:', v: `${solarPotential.peakSunHoursPerDay} Peak Sun Hrs/Day` },
    { k: 'Shading Analysis:', v: roofAnalysis.shadingLevel.toUpperCase() }
  ]

  metadata.forEach(item => {
    pdf.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text(item.k, margin, yPosition)
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    pdf.setFont('helvetica', 'bold')
    pdf.text(item.v, margin + 40, yPosition)
    yPosition += 7
  })

  // ============ FOOTERS ON ALL PAGES ============
  const totalPages = (pdf as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
    pdf.rect(0, pageHeight - 5, pageWidth, 5, 'F')

    pdf.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`SolarPEI Report | Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
  }

  // Save PDF
  const fileName = `SolarPEI_${analysisType === 'plan' ? 'Plan' : 'Audit'}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}

/**
 * Capture entire results page as images and add to PDF
 */
export async function exportResultsPageToPDF(
  elementId: string,
  fileName: string = 'SolarPEI_Complex_Report.pdf'
): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`)
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  } as any)

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * pageWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(fileName)
}
