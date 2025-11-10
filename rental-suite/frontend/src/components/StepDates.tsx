import dayjs from 'dayjs'
import { WizardData } from './Wizard'

export function StepDates({ w, setW, onNext, onBack }: { w: WizardData; setW: (v: WizardData) => void; onNext: () => void; onBack: () => void }) {
  const valid = w.startDate && w.endDate && dayjs(w.endDate).isAfter(dayjs(w.startDate))
  return (
    <div className="card grid gap-3">
      <div className="text-lg font-semibold">Dates</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Start date</label>
          <input type="date" className="input" value={w.startDate} onChange={e => setW({ ...w, startDate: e.target.value })} />
        </div>
        <div>
          <label className="label">End date</label>
          <input type="date" className="input" value={w.endDate} onChange={e => setW({ ...w, endDate: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label">Payment due day</label>
        <select className="input" value={w.dueDay} onChange={e => setW({ ...w, dueDay: Number(e.target.value) })}>
          {Array.from({ length: 28 }).map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
        </select>
      </div>
      {!valid && <div className="text-sm text-red-600">End date must be after start date.</div>}
      <div className="flex items-center justify-between mt-2">
        <button className="btn-ghost" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={onNext} disabled={!valid}>Next</button>
      </div>
    </div>
  )
}

