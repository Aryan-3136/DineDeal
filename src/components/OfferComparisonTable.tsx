"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import type { ComparedOffer } from "@/types/comparison";
import { formatDateTime } from "@/lib/dateTime";
import { formatINR } from "@/lib/money";
import { VerificationStatusBadge } from "./VerificationStatusBadge";

function sourceHref(item: ComparedOffer) {
  return item.offer.source_url || item.offer.offer_url || "#";
}

function detailLines(item: ComparedOffer) {
  return [
    `Valid now: ${item.valid ? "Yes" : item.invalid_reasons.join(", ") || item.status}`,
    item.offer.minimum_bill ? `Min bill: ${formatINR(item.offer.minimum_bill)}` : null,
    item.offer.maximum_discount_cap ? `Max cap: ${formatINR(item.offer.maximum_discount_cap)}` : null,
    item.offer.membership_required ? `Membership: ${item.offer.membership_text || "Required"}` : null,
    item.offer.payment_required ? `Payment: ${item.offer.payment_text || "Required"}` : null,
    item.offer.valid_days?.length ? `Valid days: ${item.offer.valid_days.join(", ")}` : null,
    item.offer.valid_start_time || item.offer.valid_end_time ? `Valid time: ${item.offer.valid_start_time || "All day"}-${item.offer.valid_end_time || ""}` : null,
    item.cashback_value > 0 ? `Cashback value: ${formatINR(item.cashback_value)}` : null,
    item.offer.alcohol_included === false ? "Alcohol may be excluded" : null,
    item.offer.service_charge_included === false ? "Service charge may be excluded" : null,
    item.offer.booking_required ? "Booking required" : null,
    `Verification: ${item.offer.verification_status.replace("_", " ")}`,
    `Last checked: ${formatDateTime(item.offer.last_checked_at)}`,
    item.offer.terms_text || null,
    ...item.warnings
  ].filter(Boolean) as string[];
}

function Details({ item }: { item: ComparedOffer }) {
  return (
    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink/65">
      {detailLines(item).map((line, index) => <li key={`${item.offer.id}-${index}`}>{line}</li>)}
    </ul>
  );
}

function DetailsButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-semibold text-ink/65 hover:bg-cream">
      View details <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} />
    </button>
  );
}

function OfferMobileCard({ item }: { item: ComparedOffer }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold">{item.platform_name}</div>
        <VerificationStatusBadge status={item.offer.verification_status} />
      </div>
      <p className="mt-3 text-sm font-medium">{item.offer.offer_text}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-ink/55">You save</div>
          <div className="text-xl font-semibold text-leaf">{formatINR(item.instant_saving)}</div>
          {item.cashback_value > 0 ? <div className="text-xs text-ink/55">Cashback {formatINR(item.cashback_value)}</div> : null}
        </div>
        <div>
          <div className="text-xs text-ink/55">Final payable</div>
          <div className="text-lg font-semibold">{formatINR(item.final_payable)}</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-ink/55">
        {item.offer.minimum_bill ? `Min ${formatINR(item.offer.minimum_bill)}` : "No min bill listed"}
        {" / "}
        {item.offer.maximum_discount_cap ? `Cap ${formatINR(item.offer.maximum_discount_cap)}` : "No cap listed"}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a className="inline-flex items-center gap-1 rounded-full bg-leaf px-3 py-1.5 text-xs font-semibold text-white" href={sourceHref(item)} target="_blank" rel="noreferrer">Open Source <ExternalLink size={13} /></a>
        <DetailsButton open={open} onClick={() => setOpen((value) => !value)} />
      </div>
      <div className="mt-2 text-xs text-ink/50">Last checked: {formatDateTime(item.offer.last_checked_at)}</div>
      {open ? <Details item={item} /> : null}
    </article>
  );
}

function OfferDesktopRow({ item }: { item: ComparedOffer }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr className="border-t border-ink/8 align-top">
        <td className="px-4 py-4">
          <div className="font-semibold">{item.platform_name}</div>
          <div className="mt-2"><VerificationStatusBadge status={item.offer.verification_status} /></div>
        </td>
        <td className="px-4 py-4">
          <div className="max-w-xl font-medium">{item.offer.offer_text}</div>
          <div className="mt-1 text-xs text-ink/50">
            {item.offer.minimum_bill ? `Min ${formatINR(item.offer.minimum_bill)}` : ""}
            {item.offer.minimum_bill && item.offer.maximum_discount_cap ? " / " : ""}
            {item.offer.maximum_discount_cap ? `Cap ${formatINR(item.offer.maximum_discount_cap)}` : ""}
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="text-lg font-semibold text-leaf">{formatINR(item.instant_saving)}</div>
          {item.cashback_value > 0 ? <div className="text-xs text-ink/55">Cashback {formatINR(item.cashback_value)}</div> : null}
        </td>
        <td className="px-4 py-4 font-semibold">{formatINR(item.final_payable)}</td>
        <td className="px-4 py-4">
          <a className="inline-flex items-center gap-1 rounded-full bg-leaf px-3 py-1.5 text-xs font-semibold text-white" href={sourceHref(item)} target="_blank" rel="noreferrer">Open <ExternalLink size={13} /></a>
          <div className="mt-2 text-xs text-ink/50">{formatDateTime(item.offer.last_checked_at)}</div>
        </td>
        <td className="px-4 py-4"><DetailsButton open={open} onClick={() => setOpen((value) => !value)} /></td>
      </tr>
      {open ? (
        <tr className="border-t border-ink/5 bg-cream/60">
          <td colSpan={6} className="px-4 py-4"><Details item={item} /></td>
        </tr>
      ) : null}
    </>
  );
}

function UnavailableOffers({ offers }: { offers: ComparedOffer[] }) {
  const [open, setOpen] = useState(false);
  if (!offers.length) return null;
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between text-left font-semibold">
        Unavailable offers ({offers.length})
        <ChevronDown size={18} className={open ? "rotate-180 transition" : "transition"} />
      </button>
      {open ? (
        <div className="mt-4 space-y-3">
          {offers.map((item) => <OfferMobileCard key={item.offer.id} item={item} />)}
        </div>
      ) : null}
    </section>
  );
}

export function OfferComparisonTable({ offers, invalidOffers = [] }: { offers: ComparedOffer[]; invalidOffers?: ComparedOffer[] }) {
  const mainOffers = offers.filter((item) => item.valid);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:hidden">
        {mainOffers.map((item) => <OfferMobileCard key={item.offer.id} item={item} />)}
      </div>
      <div className="hidden rounded-lg border border-ink/10 bg-white md:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-cream text-xs uppercase text-ink/60">
            <tr>
              {["Platform", "Offer", "Saving", "Final Payable", "Source", "Details"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}
            </tr>
          </thead>
          <tbody>{mainOffers.map((item) => <OfferDesktopRow key={item.offer.id} item={item} />)}</tbody>
        </table>
      </div>
      {!mainOffers.length ? <div className="rounded-lg border border-ink/10 bg-white p-4 text-sm text-ink/65">No currently valid offers for this input.</div> : null}
      <UnavailableOffers offers={invalidOffers} />
    </div>
  );
}
