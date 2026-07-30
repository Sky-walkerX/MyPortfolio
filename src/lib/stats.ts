import "server-only";
import { SITE } from "./site";

export interface ContributionDay {
  date: string;
  count: number;
}

export interface HeatmapCell {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface HeatmapData {
  cells: HeatmapCell[];
  total: number;
  status: "ok" | "empty" | "offline";
}

export interface GithubUser {
  publicRepos: number;
  followers: number;
  following: number;
}

export interface CodeforcesUser {
  rating: number;
  maxRating: number;
  rank: string;
}

export interface PullRequest {
  title: string;
  url: string;
  repo: string;
  mergedAt: string;
  number: number;
}

export interface PortfolioStats {
  github: { heatmap: HeatmapData; user: GithubUser | null; pullRequests: PullRequest[] };
  codeforces: { heatmap: HeatmapData; user: CodeforcesUser | null };
}

const SIX_MONTHS_MS = 26 * 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const REVALIDATE_SECONDS = 3600;
const FETCH_TIMEOUT_MS = 12_000;

const UA =
  "nk-portfolio (+https://namankhandelwal.me)";

function emptyHeatmap(status: HeatmapData["status"] = "offline"): HeatmapData {
  return { cells: [], total: 0, status };
}

function buildHeatmap(contributions: ContributionDay[]): HeatmapData {
  if (contributions.length === 0) return emptyHeatmap("empty");

  const cutoff = Date.now() - SIX_MONTHS_MS;
  const filtered = contributions.filter((d) => new Date(d.date).getTime() >= cutoff);
  if (filtered.length === 0) return emptyHeatmap("empty");

  const nonzero = filtered
    .filter((d) => d.count > 0)
    .map((d) => d.count)
    .sort((a, b) => a - b);

  const q = (p: number) =>
    nonzero.length === 0 ? 0 : nonzero[Math.min(nonzero.length - 1, Math.floor(nonzero.length * p))];

  const t1 = Math.max(1, q(0.25));
  const t2 = Math.max(t1 + 1, q(0.5));
  const t3 = Math.max(t2 + 1, q(0.75));

  const levelFor = (n: number): 0 | 1 | 2 | 3 | 4 => {
    if (n <= 0) return 0;
    if (n <= t1) return 1;
    if (n <= t2) return 2;
    if (n <= t3) return 3;
    return 4;
  };

  const start = new Date(filtered[0].date + "T00:00:00Z");
  const startDow = start.getUTCDay();
  const lookup = new Map(filtered.map((d) => [d.date, d]));
  const firstSun = new Date(start.getTime() - startDow * DAY_MS);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const cells: HeatmapCell[] = [];
  let total = 0;
  for (let t = firstSun.getTime(); t <= today.getTime(); t += DAY_MS) {
    const iso = new Date(t).toISOString().slice(0, 10);
    const entry = lookup.get(iso);
    const count = entry ? entry.count : 0;
    total += count;
    cells.push({ date: iso, count, level: levelFor(count) });
  }

  return { cells, total, status: "ok" };
}

async function fetchJsonOnce<T>(url: string, headers: Record<string, string>): Promise<T | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: "application/json", "User-Agent": UA, ...headers },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson<T>(url: string, headers: Record<string, string> = {}): Promise<T | null> {
  const first = await fetchJsonOnce<T>(url, headers);
  if (first !== null) return first;
  // tiny backoff before single retry
  await new Promise((r) => setTimeout(r, 300));
  return fetchJsonOnce<T>(url, headers);
}

function githubHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function parseRepoPath(sourceUrl: string): string | null {
  const m = sourceUrl.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?\/?$/);
  return m ? m[1] : null;
}

/** Total commit count via the Link-header pagination trick — GitHub has no direct count field. */
async function loadRepoCommitCount(path: string): Promise<number | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.github.com/repos/${path}/commits?per_page=1`, {
      signal: ctl.signal,
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "User-Agent": UA, ...githubHeaders() },
    });
    if (!res.ok) return null;
    const link = res.headers.get("link");
    if (!link) {
      const body = (await res.json()) as unknown[];
      return Array.isArray(body) ? body.length : null;
    }
    const last = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
    return last ? Number(last[1]) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Keyed by source repo URL (as given in data.ts), not by owner/repo path — simpler for callers. */
export async function loadRepoCommits(sourceUrls: string[]): Promise<Record<string, number | null>> {
  const entries = await Promise.all(
    sourceUrls.map(async (url) => {
      const path = parseRepoPath(url);
      return [url, path ? await loadRepoCommitCount(path) : null] as const;
    }),
  );
  return Object.fromEntries(entries);
}

interface GhContribResponse {
  contributions?: Array<{ date: string; count: number }>;
}

async function loadGithubHeatmap(): Promise<HeatmapData> {
  const data = await fetchJson<GhContribResponse>(
    `https://github-contributions-api.jogruber.de/v4/${SITE.githubHandle}?y=last`,
  );
  if (!data) return emptyHeatmap();
  const contribs = (data.contributions ?? []).map((c) => ({ date: c.date, count: c.count }));
  return buildHeatmap(contribs);
}

interface GhUserResponse {
  public_repos?: number;
  followers?: number;
  following?: number;
}

async function loadGithubUser(): Promise<GithubUser | null> {
  const data = await fetchJson<GhUserResponse>(
    `https://api.github.com/users/${SITE.githubHandle}`,
    githubHeaders(),
  );
  if (!data) return null;
  return {
    publicRepos: data.public_repos ?? 0,
    followers: data.followers ?? 0,
    following: data.following ?? 0,
  };
}

interface GhSearchPRResponse {
  total_count?: number;
  items?: Array<{
    title: string;
    html_url: string;
    repository_url: string;
    number: number;
    pull_request?: { merged_at: string | null };
    closed_at?: string;
  }>;
}

async function loadGithubPRs(): Promise<PullRequest[]> {
  const url = `https://api.github.com/search/issues?q=author:${SITE.githubHandle}+type:pr+is:merged&sort=updated&order=desc&per_page=5`;
  const data = await fetchJson<GhSearchPRResponse>(url, githubHeaders());
  if (!data?.items) return [];
  return data.items.slice(0, 5).map((it) => ({
    title: it.title,
    url: it.html_url,
    repo: it.repository_url.replace("https://api.github.com/repos/", ""),
    mergedAt: it.pull_request?.merged_at ?? it.closed_at ?? "",
    number: it.number,
  }));
}

interface CfStatusResponse {
  status: string;
  result?: Array<{
    verdict?: string;
    creationTimeSeconds: number;
    problem: { contestId?: number; problemsetName?: string; index: string };
  }>;
}

async function loadCodeforcesHeatmap(): Promise<HeatmapData> {
  const data = await fetchJson<CfStatusResponse>(
    `https://codeforces.com/api/user.status?handle=${SITE.cfHandle}&from=1&count=2000`,
  );
  if (!data || data.status !== "OK" || !data.result) return emptyHeatmap();

  const byDay = new Map<string, number>();
  const solved = new Set<string>();
  for (const s of data.result) {
    if (s.verdict !== "OK") continue;
    const probKey = `${s.problem.contestId ?? s.problem.problemsetName ?? ""}-${s.problem.index}`;
    if (solved.has(probKey)) continue;
    solved.add(probKey);
    const day = new Date(s.creationTimeSeconds * 1000).toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const contribs = Array.from(byDay.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return buildHeatmap(contribs);
}

interface CfInfoResponse {
  status: string;
  result?: Array<{ rating?: number; maxRating?: number; rank?: string }>;
}

async function loadCodeforcesUser(): Promise<CodeforcesUser | null> {
  const data = await fetchJson<CfInfoResponse>(
    `https://codeforces.com/api/user.info?handles=${SITE.cfHandle}`,
  );
  if (!data || data.status !== "OK" || !data.result?.[0]) return null;
  const u = data.result[0];
  if (!u.rating || !u.maxRating) return null;
  return {
    rating: u.rating,
    maxRating: u.maxRating,
    rank: (u.rank ?? "").replace(/\b\w/g, (l) => l.toUpperCase()),
  };
}

export async function loadStats(): Promise<PortfolioStats> {
  const [ghHeat, ghUser, ghPRs, cfHeat, cfUser] = await Promise.all([
    loadGithubHeatmap(),
    loadGithubUser(),
    loadGithubPRs(),
    loadCodeforcesHeatmap(),
    loadCodeforcesUser(),
  ]);

  return {
    github: { heatmap: ghHeat, user: ghUser, pullRequests: ghPRs },
    codeforces: { heatmap: cfHeat, user: cfUser },
  };
}
