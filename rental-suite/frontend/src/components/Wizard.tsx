import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { StepRole } from './StepRole'
import { StepProperty } from './StepProperty'
import { StepParties } from './StepParties'
import { StepDates } from './StepDates'
import { StepMoneyEth } from './StepMoneyEth'
import { StepTerms } from './StepTerms'
import { StepReview } from './StepReview'
import { createLease, updateLease, uploadLeasePdf } from '../lib/api'
import { generateLeasePdf } from '../lib/pdf'
import { toWei, hashTerms, getSigner, loadAgreementsContract, getChainIdHex } from '../lib/eth'
import dayjs from 'dayjs'

export type WizardData = {
  role: 'landlord' | 'tenant'
  propertyAddress: string
  unit: string
  landlordName: string
  landlordContact: string
  tenantName: string
  tenantContact: string
  startDate: string
  endDate: string
  dueDay: number
  monthlyRentEth: string
  securityDepositEth: string
  notes?: string
  termsText?: string
  termsFile?: File
}

const initial: WizardData = {
  role: 'landlord',
  propertyAddress: '',
  unit: '',
  landlordName: '',
  landlordContact: '',
  tenantName: '',
  tenantContact: '',
  startDate: '',
  endDate: '',
  dueDay: 5,
  monthlyRentEth: '',
  securityDepositEth: '',
  notes: '',
}

export function Wizard({ onCreated }: { onCreated?: () => void }) {
  const [step, setStep] = useState(1)
  const [w, setW] = useState<WizardData>(initial)
  const [busy, setBusy] = useState(false)
  const qc = useQueryClient()
  const nav = useNavigate()
  const next = () => setStep(s => Math.min(7, s + 1))
  const back = () => setStep(s => Math.max(1, s - 1))

  const submit = async () => {
    setBusy(true)
    try {
      // 1) Persist human fields first
      const payload = {
        landlordName: w.landlordName,
        landlordContact: w.landlordContact,
        tenantName: w.tenantName,
        tenantContact: w.tenantContact,
        propertyAddress: w.propertyAddress,
        unit: w.unit || null,
        startISO: dayjs(w.startDate).toISOString(),
        endISO: dayjs(w.endDate).toISOString(),
        dueDay: w.dueDay,
        monthlyRentEth: w.monthlyRentEth || '0',
        securityDepositEth: w.securityDepositEth || '0',
        notes: w.notes || null,
      }
      const created = await createLease(payload)

      // 2) Attempt on-chain call (stub-friendly)
      let txHash: string | undefined
      let chainId: string | undefined
      let termsHash: string | undefined
      let status: string = 'pending'
      let tokenId: string | undefined
      try {
        const signer = await getSigner()
        const chainHex = await getChainIdHex()
        chainId = chainHex === '0x539' ? '1337' : chainHex === '0xaa36a7' ? '11155111' : chainHex

        const contract = await loadAgreementsContract(chainId, signer)
        const rentWei = toWei(w.monthlyRentEth || '0')
        const startTs = BigInt(dayjs(w.startDate).unix())
        const endTs = BigInt(dayjs(w.endDate).unix())

        if (w.termsFile) {
          const buf = await w.termsFile.arrayBuffer()
          termsHash = await hashTerms(buf)
        } else {
          termsHash = await hashTerms(w.termsText || '')
        }

        // Replace with your actual contract method as needed
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (contract && (contract as any).mint) {
          const landlordAddr = await (await getSigner()).getAddress()
          const tx = await (contract as any).mint(
            landlordAddr,
            w.tenantContact /* placeholder wallet */,
            startTs,
            endTs,
            rentWei,
            termsHash
          )
          const receipt = await tx.wait()
          txHash = receipt?.hash || tx?.hash
          try {
            const logs = receipt?.logs || []
            for (const log of logs) {
              try {
                const parsed = (contract as any).interface.parseLog(log)
                if (parsed?.name === 'AgreementMinted') {
                  const idArg = (parsed.args?.id ?? parsed.args?.tokenId)
                  if (idArg) tokenId = idArg.toString()
                  break
                }
              } catch {}
            }
          } catch {}
          status = 'active'
        } else {
          // Stub fallback
          txHash = '0x'
          status = 'pending'
        }
      } catch (e) {
        console.warn('On-chain step skipped:', e)
      }

      // 3) Update lease with blockchain artifacts
      await updateLease(created.id, { txHash, chainId, termsHash, status, tokenId })

      // 4) Upload generated PDF (and still accept a provided PDF if present)
      try {
        const blob = await generateLeasePdf({ ...w })
        const file = new File([blob], 'lease.pdf', { type: 'application/pdf' })
        await uploadLeasePdf(created.id, file)
      } catch {}

      // Update caches and navigate
      qc.setQueryData<any[]>(['leases'], (old) => {
        const next = Array.isArray(old) ? [...old] : []
        const newLease = {
          id: created.id,
          landlordName: w.landlordName,
          landlordContact: w.landlordContact,
          tenantName: w.tenantName,
          tenantContact: w.tenantContact,
          propertyAddress: w.propertyAddress,
          unit: w.unit,
          startISO: dayjs(w.startDate).toISOString(),
          endISO: dayjs(w.endDate).toISOString(),
          dueDay: w.dueDay,
          monthlyRentEth: w.monthlyRentEth || '0',
          securityDepositEth: w.securityDepositEth || '0',
          notes: w.notes,
          chainId,
          txHash,
          termsHash,
          tokenId,
          pdfPath: undefined,
          status
        }
        return [newLease, ...next]
      })
      qc.invalidateQueries({ queryKey: ['leases'] })

      onCreated?.()
      nav(`/agreements/${created.id}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="card flex items-center gap-2">
        <span className={`pill ${step===1?'bg-blue-100':''}`}>1. Role</span>
        <span className={`pill ${step===2?'bg-blue-100':''}`}>2. Property</span>
        <span className={`pill ${step===3?'bg-blue-100':''}`}>3. Parties</span>
        <span className={`pill ${step===4?'bg-blue-100':''}`}>4. Dates</span>
        <span className={`pill ${step===5?'bg-blue-100':''}`}>5. Money</span>
        <span className={`pill ${step===6?'bg-blue-100':''}`}>6. Terms</span>
        <span className={`pill ${step===7?'bg-blue-100':''}`}>7. Review</span>
      </div>

      {step===1 && <StepRole w={w} setW={setW} onNext={next} />}
      {step===2 && <StepProperty w={w} setW={setW} onNext={next} onBack={back} />}
      {step===3 && <StepParties w={w} setW={setW} onNext={next} onBack={back} />}
      {step===4 && <StepDates w={w} setW={setW} onNext={next} onBack={back} />}
      {step===5 && <StepMoneyEth w={w} setW={setW} onNext={next} onBack={back} />}
      {step===6 && <StepTerms w={w} setW={setW} onNext={next} onBack={back} />}
      {step===7 && <StepReview w={w} setW={setW} onBack={back} onSubmit={submit} busy={busy} />}
    </div>
  )
}
