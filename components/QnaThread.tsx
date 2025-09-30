"use client";
import { useEffect, useState } from "react";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function QnaThread({ lessonId }: { lessonId: string }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "comments"), where("lessonId", "==", lessonId), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, snap => setMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [lessonId]);

  const post = async () => {
    if (!user || !text.trim()) return;
    await addDoc(collection(db, "comments"), {
      lessonId, text: text.trim(),
      userId: user.uid, userName: user.displayName || user.email,
      createdAt: serverTimestamp()
    });
    setText("");
  };

  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3">Q&A</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {msgs.map(m => (
          <div key={m.id} className="rounded bg-gray-50 p-2">
            <div className="text-sm font-medium">{m.userName}</div>
            <div className="text-sm">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Ask a question..." className="input" />
        <button className="btn" onClick={post} disabled={!user}>Post</button>
      </div>
      {!user && <div className="text-xs text-gray-500 mt-2">Sign in to ask questions.</div>}
    </div>
  );
}
