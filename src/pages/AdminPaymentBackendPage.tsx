import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Server, CheckCircle2, XCircle } from "lucide-react";
import {
  DEFAULT_API_BASE,
  getApiBase,
  normalizeApiBase,
  resetPaymentApiBase,
  savePaymentApiBase,
} from "@/lib/payment-api";

export default function AdminPaymentBackendPage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [current, setCurrent] = useState("");
  const [value, setValue] = useState("");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/login");
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const base = await getApiBase();
      setCurrent(base);
      setValue(base);
      setFetching(false);
    })();
  }, [isAdmin]);

  const flash = (m: string) => {
    setMessage(m);
    setTimeout(() => setMessage(""), 4000);
  };

  const isValid = (() => {
    const clean = normalizeApiBase(value);
    if (!clean) return false;
    try {
      const url = new URL(clean);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  })();

  const handleSave = async () => {
    if (!isValid) {
      flash("Enter a full address starting with https://");
      return;
    }
    setSaving(true);
    setTestResult(null);
    try {
      const saved = await savePaymentApiBase(value);
      setCurrent(saved);
      setValue(saved);
      flash("Saved. All payments now go through this address.");
    } catch (e) {
      console.error(e);
      flash("Could not save. Make sure you are signed in as the admin.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Go back to the original payment address?")) return;
    setSaving(true);
    try {
      const saved = await resetPaymentApiBase();
      setCurrent(saved);
      setValue(saved);
      flash("Restored the original payment address.");
    } catch (e) {
      console.error(e);
      flash("Could not restore. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!isValid) {
      flash("Enter a full address starting with https://");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${normalizeApiBase(value)}/wallet/balance`);
      const body = await res.json().catch(() => null);
      if (res.ok && body) {
        setTestResult({ ok: true, text: "Connected — the address answered correctly." });
      } else {
        setTestResult({ ok: false, text: `The address answered with an error (${res.status}).` });
      }
    } catch {
      setTestResult({ ok: false, text: "No answer from that address. Check it and try again." });
    } finally {
      setTesting(false);
    }
  };

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payment Backend</h1>
              <p className="text-muted-foreground text-xs">Change where payments are processed</p>
            </div>
          </div>
          <Link to="/admin" className="text-primary hover:underline text-sm">
            ← Back to Admin
          </Link>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-primary/15 border border-primary/40 rounded text-primary text-sm">
            {message}
          </div>
        )}

        <Card className="p-5 bg-card border-border space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Currently in use</p>
            <p className="text-sm font-mono break-all text-foreground">
              {fetching ? "Loading…" : current}
            </p>
            {!fetching && current === DEFAULT_API_BASE && (
              <p className="text-xs text-muted-foreground mt-1">This is the original address.</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              New payment address (ends with /api)
            </label>
            <Input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setTestResult(null);
              }}
              placeholder="https://your-new-backend.up.railway.app/api"
              className="bg-secondary border-border font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Deposits, withdrawals, payment status checks, wallet balance, transactions and phone
              checks will all be sent to this address.
            </p>
          </div>

          {testResult && (
            <div
              className={`flex items-start gap-2 p-3 rounded text-sm border ${
                testResult.ok
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-destructive/10 border-destructive/40 text-destructive"
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <span>{testResult.text}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={handleSave} disabled={saving || fetching}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save address
            </Button>
            <Button variant="secondary" onClick={handleTest} disabled={testing || fetching}>
              {testing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Test connection
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={saving || fetching}>
              Restore original
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
