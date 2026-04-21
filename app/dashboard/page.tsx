'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { Session } from '@/lib/types';

const ARSENAL_RED = '#EF0107';
const DARK = '#1f2937';
const DASHBOARD_PASSWORD =
  process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD ?? 'ArsenalABTest2024';

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Chart card wrapper ─────────────────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-5">{title}</h2>
      {children}
    </div>
  );
}

// ── Engagement row ─────────────────────────────────────────────────────────
function EngRow({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <tr className="border-t border-gray-100">
      <td className="py-3 pr-4 text-sm text-gray-600">{label}</td>
      <td className="py-3 pr-4 text-sm font-bold text-[#EF0107]">{a}</td>
      <td className="py-3 text-sm font-bold text-gray-800">{b}</td>
    </tr>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
const avg = (nums: number[]) =>
  nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length;

const pct = (n: number, total: number) =>
  total === 0 ? '0%' : `${Math.round((n / total) * 100)}%`;

// ── Password screen ────────────────────────────────────────────────────────
function PasswordScreen({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === DASHBOARD_PASSWORD) {
      sessionStorage.setItem('dashboard_auth', 'true');
      onAuth();
    } else {
      setErr(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="w-11 h-11 bg-[#EF0107] rounded-xl flex items-center justify-center mb-5">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-black text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-6">Enter the password to view results.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pw}
            autoFocus
            onChange={e => {
              setPw(e.target.value);
              setErr(false);
            }}
            placeholder="Password"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-[#EF0107] focus:border-transparent"
          />
          {err && <p className="text-[#EF0107] text-sm mb-3">Incorrect password</p>}
          <button
            type="submit"
            className="w-full bg-[#EF0107] text-white py-3 rounded-xl font-bold hover:bg-[#C40106] transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [authed, setAuthed] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('dashboard_auth') === 'true') setAuthed(true);
  }, []);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setFetchErr(null);
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('completed', true)
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      setFetchErr('Failed to load data. Check your Supabase configuration.');
      return;
    }
    setSessions((data as Session[]) ?? []);
  }, []);

  useEffect(() => {
    if (authed) fetchSessions();
  }, [authed, fetchSessions]);

  if (!authed) return <PasswordScreen onAuth={() => setAuthed(true)} />;

  // ── CSV download ───────────────────────────────────────────────────────
  const downloadCSV = () => {
    const headers: (keyof Session)[] = [
      'id',
      'created_at',
      'order_shown',
      'emotional_response_a',
      'share_intent_a',
      'purchase_intent_a',
      'open_comment_a',
      'did_play_a',
      'replay_count_a',
      'watched_to_end_a',
      'emotional_response_b',
      'share_intent_b',
      'purchase_intent_b',
      'open_comment_b',
      'did_play_b',
      'replay_count_b',
      'watched_to_end_b',
      'final_preference',
      'final_comment',
    ];

    const escape = (v: unknown) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const csv = [
      headers.join(','),
      ...sessions.map(s => headers.map(h => escape(s[h])).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-test-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Loading / error states ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading results…</p>
      </div>
    );
  }
  if (fetchErr) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{fetchErr}</p>
          <button
            onClick={fetchSessions}
            className="bg-[#EF0107] text-white px-5 py-2 rounded-xl font-bold hover:bg-[#C40106] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Statistics ─────────────────────────────────────────────────────────
  const n = sessions.length;
  const prefA = sessions.filter(s => s.final_preference === 'A').length;
  const prefB = sessions.filter(s => s.final_preference === 'B').length;

  const preferenceData = [
    { name: 'Version A — Vocal Crowd', value: prefA },
    { name: 'Version B — Instrumental', value: prefB },
  ];

  const avgEmotA = avg(sessions.map(s => s.emotional_response_a).filter(Boolean));
  const avgEmotB = avg(sessions.map(s => s.emotional_response_b).filter(Boolean));
  const avgPurchA = avg(sessions.map(s => s.purchase_intent_a).filter(Boolean));
  const avgPurchB = avg(sessions.map(s => s.purchase_intent_b).filter(Boolean));

  const ratingsData = [
    {
      metric: 'Emotional Response',
      'Version A': parseFloat(avgEmotA.toFixed(2)),
      'Version B': parseFloat(avgEmotB.toFixed(2)),
    },
    {
      metric: 'Purchase Intent',
      'Version A': parseFloat(avgPurchA.toFixed(2)),
      'Version B': parseFloat(avgPurchB.toFixed(2)),
    },
  ];

  const shareData = [
    {
      version: 'Version A',
      Yes: sessions.filter(s => s.share_intent_a === 'Yes').length,
      Maybe: sessions.filter(s => s.share_intent_a === 'Maybe').length,
      No: sessions.filter(s => s.share_intent_a === 'No').length,
    },
    {
      version: 'Version B',
      Yes: sessions.filter(s => s.share_intent_b === 'Yes').length,
      Maybe: sessions.filter(s => s.share_intent_b === 'Maybe').length,
      No: sessions.filter(s => s.share_intent_b === 'No').length,
    },
  ];

  const completionA = pct(sessions.filter(s => s.watched_to_end_a).length, n);
  const completionB = pct(sessions.filter(s => s.watched_to_end_b).length, n);
  const avgReplaysA = avg(sessions.map(s => s.replay_count_a || 0)).toFixed(1);
  const avgReplaysB = avg(sessions.map(s => s.replay_count_b || 0)).toFixed(1);
  const playedA = `${sessions.filter(s => s.did_play_a).length} / ${n}`;
  const playedB = `${sessions.filter(s => s.did_play_b).length} / ${n}`;

  const allComments = sessions.flatMap(s => {
    const rows = [];
    if (s.open_comment_a)
      rows.push({ label: 'Version A (Vocal)', comment: s.open_comment_a, id: s.id + 'a' });
    if (s.open_comment_b)
      rows.push({ label: 'Version B (Instrumental)', comment: s.open_comment_b, id: s.id + 'b' });
    if (s.final_comment)
      rows.push({ label: 'Final comment', comment: s.final_comment, id: s.id + 'f' });
    return rows;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#EF0107]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-black text-white">Get Parade Ready — Results</h1>
            <p className="text-white/60 text-xs mt-0.5">
              Version A: Vocal Crowd &nbsp;·&nbsp; Version B: Instrumental
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchSessions}
              className="text-xs bg-white/15 text-white px-4 py-2 rounded-xl font-bold hover:bg-white/25 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={downloadCSV}
              className="text-xs bg-white text-[#EF0107] px-4 py-2 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Download CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {n === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg mb-2">No responses yet.</p>
            <p className="text-gray-400 text-sm">
              Share the test link with participants to start collecting data.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total responses" value={n} />
              <StatCard
                label="Prefer Version A"
                value={prefA}
                sub={`${pct(prefA, n)} of participants`}
              />
              <StatCard
                label="Prefer Version B"
                value={prefB}
                sub={`${pct(prefB, n)} of participants`}
              />
              <StatCard
                label="Open comments"
                value={allComments.length}
                sub="across both versions"
              />
            </div>

            {/* Preference split + Ratings side by side on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preference pie */}
              <ChartCard title="Overall preference split">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={preferenceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ value, percent }) =>
                        `${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      <Cell fill={ARSENAL_RED} />
                      <Cell fill={DARK} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Average ratings */}
              <ChartCard title="Average ratings by version (out of 5)">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={ratingsData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Version A" fill={ARSENAL_RED} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Version B" fill={DARK} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Share intent */}
            <ChartCard title="Share / recreate intent (stacked by count)">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={shareData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="version" tick={{ fontSize: 13, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Yes" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Maybe" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="No" stackId="a" fill="#6b7280" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Video engagement */}
            <ChartCard title="Video engagement">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-3 text-gray-500 font-medium">Metric</th>
                      <th className="pb-3 text-[#EF0107] font-bold">Version A (Vocal)</th>
                      <th className="pb-3 text-gray-700 font-bold">Version B (Instrumental)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <EngRow label="Completion rate" a={completionA} b={completionB} />
                    <EngRow label="Average replays" a={avgReplaysA} b={avgReplaysB} />
                    <EngRow label="Pressed play" a={playedA} b={playedB} />
                  </tbody>
                </table>
              </div>
            </ChartCard>

            {/* Comments */}
            {allComments.length > 0 && (
              <ChartCard title={`Open text comments (${allComments.length})`}>
                <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-44">
                          Version
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Comment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allComments.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold
                              ${c.label.includes('Version A')
                                ? 'bg-red-50 text-[#EF0107]'
                                : c.label.includes('Version B')
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {c.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{c.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
