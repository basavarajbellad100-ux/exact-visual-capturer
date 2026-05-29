import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import jsQR from "jsqr";
import {
  Shield, ShieldAlert, ShieldCheck, ShieldX, Loader2, Trash2,
  Link2, MessageSquareWarning, CreditCard, Sparkles, QrCode, Upload,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { analyzeFraud, deleteScan, listScans } from "@/lib/fraud.functions";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Fraud Shield" }] }),
  component: Dashboard,
});

type InputType = "link" | "message" | "transaction" | "qr";

const RISK_STYLES: Record<string, { color: string; icon: typeof Shield; label: string }> = {
  safe:     { color: "text-success",     icon: ShieldCheck, label: "Safe" },
  low:      { color: "text-success",     icon: ShieldCheck, label: "Low risk" },
  medium:   { color: "text-warning",     icon: ShieldAlert, label: "Caution" },
  high:     { color: "text-destructive", icon: ShieldAlert, label: "High risk" },
  critical: { color: "text-destructive", icon: ShieldX,     label: "Critical — likely scam" },
};

function Dashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [type, setType] = useState<InputType>("link");
  const [text, setText] = useState("");
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [qrDecoding, setQrDecoding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const fetchScans = useServerFn(listScans);
  const runAnalyze = useServerFn(analyzeFraud);
  const runDelete = useServerFn(deleteScan);

  const handleQrFile = async (file: File) => {
    setQrDecoding(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Invalid image"));
        img.src = dataUrl;
      });
      const canvas = document.createElement("canvas");
      const maxSize = 1024;
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });
      if (!code || !code.data) {
        toast.error("No QR code found in this image. Try a clearer photo.");
        return;
      }
      setQrPreview(dataUrl);
      setText(code.data);
      toast.success("QR code decoded");
    } catch (e) {
      toast.error((e as Error).message || "Failed to decode QR");
    } finally {
      setQrDecoding(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) navigate({ to: "/login", replace: true });
      else setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/login", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const scans = useQuery({
    queryKey: ["scans"],
    queryFn: () => fetchScans(),
    enabled: ready,
  });

  const analyze = useMutation({
    mutationFn: (vars: { inputType: InputType; inputText: string }) =>
      runAnalyze({ data: vars }),
    onSuccess: () => {
      setText("");
      setQrPreview(null);
      qc.invalidateQueries({ queryKey: ["scans"] });
      toast.success("Scan complete");
    },
    onError: (e: Error) => toast.error(e.message || "Could not analyze"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => runDelete({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scans"] }),
  });

  if (!ready) {
    return (
      <div className="bg-hero flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-6 w-6 animate-spin" />
      </div>
    );
  }

  const placeholder: Record<InputType, string> = {
    link: "Paste a suspicious URL, e.g. https://hdfc-secure-login.xyz/verify",
    message: "Paste the message or email you received…",
    transaction: "Describe the payment request, e.g. 'UPI request for ₹5000 from rahul@oksbi to confirm KYC'",
    qr: "Upload a QR code image — we'll decode it and analyze the contents.",
  };

  return (
    <div className="bg-hero min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Your <span className="text-gradient">Fraud Shield</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Paste anything that feels suspicious. Our AI checks it in seconds.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          {/* Scanner */}
          <section className="border-border/60 bg-card/60 rounded-2xl border p-6 backdrop-blur">
            <Tabs
              value={type}
              onValueChange={(v) => {
                setType(v as InputType);
                setText("");
                setQrPreview(null);
              }}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="link"><Link2 className="mr-1.5 h-4 w-4" />Link</TabsTrigger>
                <TabsTrigger value="message"><MessageSquareWarning className="mr-1.5 h-4 w-4" />Message</TabsTrigger>
                <TabsTrigger value="transaction"><CreditCard className="mr-1.5 h-4 w-4" />Payment</TabsTrigger>
                <TabsTrigger value="qr"><QrCode className="mr-1.5 h-4 w-4" />QR</TabsTrigger>
              </TabsList>
            </Tabs>

            {type === "qr" ? (
              <div className="mt-4 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleQrFile(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={qrDecoding}
                  className="border-border/60 bg-background/40 hover:border-primary/60 hover:bg-primary/5 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors"
                >
                  {qrDecoding ? (
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                  ) : qrPreview ? (
                    <img src={qrPreview} alt="QR preview" className="h-32 w-32 rounded-lg object-contain" />
                  ) : (
                    <>
                      <Upload className="text-primary h-8 w-8" />
                      <p className="text-sm font-medium">Click to upload a QR code image</p>
                      <p className="text-muted-foreground text-xs">PNG, JPG, or screenshot</p>
                    </>
                  )}
                </button>
                {text && (
                  <div className="border-border/60 bg-background/60 rounded-lg border p-3">
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                      Decoded contents
                    </p>
                    <p className="mt-1 break-all font-mono text-sm">{text}</p>
                  </div>
                )}
              </div>
            ) : (
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder[type]}
                className="bg-background/60 mt-4 min-h-[140px] resize-none text-base"
              />
            )}

            <Button
              disabled={analyze.isPending || text.trim().length < 3}
              onClick={() => analyze.mutate({ inputType: type, inputText: text.trim() })}
              size="lg"
              className="bg-shield text-primary-foreground shadow-glow mt-4 w-full hover:opacity-90"
            >
              {analyze.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> {type === "qr" ? "Analyze QR code" : "Check for fraud"}</>
              )}
            </Button>

            {analyze.data && <ScanResult scan={analyze.data} />}
          </section>


          {/* History */}
          <section className="border-border/60 bg-card/60 rounded-2xl border p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Recent scans</h2>
              <span className="text-muted-foreground text-xs">{scans.data?.length ?? 0} total</span>
            </div>

            {scans.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="text-primary h-5 w-5 animate-spin" /></div>
            ) : !scans.data?.length ? (
              <div className="text-muted-foreground rounded-xl border border-dashed border-border p-8 text-center text-sm">
                No scans yet. Try checking something on the left.
              </div>
            ) : (
              <ul className="space-y-3">
                {scans.data.map((s) => {
                  const style = RISK_STYLES[s.risk_level] ?? RISK_STYLES.medium;
                  const Icon = style.icon;
                  return (
                    <li key={s.id} className="border-border/60 bg-background/40 rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Icon className={`mt-0.5 h-5 w-5 ${style.color}`} />
                          <div>
                            <p className="text-sm font-medium">{s.verdict}</p>
                            <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">{s.input_text}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => remove.mutate(s.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function ScanResult({ scan }: { scan: any }) {
  const style = RISK_STYLES[scan.risk_level] ?? RISK_STYLES.medium;
  const Icon = style.icon;
  return (
    <div className="border-border/60 bg-background/60 mt-6 rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`h-6 w-6 ${style.color}`} />
          <div>
            <p className={`font-display text-lg font-semibold ${style.color}`}>{style.label}</p>
            <p className="text-muted-foreground text-xs">Risk score: {scan.risk_score}/100</p>
          </div>
        </div>
        <div className="bg-background relative h-12 w-12 overflow-hidden rounded-full">
          <div
            className="bg-shield absolute inset-0"
            style={{
              clipPath: `polygon(0 ${100 - scan.risk_score}%, 100% ${100 - scan.risk_score}%, 100% 100%, 0 100%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
            {scan.risk_score}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm font-medium">{scan.verdict}</p>

      <div className="mt-4">
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Why</p>
        <ul className="mt-2 space-y-1.5">
          {(scan.reasons as string[]).map((r, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-primary-glow">•</span> {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-primary/30 bg-primary/10 mt-4 rounded-lg border p-3">
        <p className="text-primary-glow text-xs font-semibold uppercase tracking-wide">What to do</p>
        <p className="mt-1 text-sm leading-relaxed">{scan.advice}</p>
      </div>
    </div>
  );
}
