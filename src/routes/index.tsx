import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Zap, Link2, MessageSquareWarning, BookOpenCheck, ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import heroShield from "@/assets/hero-shield.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fraud Shield — AI protection for first-time digital users" },
      {
        name: "description",
        content:
          "Paste any link, message or payment request. Fraud Shield's AI tells you in seconds if it's safe — and teaches you why.",
      },
      { property: "og:title", content: "Fraud Shield — AI fraud protection" },
      {
        property: "og:description",
        content: "Real-time fraud detection for first-time digital users. Stay safe online.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="bg-hero min-h-screen">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,oklch(0.55_0.2_255/0.25),transparent_60%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="border-primary/30 bg-primary/10 text-primary-glow inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
              <Zap className="h-3.5 w-3.5" /> AI · Cybersecurity · FinTech
            </div>
            <h1 className="font-display mt-6 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Don't get scammed.<br />
              <span className="text-gradient">Check it first.</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
              Fraud Shield is your AI safety net for the internet. Paste a suspicious link, message,
              or payment request — get a risk score and plain-English advice in seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-shield text-primary-foreground shadow-glow hover:opacity-90">
                <Link to="/login">
                  Try it free <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border bg-card/40">
                <a href="#how">See how it works</a>
              </Button>
            </div>
            <div className="text-muted-foreground mt-8 flex items-center gap-6 text-xs">
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-success" /> Real-time analysis</span>
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-success" /> Beginner-friendly</span>
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-success" /> Always private</span>
            </div>
          </div>

          <div className="relative">
            <div className="bg-primary/20 absolute -inset-8 -z-10 rounded-3xl blur-3xl" />
            <img
              src={heroShield}
              alt="Digital shield deflecting phishing and scam attempts"
              width={1536}
              height={1280}
              className="shadow-elegant rounded-2xl border border-border/60"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Built for people new to the internet</h2>
          <p className="text-muted-foreground mt-4">
            Four AI capabilities working together to keep your money and identity safe.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Link2, title: "Phishing link detection", body: "Catches lookalike domains, suspicious shorteners and fake login pages before you click." },
            { icon: MessageSquareWarning, title: "Scam message analysis", body: "Spots impersonation, urgency tricks, OTP scams and fake payment requests." },
            { icon: Shield, title: "Behavioural risk score", body: "AI weighs dozens of signals to give a 0–100 risk score you can act on instantly." },
            { icon: BookOpenCheck, title: "Plain-English coaching", body: "Every result explains the why — so you learn to spot the next scam yourself." },
          ].map((f) => (
            <div
              key={f.title}
              className="border-border/60 bg-card/60 hover:border-primary/40 group rounded-2xl border p-6 backdrop-blur transition-colors"
            >
              <div className="bg-shield shadow-glow flex h-11 w-11 items-center justify-center rounded-xl">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-3">
          {[
            { n: "01", t: "Paste anything suspicious", d: "A link from WhatsApp, a payment request, an email — anything that feels off." },
            { n: "02", t: "AI analyses in seconds", d: "Our model checks scam patterns, domain reputation and social-engineering tactics." },
            { n: "03", t: "Get a clear verdict", d: "Risk score, reasons in plain English, and one safe next step you can take." },
          ].map((s) => (
            <div key={s.n} className="border-border/60 bg-card/40 relative rounded-2xl border p-8">
              <span className="text-gradient font-display text-5xl font-bold">{s.n}</span>
              <h3 className="font-display mt-4 text-xl font-semibold">{s.t}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="border-primary/30 bg-shield shadow-glow relative overflow-hidden rounded-3xl border p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
          <h2 className="font-display relative text-3xl font-bold text-primary-foreground md:text-4xl">
            Start protecting yourself in 30 seconds
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Free to try. No card needed. Designed for people taking their first steps online.
          </p>
          <div className="relative mt-7">
            <Button asChild size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              <Link to="/login">
                Get my Fraud Shield <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-border/60 border-t py-8">
        <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 text-xs md:flex-row">
          <span>© {new Date().getFullYear()} Fraud Shield. Stay safe out there.</span>
          <span>Built with care for first-time digital users.</span>
        </div>
      </footer>
    </div>
  );
}
