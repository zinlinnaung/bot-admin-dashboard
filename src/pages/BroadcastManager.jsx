import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  AlertTriangle, Bold, Bot, CheckCircle2, Copy, Italic, Loader2,
  MessageSquare, Plus, RefreshCw, Send, SmilePlus, Trash2, Users, Zap,
} from "lucide-react";

const API_URL = "https://api.prototypeconnect.xyz/admin";

const previewMessage = (message) => message
  .replace(/<tg-emoji\s+emoji-id="\d+">([^<]*)<\/tg-emoji>/gi, "$1")
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<\/?(?:b|strong|i|em|u|ins|s|strike|del|code)>/gi, "")
  .replace(/<tg-spoiler>(.*?)<\/tg-spoiler>/gi, "▰▰▰▰")
  .replace(/<[^>]+>/g, "");

export default function BroadcastManager() {
  const textareaRef = useRef(null);
  const [message, setMessage] = useState("");
  const [btnText, setBtnText] = useState("");
  const [btnUrl, setBtnUrl] = useState("");
  const [isCallback, setIsCallback] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);
  const [emojis, setEmojis] = useState([]);
  const [emojiLoading, setEmojiLoading] = useState(true);
  const [newEmoji, setNewEmoji] = useState({ customEmojiId: "", fallback: "✨", label: "" });

  const fetchEmojis = useCallback(async () => {
    setEmojiLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/custom-emojis`);
      setEmojis(Array.isArray(data) ? data : []);
    } catch {
      setEmojis([]);
    } finally {
      setEmojiLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmojis(); }, [fetchEmojis]);

  const insertText = (value) => {
    const input = textareaRef.current;
    const start = input?.selectionStart ?? message.length;
    const end = input?.selectionEnd ?? start;
    setMessage(`${message.slice(0, start)}${value}${message.slice(end)}`);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + value.length, start + value.length);
    });
  };

  const wrapSelection = (tag) => {
    const input = textareaRef.current;
    const start = input?.selectionStart ?? message.length;
    const end = input?.selectionEnd ?? start;
    const selected = message.slice(start, end) || "စာသား";
    insertText(`<${tag}>${selected}</${tag}>`);
  };

  const insertEmoji = (emoji) => {
    insertText(`<tg-emoji emoji-id="${emoji.customEmojiId}">${emoji.fallback || "✨"}</tg-emoji>`);
  };

  const saveEmoji = async () => {
    if (!/^\d+$/.test(newEmoji.customEmojiId.trim())) {
      alert("မှန်ကန်သော Custom Emoji ID ထည့်ပါ။");
      return;
    }
    try {
      await axios.post(`${API_URL}/custom-emojis`, newEmoji);
      setNewEmoji({ customEmojiId: "", fallback: "✨", label: "" });
      await fetchEmojis();
    } catch (error) {
      alert(error.response?.data?.message || "Emoji သိမ်း၍မရပါ။");
    }
  };

  const removeEmoji = async (id) => {
    if (!window.confirm("ဒီ emoji ကို keyboard မှဖယ်ရှားမလား?")) return;
    await axios.delete(`${API_URL}/custom-emojis/${id}`);
    setEmojis((current) => current.filter((emoji) => emoji.id !== id));
  };

  const handleSendBroadcast = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    if (message.length > 4096) {
      alert("Telegram message သည် စာလုံး 4096 ထက် မကျော်ရပါ။");
      return;
    }
    if (btnText && !btnUrl.trim()) {
      alert(isCallback ? "Callback data ထည့်ပါ။" : "Button URL ထည့်ပါ။");
      return;
    }
    if (!window.confirm("Customer အားလုံးထံ Broadcast ပို့ရန် အတည်ပြုပါသလား?")) return;

    setIsSending(true);
    setResult(null);
    try {
      const { data } = await axios.post(`${API_URL}/broadcast`, {
        message,
        buttons: btnText ? [[{ text: btnText, [isCallback ? "callback_data" : "url"]: btnUrl }]] : [],
      });
      setResult(data);
      setMessage("");
      setBtnText("");
      setBtnUrl("");
    } catch (error) {
      alert(error.response?.data?.message || "Broadcast စတင်၍မရပါ။");
    } finally {
      setIsSending(false);
    }
  };

  const renderedPreview = useMemo(() => previewMessage(message), [message]);

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-bold text-indigo-600">Customer Communication</p><h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Broadcast Studio</h1><p className="mt-2 text-sm text-slate-500">Customer အားလုံးထံ HTML message နဲ့ animated custom emoji များ ပို့နိုင်ပါသည်။</p></div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700"><Users size={15} /> All active customers</div>
      </header>

      {result && <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="mt-0.5 shrink-0" size={19} /><div><p className="font-black">Broadcast စတင်ပြီးပါပြီ</p><p className="mt-1 text-xs">{result.message} ခန့်မှန်းကြာချိန် {result.estimatedTimeMinutes || 1} မိနစ်။</p></div></div>}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3"><div className="rounded-2xl bg-indigo-600 p-3 text-white"><MessageSquare size={20} /></div><div><h2 className="font-black text-slate-900">Message Composer</h2><p className="text-xs text-slate-400">Telegram HTML formatting supported</p></div></div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between"><div><h3 className="flex items-center gap-2 text-sm font-black text-slate-800"><SmilePlus size={17} className="text-violet-600" /> Animated Emoji Keyboard</h3><p className="mt-1 text-[11px] text-slate-500">Bot ထဲမှာ emoji ကို Reply လုပ်ပြီး <code>/emoji_id</code> ပို့လျှင် ဒီမှာအလိုအလျောက်ပေါ်ပါမယ်။</p></div><button onClick={fetchEmojis} className="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-indigo-600"><RefreshCw size={17} className={emojiLoading ? "animate-spin" : ""} /></button></div>
            <div className="flex min-h-14 flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
              {emojis.map((emoji) => <div key={emoji.id} className="group relative"><button type="button" onClick={() => insertEmoji(emoji)} title={`${emoji.label || "Custom Emoji"} • ${emoji.customEmojiId}`} className="grid h-11 min-w-11 place-items-center rounded-xl bg-slate-100 px-2 text-xl transition hover:bg-violet-100 hover:scale-105">{emoji.fallback || "✨"}</button><button type="button" onClick={() => removeEmoji(emoji.id)} className="absolute -right-1 -top-1 hidden h-5 w-5 place-items-center rounded-full bg-rose-500 text-white shadow group-hover:grid"><Trash2 size={11} /></button></div>)}
              {!emojiLoading && !emojis.length && <p className="self-center px-2 text-xs text-slate-400">မှတ်ထားသော custom emoji မရှိသေးပါ။</p>}
            </div>
            <details className="mt-3"><summary className="cursor-pointer text-xs font-bold text-indigo-600">Emoji ID ကို manually ထည့်မည်</summary><div className="mt-3 grid gap-2 sm:grid-cols-[90px_1fr_1fr_auto]"><input value={newEmoji.fallback} onChange={(e) => setNewEmoji({ ...newEmoji, fallback: e.target.value })} maxLength={8} placeholder="✨" className="rounded-xl border border-slate-200 px-3 py-2.5 text-center" /><input value={newEmoji.customEmojiId} onChange={(e) => setNewEmoji({ ...newEmoji, customEmojiId: e.target.value })} placeholder="Emoji ID" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /><input value={newEmoji.label} onChange={(e) => setNewEmoji({ ...newEmoji, label: e.target.value })} placeholder="Label (optional)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /><button type="button" onClick={saveEmoji} className="grid place-items-center rounded-xl bg-indigo-600 px-4 text-white"><Plus size={18} /></button></div></details>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-5">
            <div><div className="mb-2 flex items-center justify-between"><label className="text-xs font-black uppercase tracking-wider text-slate-500">Message</label><span className={`text-xs font-bold ${message.length > 4096 ? "text-rose-600" : "text-slate-400"}`}>{message.length}/4096</span></div><div className="mb-2 flex gap-2"><button type="button" onClick={() => wrapSelection("b")} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Bold size={16} /></button><button type="button" onClick={() => wrapSelection("i")} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Italic size={16} /></button><button type="button" onClick={() => navigator.clipboard.writeText(message)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Copy size={16} /></button></div><textarea ref={textareaRef} rows={9} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Customer များထံပို့မည့် message…" className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/5" /></div>

            <div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">Button Text</label><input value={btnText} onChange={(e) => setBtnText(e.target.value)} placeholder="ဥပမာ — အခုပဲဝယ်မည်" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></div><div><div className="mb-2 flex items-center justify-between"><label className="text-xs font-black uppercase tracking-wider text-slate-500">{isCallback ? "Callback Data" : "Button URL"}</label><button type="button" onClick={() => setIsCallback(!isCallback)} className={`flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-black ${isCallback ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"}`}><Zap size={10} /> Callback</button></div><input value={btnUrl} onChange={(e) => setBtnUrl(e.target.value)} placeholder={isCallback ? "shop_main" : "https://t.me/…"} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></div></div>

            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><p>Send နှိပ်ပြီးပါက customer အားလုံးထံ background worker ဖြင့် ပို့ပါမည်။ Message နှင့် button ကို အရင် Preview စစ်ပါ။</p></div>
            <button type="submit" disabled={isSending || !message.trim() || message.length > 4096} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-xl shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-50">{isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Broadcast to all customers</button>
          </form>
        </section>

        <aside className="h-fit rounded-3xl bg-slate-950 p-5 text-white shadow-2xl sm:p-7 xl:sticky xl:top-24">
          <div className="flex items-center gap-2 text-slate-400"><Bot size={17} /><span className="text-xs font-black uppercase tracking-wider">Telegram Preview</span></div>
          <div className="mt-6 min-h-52 rounded-3xl bg-[#dfe7ed] p-4"><div className="max-w-[92%] rounded-2xl rounded-tl-md bg-white p-4 text-sm leading-6 text-slate-800 shadow-md"><p className="whitespace-pre-wrap break-words">{renderedPreview || <span className="italic text-slate-400">Message preview ဒီမှာပေါ်ပါမယ်…</span>}</p>{btnText && <div className="mt-3 border-t border-slate-100 pt-2 text-center text-xs font-black text-[#2481cc]">{btnText}</div>}<p className="mt-2 text-right text-[9px] text-slate-400">now ✓✓</p></div></div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4"><h3 className="text-xs font-black text-cyan-300">Custom emoji preview အကြောင်း</h3><p className="mt-2 text-xs leading-5 text-slate-400">Web preview တွင် fallback emoji ကိုပြပါမယ်။ Telegram သို့ရောက်တဲ့အခါ Premium animated emoji အဖြစ် လှုပ်ရှားပြသပါမယ်။</p></div>
        </aside>
      </div>
    </div>
  );
}
