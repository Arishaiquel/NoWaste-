import { TelegramLinkButton } from "@/components/TelegramLinkButton";
import { requireAuthUser } from "@/lib/auth/server";
import { linkedTelegramUserId } from "@/lib/auth/linkedUser";

export const dynamic = "force-dynamic";

export default async function TelegramPage() {
  const user = await requireAuthUser();
  const linked = user ? Boolean(await linkedTelegramUserId(user.id)) : false;
  return <main className="mx-auto max-w-5xl px-5 pb-12 pt-10">
    <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
      <div>
        <p className="eyebrow">Telegram Bot</p>
        <h1 className="mt-4 text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl">Turn a receipt into your digital pantry.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#526259]">Open NoWaste! in Telegram, send a clear photo of your grocery receipt, and confirm the items the bot finds.</p>
        <a href="/api/telegram/open" target="_blank" rel="noreferrer" className="button mt-8 inline-flex bg-[#164b35] text-white">Open NoWaste! on Telegram →</a>
        {user ? linked ? <p className="mt-4 font-bold text-[#287557]">✓ Telegram is linked to this account.</p> : <TelegramLinkButton/> : <p className="mt-4 text-sm"><a href="/login" className="font-black text-[#164b35] underline">Sign in</a> to link Telegram and keep your pantry private.</p>}
        <p className="mt-4 text-sm text-[#68766e]">The Telegram app or web version will open in a new tab.</p>
      </div>

      <div className="card overflow-hidden p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-[#164b3520] pb-5">
          <span className="grid size-11 place-items-center rounded-full bg-[#229ed9] text-xl text-white" aria-hidden="true">✈</span>
          <div><strong className="block text-lg">NoWaste!</strong><span className="text-sm text-[#68766e]">Telegram receipt assistant</span></div>
        </div>
        <ol className="mt-6 space-y-5">
          <li className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#dff1e8] font-black text-[#164b35]">1</span><div><strong>Open the bot</strong><p className="mt-1 text-sm leading-6 text-[#68766e]">Tap the button and press Start in Telegram.</p></div></li>
          <li className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#dff1e8] font-black text-[#164b35]">2</span><div><strong>Send your receipt</strong><p className="mt-1 text-sm leading-6 text-[#68766e]">Attach a clear, complete photo of your grocery receipt.</p></div></li>
          <li className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#dff1e8] font-black text-[#164b35]">3</span><div><strong>Confirm your groceries</strong><p className="mt-1 text-sm leading-6 text-[#68766e]">Review the detected items, then add them to your pantry.</p></div></li>
        </ol>
      </div>
    </section>
  </main>;
}
