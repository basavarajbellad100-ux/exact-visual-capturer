import { Link, useNavigate } from "@tanstack/react-router";
import { Shield, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2">
          <div className="bg-shield flex h-8 w-8 items-center justify-center rounded-lg shadow-glow transition-transform group-hover:scale-105">
            <Shield className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Fraud<span className="text-gradient">Shield</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button onClick={signOut} variant="ghost" size="sm">
                <LogOut className="mr-1.5 h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-shield text-primary-foreground shadow-glow hover:opacity-90">
                <Link to="/login">Get protected</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
