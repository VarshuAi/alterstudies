"use client";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  useEffect(() => {
    const q = query(collection(db, "tests"), orderBy("class", "asc"));
    const unsub = onSnapshot(q, s => setTests(s.docs.map(d => ({ id: d.id, ...d.data() } as any))));
    return () => unsub();
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Mini‑Mock Tests</h1>
      <div className="grid md:grid-cols-2 gap-3">
        {tests.map(t => (
          <a key={t.id} href={`/tests/${t.id}`} className="card p-4 hover:shadow-sm">
            <div className="text-sm text-gray-600">Class {t.class}</div>
            <div className="font-semibold">{t.title}</div>
            <div className="text-sm text-gray-600 mt-1">{t.durationMin} min • {t.config.physics + t.config.chemistry + t.config.biology} Q • −{t.negativeMarking}</div>
          </a>
        ))}
        {tests.length === 0 && <div className="card p-4 text-sm text-gray-600">No tests yet. Ask admin to create.</div>}
      </div>
    </div>
  );
}
