"use client";
import { useState, useEffect } from "react";

const CF_USERNAME = "SkywalkerX";
const GH_USERNAME = "Sky-walkerX";

// Hardcoded stats
const CODECHEF_RATING = 1812;
const CODECHEF_STARS = 4;
const LEETCODE_RATING = 1945;
const LEETCODE_BADGE = "Knight";

function useCodeforcesRating() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchRating() {
      try {
        const res = await fetch(
          `https://codeforces.com/api/user.info?handles=${encodeURIComponent(CF_USERNAME)}`
        );
        const json = await res.json();
        if (json.status === "OK" && json.result?.[0] && !cancelled) {
          setData(json.result[0]);
        }
      } catch {
        // fail silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchRating();
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}

function useGitHubStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      try {
        const res = await fetch(
          `https://api.github.com/users/${encodeURIComponent(GH_USERNAME)}`
        );
        if (res.ok && !cancelled) {
          const user = await res.json();
          setData(user);
        }
      } catch {
        // fail silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}

function getCfRankColor(rank) {
  if (!rank) return "text-gray-400";
  const r = rank.toLowerCase();
  if (r.includes("legendary")) return "text-red-500";
  if (r.includes("international grandmaster")) return "text-red-400";
  if (r.includes("grandmaster")) return "text-red-300";
  if (r.includes("international master")) return "text-orange-400";
  if (r.includes("master")) return "text-orange-300";
  if (r.includes("candidate master")) return "text-violet-400";
  if (r.includes("expert")) return "text-blue-400";
  if (r.includes("specialist")) return "text-cyan-400";
  if (r.includes("pupil")) return "text-green-400";
  return "text-gray-400";
}

function StatRow({ label, value, valueClass = "text-white" }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-b-0">
      <span className="text-[11px] sm:text-xs text-[var(--palette-light-purple)]">{label}</span>
      <span className={`text-xs sm:text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function PlatformHeader({ icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs sm:text-sm font-bold text-white">{label}</span>
    </div>
  );
}

export function CodingStats() {
  const cf = useCodeforcesRating();
  const gh = useGitHubStats();

  return (
    <div className="w-full space-y-4">
      {/* Codeforces */}
      <div>
        <PlatformHeader
          label="Codeforces"
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-yellow-400 shrink-0" fill="currentColor">
              <rect x="2" y="14" width="4" height="8" rx="1" />
              <rect x="10" y="6" width="4" height="16" rx="1" />
              <rect x="18" y="10" width="4" height="12" rx="1" />
            </svg>
          }
        />
        {cf.loading ? (
          <div className="text-xs text-[var(--palette-mid-purple)] animate-pulse">Loading...</div>
        ) : cf.data ? (
          <div>
            <StatRow label="Rating" value={cf.data.rating ?? "N/A"} valueClass={getCfRankColor(cf.data.rank)} />
            <StatRow label="Max Rating" value={cf.data.maxRating ?? "N/A"} valueClass={getCfRankColor(cf.data.maxRank)} />
            <StatRow
              label="Rank"
              value={cf.data.rank ? cf.data.rank.charAt(0).toUpperCase() + cf.data.rank.slice(1) : "N/A"}
              valueClass={getCfRankColor(cf.data.rank)}
            />
          </div>
        ) : (
          <div className="text-xs text-[var(--palette-mid-purple)]">Failed to load</div>
        )}
      </div>

      {/* LeetCode */}
      <div>
        <PlatformHeader
          label="LeetCode"
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-500 shrink-0" fill="currentColor">
              <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
            </svg>
          }
        />
        <div>
          <StatRow label="Rating" value={LEETCODE_RATING} valueClass="text-amber-400" />
          <StatRow label="Badge" value={LEETCODE_BADGE} valueClass="text-amber-400" />
        </div>
      </div>

      {/* CodeChef */}
      <div>
        <PlatformHeader
          label="CodeChef"
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-600 shrink-0" fill="currentColor">
              <path d="M11.257.004A12 12 0 0 0 0 12.003a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.257.004zM7.83 4.86c.466 0 .86.18 1.166.392.323.224.678.726.678 1.544v9.49c0 .3.027.56.063.782.033.213.067.448.14.628.082.206.16.35.284.474.144.143.377.25.73.25.354 0 .59-.107.736-.25.123-.122.195-.264.278-.46.073-.172.118-.413.157-.64.044-.235.072-.502.072-.808V7.08c0-.382.083-.7.197-.962a1.86 1.86 0 0 1 .512-.663c.21-.173.45-.298.716-.372a3.068 3.068 0 0 1 .836-.111c.284 0 .564.037.822.11.266.076.506.2.717.373.21.174.385.404.512.662.114.262.192.573.192.946v9.18c0 .666-.075 1.25-.22 1.767a3.59 3.59 0 0 1-.659 1.306c-.29.357-.657.636-1.087.836-.43.2-.93.3-1.5.3s-1.07-.1-1.5-.3a3.285 3.285 0 0 1-1.083-.834 3.53 3.53 0 0 1-.655-1.314A5.95 5.95 0 0 1 8.42 16.2V7.08c0-.382.08-.7.193-.962a1.86 1.86 0 0 1 .51-.662c.21-.174.45-.298.708-.367z" />
            </svg>
          }
        />
        <div>
          <StatRow label="Rating" value={CODECHEF_RATING} valueClass="text-amber-400" />
          <StatRow label="Stars" value={"★".repeat(CODECHEF_STARS)} valueClass="text-amber-400" />
        </div>
      </div>

      {/* GitHub */}
      <div>
        <PlatformHeader
          label="GitHub"
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white shrink-0" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          }
        />
        {gh.loading ? (
          <div className="text-xs text-[var(--palette-mid-purple)] animate-pulse">Loading...</div>
        ) : gh.data ? (
          <div>
            <StatRow label="Public Repos" value={gh.data.public_repos} />
            <StatRow label="Followers" value={gh.data.followers} />
            <StatRow label="Following" value={gh.data.following} />
          </div>
        ) : (
          <div className="text-xs text-[var(--palette-mid-purple)]">Failed to load</div>
        )}
      </div>
    </div>
  );
}
