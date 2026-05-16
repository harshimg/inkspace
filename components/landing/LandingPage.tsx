"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  FileText, Zap, Search, FolderOpen,
  Lock, Globe, ArrowRight, CheckCircle2,
} from "lucide-react";

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
              <span className="text-background text-[11px] font-bold font-mono">i</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">inkspace</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#why" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Why inkspace</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
              Log in
            </Button>
            <Button size="sm" onClick={() => router.push("/login")} className="gap-1.5">
              Get inkspace free
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-xs text-muted-foreground mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Now live — free to use
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-3xl leading-tight">
          Your second brain,{" "}
          <span className="text-muted-foreground">finally organized.</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
          inkspace is a modern workspace for your notes, docs, and ideas.
          Write faster, think clearer, find anything instantly.
        </p>

        <div className="flex items-center gap-3 mt-10">
          <Button size="lg" onClick={() => router.push("/login")} className="gap-2 h-11 px-6">
            Get started for free
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push("/login")} className="h-11 px-6">
            Log in
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required · Sign in with GitHub or Google
        </p>

        {/* App preview */}
        <div className="mt-16 w-full max-w-4xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/50">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-4">
              <div className="h-5 rounded bg-background/60 w-48 mx-auto flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">notes.noink.ink</span>
              </div>
            </div>
          </div>
          <div className="flex h-72">
            {/* Mock sidebar */}
            <div className="w-48 border-r border-border bg-card px-3 py-4 hidden md:flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded bg-foreground" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
              {["Getting Started", "Meeting Notes", "Project Ideas", "Research", "Daily Journal"].map((item, i) => (
                <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${i === 0 ? "bg-accent" : ""}`}>
                  <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                  <div className="h-2.5 rounded bg-muted flex-1" style={{ width: `${60 + i * 8}%` }} />
                </div>
              ))}
            </div>
            {/* Mock editor */}
            <div className="flex-1 px-8 py-8 flex flex-col gap-3">
              <div className="h-7 w-64 rounded bg-muted/80" />
              <div className="space-y-2 mt-2">
                <div className="h-3 rounded bg-muted w-full" />
                <div className="h-3 rounded bg-muted w-5/6" />
                <div className="h-3 rounded bg-muted w-4/6" />
              </div>
              <div className="h-5 w-32 rounded bg-muted/60 mt-2" />
              <div className="space-y-2">
                <div className="h-3 rounded bg-muted w-full" />
                <div className="h-3 rounded bg-muted w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
            <p className="text-muted-foreground mt-3 text-base">Built for developers, writers, and thinkers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FileText className="w-5 h-5" />,
                title: "Rich text editor",
                desc: "Write with a powerful editor. Bold, italic, headings, code blocks, links, and more — all with slash commands.",
              },
              {
                icon: <Search className="w-5 h-5" />,
                title: "Instant search",
                desc: "Find any note in milliseconds with Ctrl+K. Search across titles and content across your entire workspace.",
              },
              {
                icon: <FolderOpen className="w-5 h-5" />,
                title: "Folder hierarchy",
                desc: "Organize notes into folders. Create, rename, and delete folders with full drag-and-drop support.",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Autosave",
                desc: "Never lose your work. inkspace saves every change automatically in the background as you type.",
              },
              {
                icon: <Lock className="w-5 h-5" />,
                title: "Private & secure",
                desc: "Your notes are private by default. Row-level security ensures only you can access your workspace.",
              },
              {
                icon: <Globe className="w-5 h-5" />,
                title: "Works everywhere",
                desc: "Access your notes from any device. inkspace is a fully responsive web app — no install required.",
              },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-foreground mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why section */}
      <section id="why" className="py-24 px-6 border-t border-border bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Why inkspace?</h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-12">
            Notion is bloated. Obsidian is complex. inkspace is the middle ground —
            powerful enough for developers, simple enough for anyone.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {[
              "No bloat — only what you need",
              "Dark mode & light mode",
              "Keyboard-first design",
              "Fast and responsive",
              "Free to use, no paywalls",
              "Built on open standards",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Start writing today</h2>
          <p className="text-muted-foreground mb-8">Free forever. No credit card. Just sign in and go.</p>
          <Button size="lg" onClick={() => router.push("/login")} className="gap-2 h-11 px-8">
            Get inkspace free
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-foreground flex items-center justify-center">
              <span className="text-background text-[10px] font-bold font-mono">i</span>
            </div>
            <span className="text-sm font-medium">inkspace</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built on <a href="https://noink.ink" className="underline underline-offset-2">noink.ink</a>
          </p>
        </div>
      </footer>
    </div>
  );
}