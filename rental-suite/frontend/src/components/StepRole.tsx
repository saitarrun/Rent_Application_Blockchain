import { WizardData } from './Wizard'

export function StepRole({ w, setW, onNext }: { w: WizardData; setW: (v: WizardData) => void; onNext: () => void }) {
  return (
    <div className="card">
      <div className="text-lg font-semibold">Choose role</div>
      <div className="mt-3 flex gap-2">
        <button className={`btn ${w.role==='landlord'?'btn-primary':'btn-secondary'}`} onClick={() => setW({ ...w, role: 'landlord' })}>I am a Landlord</button>
        <button className={`btn ${w.role==='tenant'?'btn-primary':'btn-secondary'}`} onClick={() => setW({ ...w, role: 'tenant' })}>I am a Tenant</button>
      </div>
      <div className="mt-4"><button className="btn-primary" onClick={onNext}>Next</button></div>
    </div>
  )
}

