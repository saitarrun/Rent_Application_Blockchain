"use client";

import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { encodeVoucher, type VoucherPayload } from "../../lib/eip712";

export function QRVoucher({ open, onOpenChange, voucher, signature }: { open: boolean; onOpenChange: (open: boolean) => void; voucher: VoucherPayload | null; signature: `0x${string}` | null }) {
  const payload = voucher && signature ? encodeVoucher(voucher, signature) : null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Voucher QR</DialogTitle>
          <DialogDescription>
            Scan to import voucher payload. Ensure expiry and nonce match before closing the channel.
          </DialogDescription>
        </DialogHeader>
        {payload ? (
          <div className="flex flex-col items-center gap-3">
            <QRCodeSVG value={payload} size={220} bgColor="#0B0F14" fgColor="#6EE7F9" />
            <textarea readOnly value={payload} className="w-full rounded-xl bg-slate-900/60 p-3 text-xs text-slate-300" />
          </div>
        ) : (
          <div className="text-sm text-slate-400">Sign a voucher to view the QR code.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
