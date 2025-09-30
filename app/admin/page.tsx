"use client";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
dayjs.extend(utc); dayjs.extend(tz);

const YT_IDS = {
  c11_physics_intro: "CqxY7Vcd3NY",
  c11_chem_physical_intro: "omv088xARm8",
  c11_bio_botany_intro: "PNlN0kY_Gno",
  c12_chem_organic_intro: "iSmEzprjSuM",
  c12_bio_zoology_intro: "dpQWI5ebdtY"
};

const TOPICS = [
  "neet11-physics",
  "neet11-chem-organic","neet11-chem-inorganic","neet11-chem-physical",
  "neet11-bio-botany","neet11-bio-zoology",
  "neet12-physics",
  "neet12-chem-organic","neet12-chem-inorganic","neet12-chem-physical",
  "neet12-bio-botany","neet12-bio-zoology"
];

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [form, setForm] = useState({ batch: 11 as 11|12, subject: "physics", subArea: "core", chapter: "Intro Lectures", title: "", youtubeId: "" });
  const [pdf, setPdf] = useState<File | null>(null);
  const [notify, setNotify] = useState({ topic: TOPICS[0], title: "New lecture is live", body: "Open AlterStudies to watch now", when: "" });

  if (!user) return <div>Please sign in.</div>;
  if (!isAdmin) return <div>You are not authorized.</div>;

  const seedDefaults = async () => {
    const seeds = [
      { batch: 11, subject: "physics",   subArea: "core",     chapter: "Intro Lectures", title: "Physics Intro",       youtubeId: YT_IDS.c11_physics_intro },
      { batch: 11, subject: "chemistry", subArea: "physical", chapter: "Intro Lectures", title: "Physical Chem Intro", youtubeId: YT_IDS.c11_chem_physical_intro },
      { batch: 11, subject: "biology",   subArea: "botany",   chapter: "Intro Lectures", title: "Botany Intro",        youtubeId: YT_IDS.c11_bio_botany_intro },
      { batch: 12, subject: "chemistry", subArea: "organic",  chapter: "Intro Lectures", title: "Organic Chem Intro",  youtubeId: YT_IDS.c12_chem_organic_intro },
      { batch: 12, subject: "biology",   subArea: "zoology",  chapter: "Intro Lectures", title: "Zoology Intro",       youtubeId: YT_IDS.c12_bio_zoology_intro }
    ] as any[];
    for (const s of seeds) await addDoc(collection(db, "lessons"), { ...s, order: 1, createdAt: serverTimestamp(), resources: [] });
    alert("Seeded 5 intro lectures.");
  };

  const addLesson = async () => {
    if (!form.title || !form.youtubeId) return alert("Title and YouTube ID required");
    const data: any = { ...form, order: 1, createdAt: serverTimestamp(), resources: [] };
    if (pdf) {
      const r = ref(storage, `resources/${Date.now()}_${pdf.name}`); await uploadBytes(r, pdf);
      const url = await getDownloadURL(r); data.resources.push({ type: "pdf", title: pdf.name, url });
    }
    await addDoc(collection(db, "lessons"), data);
    alert("Lesson added");
  };

  const seedTestBank = async () => {
    const mkQ = (cls: 11|12, subject: "physics"|"chemistry"|"biology", idx:number) => ({
      class: cls, subject,
      text: `[${subject.toUpperCase()} ${cls}] Sample Q${idx+1}`,
      options: ["Option A","Option B","Option C","Option D"],
      answer: (["A","B","C","D"][idx % 4]) as "A"|"B"|"C"|"D",
      explanation: "Placeholder explanation."
    });
    const batch:any[] = [];
    for (const cls of [11,12] as const) for (const sub of ["physics","chemistry","biology"] as const) for (let i=0;i<20;i++) batch.push(mkQ(cls, sub, i));
    for (const q of batch) await addDoc(collection(db, "questions"), q);
    alert("Seeded ~120 questions.");
  };

  const createMiniMocks = async () => {
    for (let i=1;i<=5;i++) for (const cls of [11,12] as const) {
      await addDoc(collection(db, "tests"), {
        title: `NEET Mini Mock #${i} (Class ${cls})`,
        class: cls, durationMin: 45, negativeMarking: 0.25,
        config: { physics: 10, chemistry: 10, biology: 10 },
        createdAt: serverTimestamp()
      });
    }
    alert("Created 10 tests.");
  };

  const scheduleNotification = async () => {
    if (!notify.when) return alert("Pick date & time");
    const scheduledAtUTC = dayjs.tz(notify.when, "Asia/Kolkata").utc().valueOf();
    await addDoc(collection(db, "notifications"), { topic: notify.topic, title: notify.title, body: notify.body, scheduledAtUTC, status: "queued", createdAt: serverTimestamp() });
    alert("Notification queued (IST → UTC). Netlify scheduled function will send it near that time.");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>

      <div className="card p-4 space-y-3">
        <h3 className="font-semibold">Seed default lectures</h3>
        <button className="btn" onClick={seedDefaults}>Seed</button>
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="font-semibold">Add lesson</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="label">Class</label>
          <div className="flex gap-2">
            <button className={`px-3 py-1.5 rounded border ${form.batch === 11 ? "bg-brand text-white" : ""}`} onClick={() => setForm({ ...form, batch: 11 })}>11</button>
            <button className={`px-3 py-1.5 rounded border ${form.batch === 12 ? "bg-brand text-white" : ""}`} onClick={() => setForm({ ...form, batch: 12 })}>12</button>
          </div>

          <label className="label">Subject</label>
          <select className="input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
          </select>

          <label className="label">Compartment</label>
          <select className="input" value={form.subArea} onChange={e => setForm({ ...form, subArea: e.target.value })}>
            {form.subject === "chemistry" && <>
              <option value="organic">Organic</option>
              <option value="inorganic">Inorganic</option>
              <option value="physical">Physical</option>
            </>}
            {form.subject === "biology" && <>
              <option value="botany">Botany</option>
              <option value="zoology">Zoology</option>
            </>}
            {form.subject === "physics" && <option value="core">Core</option>}
          </select>

          <label className="label">Chapter</label>
          <input className="input" value={form.chapter} onChange={e => setForm({ ...form, chapter: e.target.value })} placeholder="e.g., Kinematics" />

          <label className="label">Lecture Title</label>
          <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Lecture title" />

          <label className="label">YouTube ID</label>
          <input className="input" value={form.youtubeId} onChange={e => setForm({ ...form, youtubeId: e.target.value })} placeholder="e.g., CqxY7Vcd3NY" />

          <label className="label">Attach PDF (optional)</label>
          <input className="input" type="file" accept="application/pdf" onChange={e => setPdf(e.target.files?.[0] || null)} />
        </div>
        <button className="btn" onClick={addLesson}>Add Lesson</button>
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="font-semibold">Tests & Questions</h3>
        <div className="flex gap-2">
          <button className="btn" onClick={seedTestBank}>Seed test bank</button>
          <button className="btn" onClick={createMiniMocks}>Create 5 mini‑mocks/class</button>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="font-semibold">Schedule notification</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="label">Topic</label>
          <select className="input" value={notify.topic} onChange={e => setNotify({ ...notify, topic: e.target.value })}>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="label">Title</label>
          <input className="input" value={notify.title} onChange={e => setNotify({ ...notify, title: e.target.value })} />
          <label className="label">Body</label>
          <input className="input" value={notify.body} onChange={e => setNotify({ ...notify, body: e.target.value })} />
          <label className="label">When (IST)</label>
          <input className="input" type="datetime-local" value={notify.when} onChange={e => setNotify({ ...notify, when: e.target.value })} />
        </div>
        <button className="btn" onClick={scheduleNotification}>Queue Notification</button>
        <div className="text-xs text-gray-500">Netlify scheduled function runs every ~5 minutes.</div>
      </div>
    </div>
  );
}
