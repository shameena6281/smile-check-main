import { useNavigate } from "react-router-dom";
import { ScanFace, Shield, Zap, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-face-scan.jpg";

const features = [
  { icon: ScanFace, title: "AI Face Detection", desc: "Advanced facial recognition for accurate employee identification" },
  { icon: Zap, title: "Instant Check-in", desc: "Sub-second attendance logging with real-time processing" },
  { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade security with encrypted data storage" },
  { icon: BarChart3, title: "Smart Analytics", desc: "Comprehensive attendance reports and workforce insights" },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="AI Face Recognition" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 gradient-dark opacity-60" />
        </div>

        <div className="relative">
          <header className="flex items-center justify-between px-6 py-4 lg:px-12">
            <div className="flex items-center gap-3">
              <div className="rounded-lg gradient-primary p-2">
                <ScanFace className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">FaceAttend</span>
            </div>
            <Button onClick={() => navigate("/auth")} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
              Sign In
            </Button>
          </header>

          <div className="mx-auto max-w-4xl px-6 pb-24 pt-20 text-center lg:px-12 lg:pt-32 lg:pb-36">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-mono text-primary">AI-POWERED SYSTEM</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground lg:text-6xl">
              Smart Face
              <span className="block gradient-primary bg-clip-text text-transparent">Attendance System</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
              Revolutionize workforce management with AI-powered facial recognition. 
              Accurate, fast, and secure attendance tracking for modern organizations.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="gradient-primary text-primary-foreground px-8 py-6 text-lg glow-primary hover:opacity-90 transition-opacity"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-border px-8 py-6 text-lg text-foreground hover:bg-secondary"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="border-t border-border bg-card/50 px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            Why <span className="text-primary">FaceAttend</span>?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:glow-primary">
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 FaceAttend — AI Face Attendance System
        </p>
      </footer>
    </div>
  );
}
