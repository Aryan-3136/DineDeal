import Link from "next/link";
import { offers } from "@/lib/data";
import { VerificationStatusBadge } from "@/components/VerificationStatusBadge";

export default function AdminOffersPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex justify-between"><h1 className="text-3xl font-semibold">Offers</h1><Link className="rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white" href="/admin/offers/new">Add offer</Link></div>
      <div className="mt-5 overflow-x-auto rounded-lg border border-ink/10 bg-white">
        <table className="min-w-[900px] w-full text-left text-sm">
          <tbody>{offers.map((offer) => <tr key={offer.id} className="border-t border-ink/8"><td className="p-3 font-medium">{offer.platform?.name}</td><td className="p-3">{offer.offer_text}</td><td className="p-3"><VerificationStatusBadge status={offer.verification_status} /></td><td className="p-3"><Link className="text-leaf" href={`/admin/offers/${offer.id}/edit`}>Edit</Link></td></tr>)}</tbody>
        </table>
      </div>
    </main>
  );
}
