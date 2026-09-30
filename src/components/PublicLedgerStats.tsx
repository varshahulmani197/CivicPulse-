import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Award, 
  Zap,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Ticket } from '../types';

interface PublicLedgerStatsProps {
  tickets: Ticket[];
}

export const PublicLedgerStats: React.FC<PublicLedgerStatsProps> = ({ tickets }) => {
  const total = tickets.length;
  const resolved = tickets.filter((t) => t.status === 'Resolved').length;
  const inProgress = tickets.filter((t) => t.status === 'In Progress').length;
  const highSeverity = tickets.filter((t) => t.severity === 'High' && t.status !== 'Resolved').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const totalUpvotes = tickets.reduce((acc, t) => acc + t.upvotes, 0);

  // Agency breakdown
  const bbmpTickets = tickets.filter((t) => t.assignedAgency === 'BBMP');
  const bwssbTickets = tickets.filter((t) => t.assignedAgency === 'BWSSB');
  const bescomTickets = tickets.filter((t) => t.assignedAgency === 'BESCOM');

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl my-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              MUNICIPAL GOVERNANCE DASHBOARD
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Bengaluru Public Infrastructure Accountability Ledger
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time inter-agency dispatch status across BBMP, BWSSB, and BESCOM divisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/80 text-right">
            <div className="text-[11px] text-slate-400">City Resolution Rate</div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono">
              {resolutionRate}%
            </div>
          </div>

          <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/80 text-right">
            <div className="text-[11px] text-slate-400">Citizen Backing</div>
            <div className="text-xl font-extrabold text-amber-400 font-mono">
              {totalUpvotes} Upvotes
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-slate-800">
        <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Active In-Progress</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{inProgress}</div>
          <div className="text-[11px] text-slate-400 mt-1">Dispatched to field gangs</div>
        </div>

        <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Critical Emergencies</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{highSeverity}</div>
          <div className="text-[11px] text-slate-400 mt-1">24h SLA target escalated</div>
        </div>

        <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Verified Solutions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{resolved}</div>
          <div className="text-[11px] text-slate-400 mt-1">With Before/After photo audit</div>
        </div>

        <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Avg Triage Speed</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">&lt; 4 mins</div>
          <div className="text-[11px] text-slate-400 mt-1">AI Deduplication & Routing</div>
        </div>
      </div>

      {/* Agency Jurisdictional Cards */}
      <div className="pt-6">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Agency Enforcement Quotas & Response Matrix
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* BBMP */}
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white">BBMP</span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                Roads & SWD
              </span>
            </div>
            <div className="text-xs text-slate-300">
              Active Issues: <strong>{bbmpTickets.filter((t) => t.status !== 'Resolved').length}</strong> | Resolved: <strong>{bbmpTickets.filter((t) => t.status === 'Resolved').length}</strong>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full"
                style={{
                  width: `${
                    bbmpTickets.length > 0
                      ? (bbmpTickets.filter((t) => t.status === 'Resolved').length / bbmpTickets.length) * 100
                      : 50
                  }%`,
                }}
              />
            </div>
          </div>

          {/* BWSSB */}
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white">BWSSB</span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                Water & Sewerage
              </span>
            </div>
            <div className="text-xs text-slate-300">
              Active Issues: <strong>{bwssbTickets.filter((t) => t.status !== 'Resolved').length}</strong> | Resolved: <strong>{bwssbTickets.filter((t) => t.status === 'Resolved').length}</strong>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full"
                style={{
                  width: `${
                    bwssbTickets.length > 0
                      ? (bwssbTickets.filter((t) => t.status === 'Resolved').length / bwssbTickets.length) * 100
                      : 50
                  }%`,
                }}
              />
            </div>
          </div>

          {/* BESCOM */}
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white">BESCOM</span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                Lighting & Grid
              </span>
            </div>
            <div className="text-xs text-slate-300">
              Active Issues: <strong>{bescomTickets.filter((t) => t.status !== 'Resolved').length}</strong> | Resolved: <strong>{bescomTickets.filter((t) => t.status === 'Resolved').length}</strong>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-yellow-400 h-full rounded-full"
                style={{
                  width: `${
                    bescomTickets.length > 0
                      ? (bescomTickets.filter((t) => t.status === 'Resolved').length / bescomTickets.length) * 100
                      : 50
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
