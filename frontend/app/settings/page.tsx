"use client";

import { AnimatedCard } from "../../components/AnimatedCard";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="grid gap-6">
      <AnimatedCard>
        <h1 className="text-xl font-semibold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-300">Update your profile and notification preferences. No technical terms.</p>
      </AnimatedCard>

      <AnimatedCard>
        <div className="grid gap-3 sm:max-w-md">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="grid gap-2">
            <Label>Contact (email/phone)</Label>
            <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300 mt-2">
            <input id="notify" type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
            <label htmlFor="notify">Send reminders for upcoming payments</label>
          </div>
          <div className="mt-4">
            <Button onClick={() => alert("Saved")}>Save</Button>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}

