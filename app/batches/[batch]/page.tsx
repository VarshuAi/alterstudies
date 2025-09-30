"use client";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

type Lesson = {
  id: string;
  batch: 11 | 12;
  subject: "physics" | "chemistry" | "biology";
  subArea: "core" | "organic" | "inorganic" | "physical" | "botany" | "zoology";
  chapter: string;
  title: string;
  youtubeId: string;
  order?: number;
};

const SUBJECTS = ["physics", "chemistry", "biology"] as const;
const CHEM_TABS = ["organic", "inorganic", "physical"] as const;
const BIO_TABS = ["botany", "zoology"] as const;

export default function BatchPage({ params }: { params: { batch: string } }) {
  const batchNum = params.batch === "12" ? 12 : 11;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subject, setSubject] = useState<typeof SUBJECTS[number]>("physics");
  const [subTab, setSubTab] = useState<Lesson["subArea"]>("core");

  useEffect(() => {
    const q = query(
      collection(db, "lessons"),
      where("batch", "==", batchNum),
      orderBy("subject"), orderBy("subArea"), orderBy("chapter"), orderBy("order", "asc")
    );
    const unsub = onSnapshot(q, snap => setLessons(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))));
    return () => unsub();
  }, [batchNum]);

  useEffect(() => {
    if (subject === "chemistry") setSubTab("organic");
    else if (subject === "biology") setSubTab("botany");
    else setSubTab("core");
  }, [subject]);

  const filtered = useMemo(
    () => lessons.filter(l => l.subject === subject && (subject === "physics" ? l.subArea === "core" : l.subArea === subTab)),
    [lessons, subject, subTab]
  );

  const byChapter = useMemo(() => {
    const m = new Map<string, Lesson[]>();
    filtered.forEach(l => { const arr = m.get(l.chapter) || []; arr.push(l); m.set(l.chapter, arr); });
    return Array.from(m.entries());
  }, [filtered]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Class {batchNum}</h1>
      <div className="flex items-center gap-2">
        {SUBJECTS.map(s => (
          <button key={s} onClick={() => setSubject(s)} className={clsx("px-3 py-1.5 rounded", subject === s ? "bg-brand text-white" : "border")}>
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {subject === "chemistry" && (
        <div className="flex items-center gap-2">
          {CHEM_TABS.map(t => (
            <button key={t} onClick={() => setSubTab(t)} className={clsx("px-3 py-1.5 rounded", subTab === t ? "bg-brand text-white" : "border")}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      )}
      {subject === "biology" && (
        <div className="flex items-center gap-2">
          {BIO_TABS.map(t => (
            <button key={t} onClick={() => setSubTab(t)} className={clsx("px-3 py-1.5 rounded", subTab === t ? "bg-brand text-white" : "border")}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {byChapter.map(([chapter, list]) => (
          <div key={chapter} className="card p-4">
            <h3 className="font-semibold mb-2">{chapter}</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {list.map(lesson => (
                <a key={lesson.id} href={`/lesson/${lesson.id}`} className="rounded border p-3 hover:bg-gray-50">
                  <div className="text-sm text-gray-600">{lesson.subject} • {lesson.subArea}</div>
                  <div className="font-medium">{lesson.title}</div>
                </a>
              ))}
            </div>
          </div>
        ))}
        {byChapter.length === 0 && <div className="text-sm text-gray-500">No lessons yet. Ask admin to add content.</div>}
      </div>
    </div>
  );
}
