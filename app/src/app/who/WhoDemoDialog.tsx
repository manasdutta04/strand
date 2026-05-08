"use client";

import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";

function DemoOption({ href, title, description, accent }: { href: string; title: string; description: string; accent: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[#6FFF00]/40 hover:shadow-[0_18px_50px_rgba(111,255,0,0.15)]"
    >
      <div className={`mb-3 h-2 w-24 rounded-full ${accent}`} />
      <h3 className="font-grotesk text-lg font-semibold tracking-tight text-[#EFF4FF]">{title}</h3>
      <p className="mt-2 font-mono text-sm text-[#EFF4FF]/75">{description}</p>
      <div className="mt-4 font-grotesk text-xs uppercase tracking-[0.2em] text-[#6FFF00] transition-transform group-hover:translate-x-1">
        Open
      </div>
    </Link>
  );
}

export function WhoDemoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="rounded-full border border-[#6FFF00] px-6 py-3 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF] bg-[#6FFF00]/10 transition-colors hover:bg-[#6FFF00]/20" type="button">
          Open Demo Mode
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl border border-white/10 bg-[#010828] text-[#EFF4FF] backdrop-blur-sm">
        <DialogHeader>
          <div className="inline-flex w-fit items-center rounded-full border border-[#6FFF00]/20 bg-[#6FFF00]/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-[#6FFF00]">
            Demo launchpad
          </div>
          <DialogTitle className="font-grotesk text-2xl text-[#EFF4FF] sm:text-3xl">Choose the demo surface</DialogTitle>
          <DialogDescription className="font-mono text-[#EFF4FF]/75">
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
          <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Built with shadcn dialog primitives</p>
          <DialogTrigger asChild>
            <button className="rounded-full border border-white/15 px-5 py-2 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF] transition-colors hover:border-[#6FFF00] hover:text-[#6FFF00]" type="button">
              Close
            </button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}