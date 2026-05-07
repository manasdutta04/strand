"use client";

import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";

function DemoOption({ href, title, description, accent }: { href: string; title: string; description: string; accent: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-background p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
    >
      <div className={`mb-3 h-2 w-24 rounded-full ${accent}`} />
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 text-xs uppercase tracking-[0.2em] text-primary transition-transform group-hover:translate-x-1">
        Open
      </div>
    </Link>
  );
}

export function WhoDemoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn-accent" type="button">
          Open Demo Mode
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,251,0.96))] text-foreground dark:bg-[linear-gradient(180deg,rgba(10,12,16,0.98),rgba(18,22,32,0.96))]">
        <DialogHeader>
          <div className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-primary">
            Demo launchpad
          </div>
          <DialogTitle className="text-2xl sm:text-3xl">Choose the demo surface</DialogTitle>
          <DialogDescription>
            Open a static demo page. No wallet connection is needed. Each route is prebuilt to look like the live product, but it stays completely read-only.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <DemoOption
            href="/worker/demo"
            title="Worker demo"
            description="See the earnings upload, score, and credit story with a worker-first walkthrough."
            accent="bg-[linear-gradient(90deg,#6fff00,#c8ff80)]"
          />
          <DemoOption
            href="/partner/demo"
            title="Partner demo"
            description="Review underwriting, portfolio, and credit decisioning in a static partner view."
            accent="bg-[linear-gradient(90deg,#76a9ff,#9f7bff)]"
          />
        </div>

        <DialogFooter className="sm:justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Built with shadcn dialog primitives</p>
          <DialogTrigger asChild>
            <button className="btn-subtle" type="button">
              Close
            </button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}