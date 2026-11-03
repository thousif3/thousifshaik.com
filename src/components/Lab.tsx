"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { domainById, itemById, kindLabel } from "@/lib/content";
import type { Latent } from "@/lib/latent";
import { canDeep, modelNote, search, type Hit } from "@/lib/search";
import { flight } from "@/lib/store";

/** Set at build time (repo variable ASK_URL -> NEXT_PUBLIC_ASK_URL). Without it the lab is search-only. */
const ASK_URL = process.env.NEXT_PUBLIC_ASK_URL;

const SEARCH_CHIPS = ["multi-agent LLM systems", "security research", "leading a team", "running operations", "web front end"];
const ASK_CHIPS = ["What has Thousif built?", "What is ANTA?", "Is he open to work?", "Which roles has he held?"];
const SUGGESTIONS = ASK_URL ? ASK_CHIPS : SEARCH_CHIPS;

type Answer = { state: "loading" } | { state: "done"; text: string } | { state: "error"; msg: string };

export default function Lab({ latent, mode }: { latent: Latent | null; mode: "scene" | "static" }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [deep, setDeep] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const reqId = useRef(0);

  const askModel = async (question: string, id: number) => {
    const unavailable = "The assistant is unavailable right now. Please try again in a bit.";
    try {
      const res = await fetch(ASK_URL as string, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
        signal: AbortSignal.timeout(25_000),
      });
      const data = (await res.json().catch(() => ({}))) as { answer?: unknown };
      if (id !== reqId.current) return;
      if (res.ok && typeof data.answer === "string" && data.answer) setAnswer({ state: "done", text: data.answer });
      else setAnswer({ state: "error", msg: res.status === 429 ? "Too many questions in a row. Try again in a minute." : unavailable });
    } catch {
      if (id === reqId.current)
        setAnswer({ state: "error", msg: typeof navigator !== "undefined" && !navigator.onLine ? "You appear to be offline. Reconnect and try again." : unavailable });
    }
  };

  const run = async (text: string) => {
    const t = text.trim();
    if (!t || (!ASK_URL && !latent)) return;
    setQ(text);
    setErr(null);
    const id = ++reqId.current;
    if (ASK_URL) {
      setAnswer({ state: "loading" });
      void askModel(t, id);
    }
    if (!latent) return;
    setBusy(true);
    try {
      const h = await search(t, latent, 3, deep);
      setHits(h);
      if (h[0] && mode === "scene") pick(h[0].id, window.innerWidth > 900);
      if (!h.length && !ASK_URL) setErr("No overlap with anything here yet. Try other words.");
    } catch (e) {
      setErr("The in-browser model couldn't load. Check your connection and try again.");
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const asking = answer?.state === "loading";

  // on phones the details panel would cover the results, so a search only flies the camera
  const pick = (id: string, open = true) => {
    flight.focus = id;
    if (open) window.dispatchEvent(new CustomEvent("latent:select", { detail: id }));
  };

  return (
    <div className="lab" data-lenis-prevent>
      <p className="eyebrow">{ASK_URL ? "Live lab · ask about my work" : "Live lab · semantic search"}</p>
      <h2 className="lab-title">Ask the space</h2>
      <form
        className="lab-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(q);
        }}
      >
        <label htmlFor="lab-q" className="sr-only">{ASK_URL ? "Ask a question about Thousif" : "Describe what you're looking for"}</label>
        <input
          id="lab-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={ASK_URL ? "e.g. What did he build with LLMs?" : "e.g. agents that need human approval"}
          autoComplete="off"
        />
        <button type="submit" className="btn-p" disabled={busy || asking || (!ASK_URL && !latent)}>
          {asking ? "Thinking…" : busy ? (deep ? "Loading model…" : "Embedding…") : ASK_URL ? "Ask →" : "Fly →"}
        </button>
      </form>
      <ul className="lab-chips" aria-label="Try one">
        {SUGGESTIONS.map((s) => (
          <li key={s}>
            <button type="button" onClick={() => run(s)} disabled={busy || asking || (!ASK_URL && !latent)}>{s}</button>
          </li>
        ))}
      </ul>
      {err && <p className="lab-err">{err}</p>}
      {ASK_URL && answer && (
        <div className="lab-answer" aria-live="polite">
          <p className="eyebrow">Answer</p>
          {answer.state === "loading" && <p className="lab-thinking">Reading the profile…</p>}
          {answer.state === "done" && (
            <>
              <p className="lab-answer-text">{answer.text}</p>
              <p className="lab-ai-note">AI-generated from the content on this site. It can be wrong, so check the project pages.</p>
            </>
          )}
          {answer.state === "error" && <p className="lab-err">{answer.msg}</p>}
        </div>
      )}
      {hits && hits.length > 0 && (
        <ol className="lab-hits">
          {hits.map((h) => {
            const it = itemById[h.id];
            if (!it) return null;
            const d = domainById[it.domain];
            return (
              <li key={h.id} style={{ ["--accent" as string]: d?.color }}>
                {mode === "scene" ? (
                  <button type="button" onClick={() => pick(h.id)}>
                    <span className="hit-kind">{kindLabel[it.kind]}</span>
                    <span className="hit-title">{it.title}</span>
                    <span className="hit-score">{h.score.toFixed(2)}</span>
                  </button>
                ) : (
                  <Link href={it.kind === "project" ? `/work/${it.id}/` : "#experience"}>
                    <span className="hit-kind">{kindLabel[it.kind]}</span>
                    <span className="hit-title">{it.title}</span>
                    <span className="hit-score">{h.score.toFixed(2)}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {canDeep(latent) && (
        <label className="lab-deep">
          <input type="checkbox" checked={deep} onChange={(e) => setDeep(e.target.checked)} />
          Deep search with MiniLM (downloads about 50 MB once)
        </label>
      )}
      <p className="lab-note">
        {ASK_URL ? "Related items on the map: " : ""}
        {modelNote(latent, deep)} Scores are cosine similarity.
      </p>
    </div>
  );
}
