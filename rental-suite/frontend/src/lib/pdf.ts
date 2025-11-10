import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function generateLeasePdf(lease: any): Promise<Blob> {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Residential Lease Agreement', 14, 18)
  doc.setFontSize(10)

  autoTable(doc, {
    startY: 24,
    head: [['Section', 'Details']],
    body: [
      ['Parties', `${lease.landlordName} (${lease.landlordContact}) ↔ ${lease.tenantName} (${lease.tenantContact})`],
      ['Property', `${lease.propertyAddress}${lease.unit ? ', Unit ' + lease.unit : ''}`],
      ['Term', `${lease.startDate} → ${lease.endDate}`],
      ['Payments', `Monthly rent: ${lease.monthlyRentEth} ETH; Security deposit: ${lease.securityDepositEth} ETH; Due day: ${lease.dueDay}`],
      ['Additional terms', lease.termsText ? lease.termsText.slice(0, 2000) : '—'],
    ]
  })

  const pageH = doc.internal.pageSize.getHeight()
  doc.text('Signatures:', 14, pageH - 40)
  doc.line(14, pageH - 30, 90, pageH - 30)
  doc.text('Landlord', 14, pageH - 24)
  doc.line(110, pageH - 30, 186, pageH - 30)
  doc.text('Tenant', 110, pageH - 24)

  const blob = doc.output('blob')
  return blob as Blob
}

