import { redirect } from "next/navigation";
import { ReceiptUpload } from "@/components/ReceiptUpload";
import { requireAuthUser } from "@/lib/auth/server";
import { linkedTelegramUserId } from "@/lib/auth/linkedUser";
import { isGuestDemo } from "@/lib/guestDemo";

export const dynamic = "force-dynamic";
export default async function UploadPage() {
  const user = await requireAuthUser();
  if (!user && await isGuestDemo()) return <main className="mx-auto max-w-5xl px-5 py-12"><p className="eyebrow">Guest demo</p><h1 className="mt-3 text-5xl font-black tracking-tight">Try a receipt upload.</h1><p className="mt-4 max-w-2xl text-[#526259]">Choose any image to experience the review flow. Guest mode uses safe sample results and does not upload or save your image.</p><ReceiptUpload guestDemo/></main>;
  if (!user) redirect("/login");
  const linked = await linkedTelegramUserId(user.id);
  return <main className="mx-auto max-w-5xl px-5 py-12"><p className="eyebrow">Receipt upload</p><h1 className="mt-3 text-5xl font-black tracking-tight">Add groceries from the web.</h1><p className="mt-4 max-w-2xl text-[#526259]">Your image is processed transiently and is not retained. Review the extracted products before adding them to your pantry.</p>{linked ? <ReceiptUpload/> : <div className="card mt-8 max-w-xl p-6"><h2 className="text-2xl font-black">Link Telegram first</h2><p className="mt-2 text-[#526259]">Linking connects this secure web account to the pantry identity used by the bot.</p><a href="/telegram" className="button mt-5 bg-[#164b35] text-white">Link Telegram</a></div>}</main>;
}
