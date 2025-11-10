"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { TxButton } from "../TxButton";
import { toast } from "../ToastBoundary";
import { useAccount, useChainId, useWriteContract } from "wagmi";
import { contracts, RENTAL_AGREEMENT_ABI } from "../../lib/contracts";
import dayjs from "dayjs";
import { keccak256, toHex, isHex, padHex } from "viem";
import { useSearchParams } from "next/navigation";

type Role = "landlord" | "tenant";

export function LeaseWizard() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>("landlord");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [unit, setUnit] = useState("");
  const [notes, setNotes] = useState("");
  const [tenantContact, setTenantContact] = useState("");
  const [tenantWallet, setTenantWallet] = useState(""); // advanced
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currency, setCurrency] = useState<"USD" | "ETH">("USD");
  const [rentFiat, setRentFiat] = useState("");
  const [depositFiat, setDepositFiat] = useState("");
  const [fiatPerEth, setFiatPerEth] = useState("2000"); // demo conversion for local ETH
  const [termsText, setTermsText] = useState("");
  const [termsFile, setTermsFile] = useState<File | null>(null);

  const { address: connected } = useAccount();
  const chainIdHook = useChainId();
  const { writeContractAsync } = useWriteContract();
  const chainId = chainIdHook || 1337;

  const next = () => setStep((s) => Math.min(7, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const landlordAddress = connected; // auto from wallet

  const summary = useMemo(() => {
    if (!propertyAddress) return "";
    return `Lease for tenant at ${propertyAddress}${unit ? ", Unit " + unit : ""} from ${startDate || "?"} to ${endDate || "?"}. Monthly rent ${rentFiat || "?"} ${currency}, deposit ${depositFiat || "?"} ${currency}.`;
  }, [propertyAddress, unit, startDate, endDate, rentFiat, depositFiat, currency]);

  // Prefill from /create?addr=...&unit=...
  useEffect(() => {
    const addr = params?.get("addr");
    const u = params?.get("unit");
    if (addr) setPropertyAddress(addr);
    if (u) setUnit(u);
  }, [params]);

  const toWeiFromFiat = (amount: string) => {
    const price = parseFloat(fiatPerEth || "0");
    const amt = parseFloat(amount || "0");
    const eth = !isFinite(price) || price <= 0 ? 0 : amt / price;
    // use BigInt math via 1e18 scale
    const scaled = BigInt(Math.round(eth * 1e6)) * 10n ** 12n; // 1e6 -> 1e18
    return scaled;
  };

  const computeTermsHash = async (): Promise<`0x${string}`> => {
    if (termsFile) {
      const buf = await termsFile.arrayBuffer();
      const hex = toHex(new Uint8Array(buf));
      return keccak256(hex);
    }
    if (termsText && isHex(termsText as `0x${string}`, { strict: true })) {
      return padHex(termsText as `0x${string}`, { size: 32 });
    }
    const text = termsText || summary || "";
    return keccak256(toHex(text));
  };

  const createAgreement = async () => {
    try {
      if (!startDate || !endDate || !rentFiat) {
        toast.error("Fill dates and rent first");
        return;
      }
      if (!tenantWallet) {
        toast.error("Enter a tenant wallet in Advanced to publish on-chain");
        return;
      }
      if (!landlordAddress) {
        toast.error("Connect your wallet first");
        return;
      }
      const start = BigInt(dayjs(startDate).unix());
      const end = BigInt(dayjs(endDate).unix());
      const rentPerPeriod = currency === "ETH" ? BigInt(Math.round(parseFloat(rentFiat || "0") * 1e18)) : toWeiFromFiat(rentFiat);
      const termsHash = await computeTermsHash();

      await writeContractAsync({
        address: contracts.agreements(chainId).address,
        abi: RENTAL_AGREEMENT_ABI,
        functionName: "mint",
        args: [
          landlordAddress as `0x${string}`,
          tenantWallet as `0x${string}`,
          start,
          end,
          rentPerPeriod,
          termsHash
        ]
      });
      toast.success("Agreement created");
    } catch (err: any) {
      console.error(err);
      toast.error("Could not create agreement. Ask the property admin to publish.");
    }
  };

  const StepActions = (
    <div className="mt-4 flex items-center justify-between">
      <Button variant="ghost" onClick={back} disabled={step === 1}>Back</Button>
      {step < 7 ? (
        <Button onClick={next}>Next</Button>
      ) : (
        <TxButton variant="default" txAction={createAgreement} pendingLabel="Creating">Create Agreement</TxButton>
      )}
    </div>
  );

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
        <div className="mb-3 text-sm text-slate-300">Speak human. We’ll handle the technical details.</div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className={`rounded-full px-3 py-1 ${step === 1 ? "bg-primary/30" : "bg-slate-800/70"}`}>1. Role</span>
          <span className={`rounded-full px-3 py-1 ${step === 2 ? "bg-primary/30" : "bg-slate-800/70"}`}>2. Property</span>
          <span className={`rounded-full px-3 py-1 ${step === 3 ? "bg-primary/30" : "bg-slate-800/70"}`}>3. Parties</span>
          <span className={`rounded-full px-3 py-1 ${step === 4 ? "bg-primary/30" : "bg-slate-800/70"}`}>4. Dates</span>
          <span className={`rounded-full px-3 py-1 ${step === 5 ? "bg-primary/30" : "bg-slate-800/70"}`}>5. Money</span>
          <span className={`rounded-full px-3 py-1 ${step === 6 ? "bg-primary/30" : "bg-slate-800/70"}`}>6. Terms</span>
          <span className={`rounded-full px-3 py-1 ${step === 7 ? "bg-primary/30" : "bg-slate-800/70"}`}>7. Review</span>
        </div>
      </div>

      {step === 1 && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Choose role</h2>
          <div className="mt-4 flex gap-3">
            <Button variant={role === "landlord" ? "default" : "secondary"} onClick={() => setRole("landlord")}>I am a Landlord</Button>
            <Button variant={role === "tenant" ? "default" : "secondary"} onClick={() => setRole("tenant")}>I am a Tenant</Button>
          </div>
          {StepActions}
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Property</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Address</Label>
              <Input value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} placeholder="Street, City, State" />
            </div>
            <div className="grid gap-2">
              <Label>Unit (optional)</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Apt / Unit" />
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            <Label>Notes (optional)</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special notes" />
          </div>
          {StepActions}
        </div>
      )}

      {step === 3 && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Parties</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tenant contact (email/phone)</Label>
              <Input value={tenantContact} onChange={(e) => setTenantContact(e.target.value)} placeholder="tenant@example.com" />
            </div>
            <div className="grid gap-2">
              <Label>Landlord (auto)</Label>
              <Input readOnly value={connected || "Connect wallet"} />
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            <Label>Tenant wallet (advanced)</Label>
            <Input value={tenantWallet} onChange={(e) => setTenantWallet(e.target.value)} placeholder="0x... (optional; required to publish)" />
          </div>
          {StepActions}
        </div>
      )}

      {step === 4 && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Dates</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Start date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>End date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">Use calendar dates. We’ll handle the technical details.</p>
          {StepActions}
        </div>
      )}

      {step === 5 && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Money</h2>
          <div className="mt-3 flex items-center gap-3">
            <Label>Currency</Label>
            <Button variant={currency === "USD" ? "default" : "secondary"} onClick={() => setCurrency("USD")}>USD</Button>
            <Button variant={currency === "ETH" ? "default" : "secondary"} onClick={() => setCurrency("ETH")}>Crypto</Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Monthly rent</Label>
              <Input type="number" value={rentFiat} onChange={(e) => setRentFiat(e.target.value)} placeholder={currency === "USD" ? "1200" : "0.10"} />
            </div>
            <div className="grid gap-2">
              <Label>Security deposit</Label>
              <Input type="number" value={depositFiat} onChange={(e) => setDepositFiat(e.target.value)} placeholder={currency === "USD" ? "1200" : "0.10"} />
            </div>
          </div>
          {currency === "USD" && (
            <div className="mt-3 grid gap-2 sm:max-w-xs">
              <Label>ETH price (USD per ETH) for local testing</Label>
              <Input type="number" value={fiatPerEth} onChange={(e) => setFiatPerEth(e.target.value)} />
              <p className="text-xs text-slate-400">We convert amounts to test ETH on Ganache using this rate.</p>
            </div>
          )}
          {StepActions}
        </div>
      )}

      {step === 6 && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Terms</h2>
          <p className="text-sm text-slate-300">Upload a PDF or paste plain text. We store a fingerprint so it can’t be altered.</p>
          <div className="mt-4 grid gap-3">
            <div className="grid gap-2">
              <Label>Upload PDF (optional)</Label>
              <Input type="file" onChange={(e) => setTermsFile(e.target.files?.[0] || null)} />
            </div>
            <div className="grid gap-2">
              <Label>Or paste terms</Label>
              <Textarea rows={5} value={termsText} onChange={(e) => setTermsText(e.target.value)} placeholder="Paste terms here (or leave blank)." />
            </div>
          </div>
          {StepActions}
        </div>
      )}

      {step === 7 && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Review & publish</h2>
          <p className="mt-2 text-sm text-slate-300">{summary || "Fill previous steps to preview."}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <TxButton variant="default" txAction={createAgreement} pendingLabel="Creating">Create Agreement</TxButton>
            <Button variant="secondary" onClick={() => toast.success("Preview saved.")}>Preview agreement</Button>
          </div>
          <p className="mt-3 text-xs text-slate-400">Agreements are non-transferable. Landlord can close the agreement after the end date.</p>
        </div>
      )}
    </div>
  );
}
