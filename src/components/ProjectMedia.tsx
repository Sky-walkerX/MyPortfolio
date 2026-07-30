"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectMediaAsset } from "@/lib/data";

type Phase = "idle" | "playing" | "resolved";
type Lightbox = { kind: "shot"; src: string; label: string } | { kind: "video" } | null;

interface Shot {
  poster: string;
  dither: string;
  label: string;
}

/**
 * Preview column beside the project copy, rendered the way a terminal that
 * speaks the inline-image protocol renders one: a command line, then pictures
 * painting in top to bottom behind a scanline. Each shot rests on its 1-bit
 * dither and resolves to the real screenshot once, on first scroll-in.
 *
 * Any shot opens full size on click. Video is never fetched until the play
 * button is pressed — the two thumbnails are all the page costs.
 */
export function ProjectMedia({ media, name }: { media: ProjectMediaAsset; name: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [still, setStill] = useState(false);
  const [box, setBox] = useState<Lightbox>(null);

  const shots: Shot[] = [{ poster: media.poster, dither: media.dither, label: "dark" }];
  if (media.posterLight && media.ditherLight) {
    shots.push({ poster: media.posterLight, dither: media.ditherLight, label: "light" });
  }

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const motionOff =
      document.body.getAttribute("data-motion") === "off" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (motionOff) {
      setStill(true);
      setPhase("resolved");
      return;
    }

    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          setPhase("playing");
          // hand over to colour just before the last wipe finishes, so the
          // transitions overlap instead of reading as separate events
          timer = window.setTimeout(() => setPhase("resolved"), 820);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!box) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBox(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [box]);

  const close = useCallback(() => setBox(null), []);

  // brace expansion when both shots exist — the way you would actually type it
  const label = shots.length > 1 ? "preview-{dark,light}.png" : "preview.png";

  return (
    <>
      <div className={`pmedia ${phase}${still ? " still" : ""}`} ref={rootRef}>
        <div className="pmedia-cmd">
          <span className="d">$</span> imgcat <span className="arg">{label}</span>
        </div>

        <div className="pmedia-shots">
          {shots.map((shot) => (
            <button
              key={shot.label}
              type="button"
              className="pmedia-frame"
              onClick={() =>
                setBox({ kind: "shot", src: shot.poster, label: `preview-${shot.label}.png` })
              }
              aria-label={`Open ${shot.label} preview of ${name}`}
            >
              <span className="pmedia-stack">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="pmedia-poster"
                  src={shot.poster}
                  alt={`${media.alt} — ${shot.label} theme`}
                  loading="lazy"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pmedia-dither" src={shot.dither} alt="" aria-hidden="true" />
              </span>
              <span className="pmedia-scan" aria-hidden="true" />
              <span className="pmedia-tag" aria-hidden="true">
                {shot.label}
              </span>
              <span className="pmedia-expand" aria-hidden="true">
                [ ⤢ ]
              </span>
            </button>
          ))}
        </div>

        {media.video && (
          <button type="button" className="cli-btn pmedia-play" onClick={() => setBox({ kind: "video" })}>
            <span className="glyph">▸</span> play demo
          </button>
        )}
      </div>

      {box && (
        <div
          className="pmlb-root"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} — preview`}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="pmlb-box">
            <div className="pmlb-head">
              <div className="lights" aria-hidden="true">
                <span className="r" />
                <span className="y" />
                <span className="g" />
              </div>
              <div className="pmlb-title">
                <span className="acc">./</span>
                {name}
                <span className="muted"> — {box.kind === "video" ? "demo.webm" : box.label}</span>
              </div>
              <button className="pmlb-close" type="button" onClick={close} aria-label="Close">
                [ esc ]
              </button>
            </div>

            <div className="pmlb-media">
              {box.kind === "video" ? (
                <video className="pmlb-video" poster={media.poster} autoPlay muted loop playsInline controls>
                  <source src={`${media.video}.webm`} type="video/webm" />
                  <source src={`${media.video}.mp4`} type="video/mp4" />
                </video>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={box.src} alt={media.alt} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
