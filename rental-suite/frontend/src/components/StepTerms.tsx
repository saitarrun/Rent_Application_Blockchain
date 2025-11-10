import { WizardData } from './Wizard'

export function StepTerms({ w, setW, onNext, onBack }: { w: WizardData; setW: (v: WizardData) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="card grid gap-3">
      <div className="text-lg font-semibold">Terms</div>
      <div>
        <label className="label">Upload PDF (optional)</label>
        <input className="input" type="file" accept="application/pdf" onChange={e => setW({ ...w, termsFile: e.target.files?.[0] })} />
      </div>
      <div>
        <label className="label">Or paste terms</label>
        <textarea className="input" rows={6} value={w.termsText || ''} onChange={e => setW({ ...w, termsText: e.target.value })} placeholder="Plain text terms..." />
      </div>
      <div className="flex items-center justify-between mt-2">
        <button className="btn-ghost" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onNext}>Next</button>
      </div>
    </div>
  )
}

