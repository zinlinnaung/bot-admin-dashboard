import { ArrowRight, Bot, CheckCircle2, CreditCard, Gamepad2, Gift, Headphones, Menu, ShieldCheck, Sparkles, Wifi, X, Zap } from "lucide-react";
import { useState } from "react";

const BOT_LINK = "https://t.me/trustvpn_digital_bot?start=src_landing";
const RESELLER_LINK = "https://t.me/trustvpn_digital_bot?start=reseller";

const products = [
  { icon: Gamepad2, title: "MLBB Diamonds", text: "Mobile Legends Diamonds များကို လွယ်ကူမြန်ဆန်စွာ ဝယ်ယူနိုင်ပါသည်။", tone: "from-violet-500 to-fuchsia-500" },
  { icon: Gift, title: "Gift Cards", text: "App Store၊ iTunes နှင့် အခြား digital gift cards များ ရရှိနိုင်ပါသည်။", tone: "from-amber-400 to-orange-500" },
  { icon: Wifi, title: "Premium VPN", text: "လုံခြုံမြန်ဆန်သော VPN packages၊ usage checker နှင့် automatic key delivery။", tone: "from-cyan-400 to-blue-600" },
  { icon: Sparkles, title: "Subscriptions", text: "အသုံးများသော premium apps နှင့် digital subscriptions များ။", tone: "from-emerald-400 to-teal-600" },
  { icon: CreditCard, title: "Digital Products", text: "Gaming၊ productivity နှင့် entertainment digital products များ။", tone: "from-blue-500 to-indigo-600" },
  { icon: Bot, title: "Smart Bot Service", text: "Telegram Bot မှ order၊ payment နှင့် customer support ကို တစ်နေရာတည်းမှာဆောင်ရွက်နိုင်ပါသည်။", tone: "from-rose-400 to-pink-600" },
];

export default function DigitalStoreApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const goBot = () => window.open(BOT_LINK, "_blank", "noopener,noreferrer");
  return (
    <div className="min-h-screen overflow-hidden bg-[#030817] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(14,165,233,.18),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(124,58,237,.18),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(6,182,212,.12),transparent_35%)]" />
      <header className="relative z-20 border-b border-white/10 bg-[#030817]/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-3"><img src="/game-gear-mm-logo.png" className="h-12 w-12 rounded-full border border-cyan-300/40 object-cover" alt="Game Gear MM logo" /><div><div className="font-black tracking-wide">GAME GEAR MM</div><div className="text-[10px] tracking-[.22em] text-cyan-300">DIGITAL STORE</div></div></a>
          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex"><a href="#products" className="hover:text-cyan-300">Products</a><a href="#why-us" className="hover:text-cyan-300">Why Us</a><a href="#reseller" className="hover:text-cyan-300">Reseller</a><button onClick={goBot} className="rounded-full bg-cyan-400 px-5 py-2.5 font-bold text-slate-950">Bot မှာဝယ်မည်</button></div>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">{menuOpen ? <X /> : <Menu />}</button>
        </nav>
        {menuOpen && <div className="space-y-2 border-t border-white/10 p-5 md:hidden"><a href="#products" onClick={() => setMenuOpen(false)} className="block rounded-xl p-3 hover:bg-white/5">Products</a><a href="#why-us" onClick={() => setMenuOpen(false)} className="block rounded-xl p-3 hover:bg-white/5">Why Us</a><a href="#reseller" onClick={() => setMenuOpen(false)} className="block rounded-xl p-3 hover:bg-white/5">Reseller Program</a><button onClick={goBot} className="mt-2 w-full rounded-xl bg-cyan-400 p-3 font-bold text-slate-950">Bot မှာဝယ်မည်</button></div>}
      </header>

      <main id="top" className="relative z-10">
        <section className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          <div><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold text-cyan-200"><Zap size={14} /> DIGITAL PRODUCTS • FAST DELIVERY</div><h1 className="max-w-3xl text-5xl font-black leading-[1.08] sm:text-6xl lg:text-7xl">Gaming နဲ့ Digital Lifestyle အတွက် <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">ယုံကြည်ရသော Store</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Gift Cards၊ MLBB Diamonds၊ Premium VPN၊ Digital Products နှင့် Subscriptions များကို Telegram Bot မှ လွယ်ကူလုံခြုံစွာ ဝယ်ယူနိုင်ပါသည်။</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><button onClick={goBot} className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-4 font-black text-slate-950 shadow-xl shadow-cyan-500/20">Products ကြည့်မည် <ArrowRight className="transition group-hover:translate-x-1" /></button><a href="#products" className="flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-7 py-4 font-bold hover:bg-white/10">ဘာတွေဝယ်လို့ရလဲ?</a></div><div className="mt-9 flex flex-wrap gap-5 text-sm text-slate-400"><span className="flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={17} /> မြန်ဆန်သော service</span><span className="flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={17} /> Telegram support</span><span className="flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={17} /> Order tracking</span></div></div>
          <div className="relative mx-auto w-full max-w-[520px]"><div className="absolute inset-8 rounded-full bg-cyan-400/20 blur-3xl" /><div className="relative rotate-2 rounded-[2.5rem] border border-cyan-300/20 bg-gradient-to-b from-white/10 to-white/[.03] p-5 shadow-2xl shadow-blue-950"><img src="/game-gear-mm-logo.png" alt="Game Gear MM" className="aspect-square w-full rounded-[2rem] object-cover" /><div className="absolute -bottom-5 -left-5 rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-xl backdrop-blur"><div className="text-xs text-slate-400">Available 24/7</div><div className="mt-1 flex items-center gap-2 font-bold"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Telegram Bot</div></div></div></div>
        </section>

        <section id="products" className="border-y border-white/10 bg-white/[.025] py-24"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold tracking-[.2em] text-cyan-300">AVAILABLE PRODUCTS</p><h2 className="mt-3 text-4xl font-black">လိုအပ်တဲ့ Digital Product ကို ရွေးချယ်ပါ</h2><p className="mt-4 text-slate-400">Product အသေးစိတ်နှင့် လက်ရှိဈေးနှုန်းကို Telegram Bot မှ တိုက်ရိုက်ကြည့်နိုင်ပါသည်။</p></div><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map(({ icon: Icon, title, text, tone }) => <button key={title} onClick={goBot} className="group rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-left transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-slate-900"><div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${tone} shadow-lg`}><Icon /></div><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">{text}</p><span className="mt-5 flex items-center gap-2 text-sm font-bold text-cyan-300">Bot မှာကြည့်မည် <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span></button>)}</div></div></section>

        <section id="why-us" className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><div className="grid gap-10 lg:grid-cols-2 lg:items-center"><div><p className="text-sm font-bold tracking-[.2em] text-cyan-300">WHY GAME GEAR MM</p><h2 className="mt-3 text-4xl font-black">ဝယ်ယူမှုတိုင်းကို လွယ်ကူရှင်းလင်းအောင်</h2><p className="mt-5 leading-7 text-slate-400">Bot မှ product ရွေးချယ်ခြင်း၊ payment တင်ခြင်း၊ order status စစ်ခြင်းနှင့် customer support တောင်းခံခြင်းတို့ကို အဆင့်လိုက်ဆောင်ရွက်နိုင်ပါသည်။</p></div><div className="grid gap-4 sm:grid-cols-2"><Feature icon={ShieldCheck} title="Secure Process" text="Payment နှင့် order records များကို စနစ်တကျသိမ်းဆည်းထားပါသည်။" /><Feature icon={Zap} title="Fast Service" text="Digital delivery အတွက် လျင်မြန်သော process ကိုအသုံးပြုထားပါသည်။" /><Feature icon={Headphones} title="Customer Support" text="Bot မှတစ်ဆင့် အကူအညီတောင်းခံနိုင်ပါသည်။" /><Feature icon={Bot} title="Proto-X AI" text="Business နှင့် order ဆိုင်ရာမေးခွန်းများကို မြန်မာလိုမေးနိုင်ပါသည်။" /></div></div></section>

        <section id="reseller" className="mx-auto max-w-7xl px-5 pb-24 lg:px-8"><div className="overflow-hidden rounded-[2.5rem] border border-violet-300/20 bg-gradient-to-r from-blue-950 via-indigo-950 to-violet-950 p-8 sm:p-12"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-sm font-bold tracking-[.2em] text-violet-300">RESELLER PROGRAM</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">ကိုယ်ပိုင် Digital VPN Business စတင်လိုပါသလား?</h2><p className="mt-4 max-w-2xl leading-7 text-slate-300">ကိုယ်ပိုင် reseller dashboard၊ key usage tracking၊ wallet နှင့် sales records များဖြင့် သင့်လုပ်ငန်းကို စနစ်တကျစတင်နိုင်ပါသည်။ Reseller နေရာအရေအတွက် ကန့်သတ်ထားပါသည်။</p></div><a href={RESELLER_LINK} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 font-black text-slate-950">အသေးစိတ်ကြည့်မည် <ArrowRight /></a></div></div></section>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-5 py-8"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center text-sm text-slate-500 sm:flex-row"><div className="flex items-center gap-3"><img src="/game-gear-mm-logo.png" className="h-9 w-9 rounded-full object-cover" alt="" /><span>© 2026 Game Gear MM</span></div><span>Digital products made simple • Powered by Proto-X AI</span></div></footer>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><Icon className="text-cyan-300" /><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></div>;
}
