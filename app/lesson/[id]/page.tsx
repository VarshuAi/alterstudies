"use client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import WatermarkedPlayer from "@/components/WatermarkedPlayer";
import QnaThread from "@/components/QnaThread";

export default function LessonPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "lessons", params.id));
      if (snap.exists()) setLesson({ id: snap.id, ...snap.data() });
    })();
  }, [params.id]);

  const markComplete = async () => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "progress", params.id), { lessonId: params.id, completed: true }, { merge: true });
  };

  if (!lesson) return <div>Loading...</div>;

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-2">
          <WatermarkedPlayer videoId={lesson.youtubeId} user={user} lessonId={lesson.id} />
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded border" onClick={markComplete} disabled={!user}>Mark complete</button>
          <a className="px-3 py-1.5 rounded border" href={`/batches/${lesson.batch}`}>Back to Class {lesson.batch}</a>
        </div>
      </div>
      <div className="space-y-4">
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Notes</h3>
          {(lesson.resources || []).length === 0 && <div className="text-sm text-gray-500">No notes yet.</div>}
          <ul className="text-sm space-y-2">
            {(lesson.resources || []).map((r: any, i: number) => (
              <li key={i}><a href={r.url} target="_blank" className="underline">{r.title || r.url}</a></li>
            ))}
          </ul>
        </div>
        <QnaThread lessonId={params.id} />
        <div className="text-xs text-gray-500">On iOS fullscreen, the watermark overlay may not be visible due to platform limits.</div>
      </div>
    </div>
  );
}
