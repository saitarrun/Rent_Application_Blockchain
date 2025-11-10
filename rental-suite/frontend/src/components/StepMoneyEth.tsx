import { WizardData } from './Wizard'

export function StepMoneyEth({ w, setW, onNext, onBack }: { w: WizardData; setW: (v: WizardData) => void; onNext: () => void; onBack: () => void }) {
  const ok = (w.monthlyRentEth || '0') >= '0' && (w.securityDepositEth || '0') >= '0'
  return (
    <div className="card grid gap-3">
      <div className="text-lg font-semibold">Money</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Monthly rent (ETH)</label>
          <input className="input" type="number" step="0.0001" value={w.monthlyRentEth} onChange={e => setW({ ...w, monthlyRentEth: e.target.value })} placeholder="0.10" />
        </div>
        <div>
          <label className="label">Security deposit (ETH)</label>
          <input className="input" type="number" step="0.0001" value={w.securityDepositEth} onChange={e => setW({ ...w, securityDepositEth: e.target.value })} placeholder="0.10" />
        </div>
      </div>
      {!ok && <div className="text-sm text-red-600">Amounts must be non-negative.</div>}
      <div className="flex items-center justify-between mt-2">
        <button className="btn-ghost" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onNext} disabled={!ok}>Next</button>
      </div>
    </div>
  )
}

