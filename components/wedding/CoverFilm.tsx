"use client";

import { useEffect, useRef, useState } from "react";

export default function CoverFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!motion.matches) void videoRef.current?.play().catch(() => {});
    const stop = () => { if (motion.matches) videoRef.current?.pause(); };
    motion.addEventListener("change", stop);
    return () => motion.removeEventListener("change", stop);
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      if (video.ended) video.currentTime = 0;
      void video.play().catch(() => {});
    } else video.pause();
  }

  return (
    <div className="cover-film">
      <video
        ref={videoRef}
        muted
        playsInline
        preload="metadata"
        poster="/media/scrapbook-cover.png"
        aria-label="연수와 재현의 사진을 오려 붙인 콜라주. 흑백 사진이 컬러로 물드는 표지 영상"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setFailed(true)}
      >
        <source src="/media/scrapbook-cover.mp4" type="video/mp4" />
      </video>
      {!failed && <button className="film-control" onClick={togglePlayback} aria-label={playing ? "표지 영상 일시정지" : "표지 영상 재생"}>
        <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span> {playing ? "pause" : "play"}
      </button>}
    </div>
  );
}
