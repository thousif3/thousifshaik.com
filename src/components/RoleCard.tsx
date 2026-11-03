"use client";

import { useId, useState } from "react";
import type { Item } from "@/lib/content";

/**
 * One experience entry. Only the headline (title, organisation, dates) shows at rest.
 * The detail opens on hover (mouse), on keyboard focus, or on tap, so phones get it too.
 */
export default function RoleCard({ it, accent }: { it: Item; accent?: string }) {
  const [open, setOpen] = useState(false);
  const panel = useId();
  const bullets = it.bullets ?? [];
  const hasMore = bullets.length > 0 || Boolean(it.summary);

  return (
    <li className={`role reveal ${hasMore ? "role--more" : ""} ${open ? "role--open" : ""}`} style={{ ["--accent" as string]: accent }}>
      <div className="role-hd">
        <h3>
          {hasMore ? (
            <button type="button" className="role-toggle" aria-expanded={open} aria-controls={panel} onClick={() => setOpen((o) => !o)}>
              {it.title}
            </button>
          ) : (
            it.title
          )}
        </h3>
        <p className="role-when">{it.date}</p>
      </div>
      <p className="role-org">{it.org}</p>
      {hasMore && <span className="role-plus" aria-hidden="true" />}
      {hasMore && (
        <div id={panel} className="role-more">
          <div className="role-more-in">
            {bullets.length > 0 ? (
              <ul className="role-bullets">
                {bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : (
              <p className="role-sum">{it.summary}</p>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
