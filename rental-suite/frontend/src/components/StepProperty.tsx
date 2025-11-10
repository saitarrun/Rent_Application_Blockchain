import { WizardData } from './Wizard'

export function StepProperty({ w, setW, onNext, onBack }: { w: WizardData; setW: (v: WizardData) => void; onNext: () => void; onBack: () => void }) {
  const canNext = w.propertyAddress.trim().length > 0
  return (
    <div className="card grid gap-3">
      <div className="text-lg font-semibold">Property</div>
      <div>
        <label className="label">Property address</label>
        <input className="input" value={w.propertyAddress} onChange={e => setW({ ...w, propertyAddress: e.target.value })} placeholder="Street, City, State" />
      </div>
      <div>
        <label className="label">Unit (optional)</label>
        <input className="input" value={w.unit} onChange={e => setW({ ...w, unit: e.target.value })} placeholder="Apt / Unit" />
      </div>
      <div className="flex items-center justify-between mt-2">
        <button className="btn-ghost" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onNext} disabled={!canNext}>Next</button>
      </div>
    </div>
  )
}

