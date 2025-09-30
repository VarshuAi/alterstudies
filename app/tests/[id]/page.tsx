"use client";
import { useEffect, useRef, useState } from "react";
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function TestPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const tSnap = await getDoc(doc(db, "tests", params.id));
      if (!tSnap.exists()) { setLoading(false); return; }
      const t = { id: tSnap.id, ...tSnap.data() } as any;
      setTest(t);
      setTimeLeft((t.durationMin || 45) * 60);
      async function pick(sub: string, n: number) {
        const qs = await getDocs(query(collection(db, "questions"), where("class","==", t.class), where("subject","==", sub)));
        const pool = qs.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
        return pool.slice(0, n);
      }
      const collected = [
        ...(await pick("physics", t.config.physics)),
        ...(await pick("chemistry", t.config.chemistry)),
        ...(await pick("biology", t.config.biology))
      ];
      for (let i = collected.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [collected[i],collected[j]]=[collected[j],collected[i]]; }
      setQuestions(collected);
      const init: any = {}; collected.forEach(q => init[q.id] = ""); setAnswers(init);
      setLoading(false);
    })();
  }, [params.id]);

  useEffect(() => {
    if (loading || result) return;
    timerRef.current = setInterval(() => setTimeLeft(prev => {
      if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
      return prev - 1;
    }), 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, result]);

  const handleChoose = (qid: string, opt: string) => setAnswers(a => ({ ...a, [qid]: a[qid] === opt ? "" : opt }));

  const handleSubmit = async () => {
    if (result) return;
    const neg = test.negativeMarking || 0.25;
    let correct = 0, wrong = 0, empty = 0;
    const per: any = { physics: { c:0,w:0 }, chemistry: { c:0,w:0 }, biology: { c:0,w:0 } };
    questions.forEach((q: any) => {
      const ch = answers[q.id] || "";
      if (!ch) { empty++; return; }
      if (ch === q.answer) { correct++; per[q.subject].c++; }
      else { wrong++; per[q.subject].w++; }
    });
    const score = correct - wrong * neg;
    const breakdown = {
      physics: { correct: per.physics.c, wrong: per.physics.w },
      chemistry: { correct: per.chemistry.c, wrong: per.chemistry.w },
      biology: { correct: per.biology.c, wrong: per.biology.w }
    };
    try {
      if (user?.uid) await addDoc(collection(db, "attempts"), {
        testId: test.id, userId: user.uid, class: test.class,
        answers, score, correct, wrong, empty, breakdown, createdAt: serverTimestamp()
      });
    } catch {}
    setResult({ score, correct, wrong, empty, breakdown });
    clearInterval(timerRef.current);
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2,"0");
  const secs = (timeLeft % 60).toString().padStart(2,"0");

  if (loading) return <div>Loading test...</div>;
  if (!test) return <div>Test not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{test.title} (Class {test.class})</h1>
        <div className="px-3 py-1.5 rounded bg-black text-white">{mins}:{secs}</div>
      </div>
      {!result ? (
        <>
          <div className="text-sm text-gray-600">{test.durationMin} min • {questions.length} Q • −{test.negativeMarking}</div>
          <div className="space-y-4">
            {questions.map((q:any, idx:number) => (
              <div key={q.id} className="card p-4">
                <div className="text-sm text-gray-600 mb-1">Q{idx + 1} • {q.subject}</div>
                <div className="font-medium mb-2">{q.text}</div>
                <div className="grid md:grid-cols-2 gap-2">
                  {q.options.map((opt:string, oi:number) => {
                    const letter = ["A","B","C","D"][oi];
                    const active = answers[q.id] === letter;
                    return (
                      <button key={oi} onClick={() => handleChoose(q.id, letter)}
                              className={`text-left rounded border p-2 ${active ? "bg-brand text-white" : "hover:bg-gray-50"}`}>
                        <span className="font-semibold mr-2">{letter}.</span>{opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="btn" onClick={handleSubmit} disabled={questions.length === 0}>Submit</button>
          </div>
        </>
      ) : (
        <div className="card p-4">
          <h2 className="text-lg font-semibold">Result</h2>
          <div className="mt-2 text-sm">Score: <span className="font-semibold">{result.score.toFixed(2)}</span> • Correct: {result.correct} • Wrong: {result.wrong} • Unanswered: {result.empty}</div>
          <div className="mt-3 grid md:grid-cols-3 gap-3 text-sm">
            <div className="rounded border p-2">Physics — ✅ {result.breakdown.physics.correct} • ❌ {result.breakdown.physics.wrong}</div>
            <div className="rounded border p-2">Chemistry — ✅ {result.breakdown.chemistry.correct} • ❌ {result.breakdown.chemistry.wrong}</div>
            <div className="rounded border p-2">Biology — ✅ {result.breakdown.biology.correct} • ❌ {result.breakdown.biology.wrong}</div>
          </div>
          <a href="/tests" className="underline mt-3 inline-block">Back to Tests</a>
        </div>
      )}
    </div>
  );
}
