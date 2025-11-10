import { WizardData } from './Wizard'
import { generateLeasePdf } from '../lib/pdf'
import { uploadLeasePdf } from '../lib/api'

export function StepReview({ w, onBack, onSubmit, busy }: { w: WizardData; onBack: () => void; onSubmit: () => Promise<void>; busy: boolean; setW?: any }) {
  const summary = `Lease for ${w.tenantName} at ${w.propertyAddress}${w.unit? ', Unit '+w.unit:''} from ${w.startDate} to ${w.endDate}. Monthly rent ${w.monthlyRentEth} ETH, deposit ${w.securityDepositEth} ETH. Due day ${w.dueDay}.`

  const downloadPdf = async () => {
    const blob = await generateLeasePdf({ ...w, summary })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lease.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card grid gap-3">
      <div className="text-lg font-semibold">Review</div>
      <p className="text-slate-700 text-sm whitespace-pre-wrap">{summary}</p>
      <div className="flex gap-2 mt-2">
        <button className="btn-primary" onClick={onSubmit} disabled={busy}>{busy ? 'Creating…' : 'Create Lease'}</button>
        <button className="btn-secondary" onClick={downloadPdf}>Download Lease PDF</button>
        <button className="btn-ghost" onClick={onBack}>Back</button>
      </div>
    </div>
  )
}

