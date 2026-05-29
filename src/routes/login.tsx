import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Fraud Shield" },
      { name: "description", content: "Sign in to Fraud Shield to start scanning links, messages, and payment requests." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back!");
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created. You're in!");
  };

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      setLoading(false);
      toast.error("Google sign-in failed");
    }
  };

  return (
    <div className="bg-hero min-h-screen">
      <SiteNav />
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
        <div className="bg-shield shadow-glow mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
          <Shield className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Welcome to Fraud Shield</h1>
        <p className="text-muted-foreground mt-2 text-center text-sm">
          Sign in to start scanning suspicious links and messages.
        </p>

        <div className="border-border/60 bg-card/60 mt-8 w-full rounded-2xl border p-6 backdrop-blur">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            {(["signin", "signup"] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-5">
                <form onSubmit={tab === "signin" ? signIn : signUp} className="space-y-4">
                  <div>
                    <Label htmlFor={`${tab}-email`}>Email</Label>
                    <Input
                      id={`${tab}-email`}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${tab}-pwd`}>Password</Label>
                    <Input
                      id={`${tab}-pwd`}
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1.5"
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-shield text-primary-foreground shadow-glow w-full hover:opacity-90"
                  >
                    {tab === "signin" ? "Sign in" : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>

          <div className="my-5 flex items-center gap-3">
            <div className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-xs uppercase tracking-wider">or</span>
            <div className="bg-border h-px flex-1" />
          </div>
          <Button onClick={google} disabled={loading} variant="outline" className="w-full">
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
