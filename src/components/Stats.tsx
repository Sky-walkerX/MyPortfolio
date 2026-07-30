import { SectionHead } from "./Prompt";
import { Heatmap } from "./Heatmap";
import { loadStats, type PullRequest } from "@/lib/stats";
import { NOTABLE_CONTRIBS, type NotableContrib } from "@/lib/data";

function relativeTime(iso: string) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))}mo ago`;
  return `${Math.floor(diff / (86400 * 365))}y ago`;
}

const ORG_GLYPHS: Record<NotableContrib["org"], string> = {
  tauri: "◆",
  fedimint: "⬢",
  checkmate: "✓",
  formstr: "▤",
};

function NotableContribs({ items }: { items: NotableContrib[] }) {
  return (
    <div className="prs-card">
      <div className="ghead">
        <span className="glyph">★</span> notable OSS contributions{" "}
        <small>tauri · fedimint · checkmate · formstr</small>
      </div>
      <ul className="pr-list">
        {items.map((c, i) => (
          <li key={`${c.repo}-${i}`} className="pr-item">
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="pr-link">
              <span className="pr-repo">
                <span className="org-glyph" aria-hidden="true">
                  {ORG_GLYPHS[c.org]}
                </span>
                {c.repo}
                {c.number !== null ? ` #${c.number}` : ""}
              </span>
              <span className={`pr-time pr-status-${c.status}`}>{c.status}</span>
              <span className="pr-title">{c.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecentPRs({ prs }: { prs: PullRequest[] }) {
  return (
    <div className="prs-card">
      <div className="ghead">
        <span className="glyph">⇪</span> recent merged PRs <small>top 5</small>
      </div>
      {prs.length === 0 ? (
        <p className="heatmap-meta">no data</p>
      ) : (
        <ul className="pr-list">
          {prs.map((pr) => (
            <li key={pr.url} className="pr-item">
              <a href={pr.url} target="_blank" rel="noopener noreferrer" className="pr-link">
                <span className="pr-repo">{pr.repo}</span>
                <span className="pr-num">#{pr.number}</span>
                <span className="pr-title">{pr.title}</span>
                <span className="pr-time">{relativeTime(pr.mergedAt)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export async function Stats() {
  const stats = await loadStats();
  const cf = stats.codeforces.user;
  const gh = stats.github.user;
  const prs = stats.github.pullRequests;

  return (
    <section id="stats">
      <SectionHead
        cmd={
          <>
            ./stats.sh <span className="flag">--source</span>{" "}
            <span className="arg">github,codeforces</span>
          </>
        }
        num="[03]"
      />

      {/* The page's second scale moment. Three numbers worth stopping for —
          two live, one fixed — before the detail cards underneath. */}
      <div className="stat-heads r">
        <div className="stat-head">
          <span className="n">
            {stats.github.heatmap.status === "ok" ? stats.github.heatmap.total : "—"}
          </span>
          <span className="l">github contributions · last 6mo</span>
        </div>
        <div className="stat-head">
          <span className="n">{cf?.maxRating ?? 1623}</span>
          <span className="l">codeforces peak · {cf?.rank ?? "Expert"}</span>
        </div>
        <div className="stat-head">
          <span className="n">137</span>
          <span className="l">icpc india prelims · 2025</span>
        </div>
      </div>

      <div className="stats-grid r">
        <div className="heatmaps-stack">
          <div className="heatmap-card">
            <h4>
              <span className="glyph">▮</span> codeforces <span className="handle">(SkywalkerX)</span>
            </h4>
            <p className="heatmap-meta">
              {stats.codeforces.heatmap.status === "ok" ? (
                <>
                  <span className="acc">{stats.codeforces.heatmap.total}</span> problems solved · last 6 months
                </>
              ) : (
                "last 6 months"
              )}
            </p>
            <Heatmap data={stats.codeforces.heatmap} source="codeforces" label="solves" />
            <div className="heatmap-legend">
              <span>less</span>
              <span className="sq" />
              <span className="sq" data-l="1" style={{ background: "#1c3a32" }} />
              <span className="sq" data-l="2" style={{ background: "#2a7560" }} />
              <span className="sq" data-l="3" style={{ background: "#45c9a0" }} />
              <span className="sq" data-l="4" style={{ background: "#6dffc8" }} />
              <span>more</span>
            </div>
          </div>
          <div className="heatmap-card">
            <h4>
              <span className="glyph">✓</span> github <span className="handle">(Sky-walkerX)</span>
            </h4>
            <p className="heatmap-meta">
              {stats.github.heatmap.status === "ok" ? (
                <>
                  <span className="acc">{stats.github.heatmap.total}</span> contributions · last 6 months
                </>
              ) : (
                "last 6 months"
              )}
            </p>
            <Heatmap data={stats.github.heatmap} source="github" label="commits" />
            <div className="heatmap-legend">
              <span>less</span>
              <span className="sq" />
              <span className="sq" data-l="1" style={{ background: "#133d2c" }} />
              <span className="sq" data-l="2" style={{ background: "#1f6a48" }} />
              <span className="sq" data-l="3" style={{ background: "#2ea866" }} />
              <span className="sq" data-l="4" style={{ background: "#56d364" }} />
              <span>more</span>
            </div>
          </div>
          <NotableContribs items={NOTABLE_CONTRIBS} />
        </div>

        <div className="ratings-stack">
        <div className="ratings-card">
          <div className="group">
            <div className="ghead">
              <span className="glyph">▮</span> codeforces <small>expert</small>
            </div>
            <div className="row">
              <span className="k">rating</span>
              <span className="v">{cf?.rating ?? 1437}</span>
            </div>
            <div className="row">
              <span className="k">max</span>
              <span className="v">{cf?.maxRating ?? 1623}</span>
            </div>
            <div className="row">
              <span className="k">rank</span>
              <span className="v acc">{cf?.rank ?? "Expert"}</span>
            </div>
          </div>

          <div className="group">
            <div className="ghead">
              <span className="glyph">◆</span> leetcode <small>knight</small>
            </div>
            <div className="row">
              <span className="k">rating</span>
              <span className="v">1945</span>
            </div>
            <div className="row">
              <span className="k">badge</span>
              <span className="v warn">Knight</span>
            </div>
          </div>

          <div className="group">
            <div className="ghead">
              <span className="glyph">◉</span> codechef <small>4★</small>
            </div>
            <div className="row">
              <span className="k">rating</span>
              <span className="v">1812</span>
            </div>
            <div className="row">
              <span className="k">peak</span>
              <span className="v">1813</span>
            </div>
            <div className="row">
              <span className="k">stars</span>
              <span className="v">
                <span className="star">★★★★</span>
              </span>
            </div>
          </div>

          <div className="group">
            <div className="ghead">
              <span className="glyph">✓</span> github
            </div>
            <div className="row">
              <span className="k">repos</span>
              <span className="v">{gh?.publicRepos ?? "—"}</span>
            </div>
            <div className="row">
              <span className="k">followers</span>
              <span className="v">{gh?.followers ?? "—"}</span>
            </div>
            <div className="row">
              <span className="k">following</span>
              <span className="v">{gh?.following ?? "—"}</span>
            </div>
          </div>
        </div>
          <RecentPRs prs={prs} />
        </div>
      </div>
    </section>
  );
}
