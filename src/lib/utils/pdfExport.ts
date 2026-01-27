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

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  let yPosition = margin

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    pdf.setFontSize(fontSize)
    const lines = pdf.splitTextToSize(text, maxWidth)
    pdf.text(lines, x, y)
    return lines.length * (fontSize * 0.35) // Return height used
  }

  // ============ HEADER ============
  pdf.setFillColor(59, 130, 246) // Primary blue
  pdf.rect(0, 0, pageWidth, 40, 'F')

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.text('SolarPEI Analysis Report', margin, 20)

  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  pdf.text(analysisType === 'plan' ? 'New Installation Plan' : 'System Improvement Analysis', margin, 30)

  if (address) {
    pdf.setFontSize(10)
    pdf.text(`Property: ${address}`, margin, 36)
  }

  yPosition = 50

  // ============ REPORT DATE ============
  pdf.setTextColor(100, 100, 100)
  pdf.setFontSize(9)
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - margin, yPosition, { align: 'right' })
  yPosition += 10

  // ============ SUITABILITY SCORE ============
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Suitability Score', margin, yPosition)
  yPosition += 8

  pdf.setFillColor(240, 240, 240)
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F')

  const scoreColor: [number, number, number] = recommendation.suitabilityScore >= 80 ? [34, 197, 94] :
    recommendation.suitabilityScore >= 60 ? [251, 191, 36] : [239, 68, 68]
  pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
  pdf.setFontSize(32)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`${recommendation.suitabilityScore}%`, margin + 10, yPosition + 14)

  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  const explanationHeight = addWrappedText(
    recommendation.explanation,
    margin + 50,
    yPosition + 8,
    pageWidth - margin - 60
  )
  yPosition += Math.max(20, explanationHeight + 8) + 10

  // ============ SYSTEM OVERVIEW ============
  checkPageBreak(60)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('System Overview', margin, yPosition)
  yPosition += 10

  const specs = [
    { label: 'System Size', value: `${recommendation.systemSizeKW} kW` },
    { label: 'Panel Count', value: `${recommendation.panelCount} panels` },
    { label: 'Annual Production', value: `${recommendation.estimatedAnnualProductionKWh.toLocaleString()} kWh/year` },
    { label: 'Roof Area', value: `${roofAnalysis.roofAreaSqMeters} m²` },
    { label: 'Usable Area', value: `${roofAnalysis.usableAreaPercentage}%` },
    { label: 'Roof Pitch', value: `${roofAnalysis.roofPitchDegrees}°` },
    { label: 'Roof Orientation', value: roofAnalysis.roofOrientation || 'Not specified' },
    { label: 'Shading Level', value: roofAnalysis.shadingLevel.charAt(0).toUpperCase() + roofAnalysis.shadingLevel.slice(1) }
  ]

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')

  specs.forEach((spec, index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    const x = margin + col * ((pageWidth - 2 * margin) / 2)
    const y = yPosition + row * 12

    checkPageBreak(15)

    pdf.setTextColor(100, 100, 100)
    pdf.text(spec.label, x, y)
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'bold')
    pdf.text(spec.value, x + 45, y)
    pdf.setFont('helvetica', 'normal')
  })

  yPosition += Math.ceil(specs.length / 2) * 12 + 10

  // ============ FINANCIAL SUMMARY ============
  if (recommendation.financials) {
    checkPageBreak(80)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Financial Summary', margin, yPosition)
    yPosition += 10

    const netProfit = recommendation.financials.twentyFiveYearSavings - recommendation.financials.estimatedSystemCost

    const financials = [
      { label: 'Total System Cost', value: `$${recommendation.financials.estimatedSystemCost.toLocaleString()} CAD`, color: [239, 68, 68] },
      { label: 'Monthly Savings', value: `$${recommendation.financials.monthlyAverageSavings.toFixed(0)}`, color: [34, 197, 94] },
      { label: 'Annual Savings', value: `$${recommendation.financials.annualElectricitySavings.toFixed(0)}`, color: [34, 197, 94] },
      { label: 'Payback Period', value: `${recommendation.financials.simplePaybackYears.toFixed(1)} years`, color: [59, 130, 246] },
      { label: '25-Year Savings', value: `$${recommendation.financials.twentyFiveYearSavings.toLocaleString()}`, color: [34, 197, 94] },
      { label: 'Net Profit (25 years)', value: `$${netProfit.toLocaleString()}`, color: [34, 197, 94] }
    ]

    financials.forEach((item, index) => {
      checkPageBreak(12)
      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(item.label, margin, yPosition)

      pdf.setTextColor(item.color[0], item.color[1], item.color[2])
      pdf.setFont('helvetica', 'bold')
      pdf.text(item.value, pageWidth - margin, yPosition, { align: 'right' })

      yPosition += 10
    })

    yPosition += 5
  }

  // ============ RECOMMENDATIONS & SUGGESTIONS ============
  if (recommendation.suggestions && recommendation.suggestions.length > 0) {
    checkPageBreak(40)
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Recommendations', margin, yPosition)
    yPosition += 10

    recommendation.suggestions.forEach((suggestion, index) => {
      checkPageBreak(20)

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${index + 1}. ${suggestion}`, margin, yPosition)
      yPosition += 7
    })

    yPosition += 5
  }

  // ============ TECHNICAL DETAILS ============
  checkPageBreak(40)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Technical Details', margin, yPosition)
  yPosition += 10

  const technicalData = [
    { label: 'Peak Sun Hours/Day', value: `${solarPotential.peakSunHoursPerDay} hours` },
    { label: 'Yearly Solar Potential', value: `${solarPotential.yearlySolarPotentialKWh.toLocaleString()} kWh` },
    { label: 'Layout Suggestion', value: recommendation.layoutSuggestion }
  ]

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')

  technicalData.forEach(item => {
    checkPageBreak(15)
    pdf.setTextColor(100, 100, 100)
    pdf.text(item.label, margin, yPosition)
    pdf.setTextColor(0, 0, 0)
    const valueHeight = addWrappedText(item.value, margin + 60, yPosition, pageWidth - margin - 65)
    yPosition += Math.max(7, valueHeight)
  })

  // ============ FOOTER ============
  const totalPages = (pdf as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setTextColor(150, 150, 150)
    pdf.setFontSize(8)
    pdf.text(
      `SolarPEI Report - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    pdf.text(
      'Generated by SolarPEI - https://solarpei.ca',
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    )
  }

  // Save PDF
  const fileName = `SolarPEI_${analysisType === 'plan' ? 'Installation_Plan' : 'Improvement_Analysis'}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}

/**
 * Alternative: Capture entire results page as images and add to PDF
 * This is useful for including charts and visualizations
 */
export async function exportResultsPageToPDF(
  elementId: string,
  fileName: string = 'SolarPEI_Report.pdf'
): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`)
  }

  // Create canvas from HTML element
  const canvas = await html2canvas(element, {
    scale: 2, // Higher quality
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

  // Add first page
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  // Add additional pages if content is longer than one page
  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(fileName)
}
