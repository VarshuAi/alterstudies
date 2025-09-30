"use client";
import { useEffect, useState } from "react";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { app as fb } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

const TOPICS = [
  "neet11-physics",
  "neet11-chem-organic","neet11-chem-inorganic","neet11-chem-physical",
  "neet11-bio-botany","neet11-bio-zoology",
  "neet12-physics",
  "neet12-chem-organic","neet12-chem-inorganic","neet12-chem-physical",
  "neet12-bio-botany","neet12-bio-zoology"
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const [supported, setSupported] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [subs, setSubs] = useState<Record<string,boolean>>({});

  useEffect(() => { (async () => setSupported(await isSupported()))(); }, []);

  async function enable() {
    if (!supported) return alert("Notifications not supported by this browser.");
    try {
      const messaging = getMessaging(fb);
      const vapid = process.env.NEXT_PUBLIC_FCM_VAPID_KEY!;
      const sw = await navigator.serviceWorker.ready;
      const t = await getToken(messaging, { vapidKey: vapid, serviceWorkerRegistration: sw });
      setToken(t);
      alert("Notifications enabled");
    } catch (e:any) { alert("Failed: " + (e?.message || e)); }
  }

  async function toggle(topic: string) {
    if (!token) return alert("Enable notifications first");
    const willSub = !subs[topic];
    setSubs(s => ({ ...s, [topic]: willSub }));
    const endpoint = willSub ? "/api/subscribe" : "/api/unsubscribe";
    try {
      await fetch(endpoint, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ token, topics: [topic] }) });
    } catch {
      setSubs(s => ({ ...s, [topic]: !willSub })); alert("Failed to update");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <div className="card p-4">
        <button className="btn" onClick={enable} disabled={!user}>Enable notifications</button>
        {!user && <div className="text-xs text-gray-600 mt-2">Sign in to manage topics.</div>}
        {token && <div className="text-xs text-gray-500 mt-2 break-all">Device token: {token.slice(0,12)}…</div>}
      </div>
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Subscribe to topics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TOPICS.map(t => (
            <label key={t} className="flex items-center gap-2 rounded border p-2">
              <input type="checkbox" checked={!!subs[t]} onChange={() => toggle(t)} />
              <span className="text-sm">{t.replace(/-/g," ")}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="text-xs text-gray-500">iOS requires installing the PWA (Add to Home Screen) to receive web push.</div>
    </div>
  );
}
