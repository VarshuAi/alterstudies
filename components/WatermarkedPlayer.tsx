"use client";
import YouTube from "react-youtube";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export default function WatermarkedPlayer({
  videoId, user, lessonId
}: { videoId: string; user: { uid?: string; displayName?: string | null; email?: string | null } | null; lessonId: string; }) {
  const [pos, setPos] = useState({ top: 10, left: 10 });
  const playerRef = useRef<any>(null);
  const tracker = useRef<any>(null);

  useEffect(() => {
    const id = setInterval(() => setPos({ top: 8 + Math.random() * 70, left: 6 + Math.random() * 70 }), 4000);
    return () => clearInterval(id);
  }, []);

  const saveProgress = async (sec: number) => {
    if (!user?.uid) return;
    await setDoc(doc(db, "users", user.uid, "progress", lessonId), {
      lessonId, lastTimeSec: Math.floor(sec), updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const onReady = (e: any) => { playerRef.current = e.target; };
  const onStateChange = (e: any) => {
    const state = e.data; // 1 playing, 2 paused, 0 ended
    if (state === 1) {
      if (!tracker.current) {
        tracker.current = setInterval(async () => {
          try {
            const t = await playerRef.current?.getCurrentTime();
            if (t) saveProgress(t);
          } catch {}
        }, 10000);
      }
    } else {
      if (tracker.current) { clearInterval(tracker.current); tracker.current = null; }
      if (state === 0) saveProgress(999999);
    }
  };

  return (
    <div className="relative w-full aspect-video select-none">
      <YouTube
        videoId={videoId}
        iframeClassName="w-full h-full"
        onReady={onReady}
        onStateChange={onStateChange}
        opts={{ playerVars: { modestbranding: 1, rel: 0, controls: 1, iv_load_policy: 3 } }}
      />
      <div className="absolute text-[10px] md:text-sm px-2 py-1 rounded bg-black/30 text-white pointer-events-none"
           style={{ top: `${pos.top}%`, left: `${pos.left}%`, mixBlendMode: "difference" as any }}>
        {(user?.displayName || "AlterStudies")} • {(user?.email || "user@alterstudies")}
      </div>
    </div>
  );
}
