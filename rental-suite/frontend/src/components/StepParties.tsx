import { WizardData } from './Wizard'

export function StepParties({ w, setW, onNext, onBack }: { w: WizardData; setW: (v: WizardData) => void; onNext: () => void; onBack: () => void }) {
  const ok = w.landlordName && w.landlordContact && w.tenantName && w.tenantContact
  return (
    <div className="card grid gap-3">
      <div className="text-lg font-semibold">Parties</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Landlord name</label>
          <input className="input" value={w.landlordName} onChange={e => setW({ ...w, landlordName: e.target.value })} />
          <label className="label mt-2">Landlord contact (email/phone)</label>
          <input className="input" value={w.landlordContact} onChange={e => setW({ ...w, landlordContact: e.target.value })} />
        </div>
        <div>
          <label className="label">Tenant name</label>
          <input className="input" value={w.tenantName} onChange={e => setW({ ...w, tenantName: e.target.value })} />
          <label className="label mt-2">Tenant contact (email/phone)</label>
          <input className="input" value={w.tenantContact} onChange={e => setW({ ...w, tenantContact: e.target.value })} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <button className="btn-ghost" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onNext} disabled={!ok}>Next</button>
      </div>
    </div>
  )
}

