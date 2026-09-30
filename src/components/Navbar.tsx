import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  PlusCircle, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  UserCheck
} from 'lucide-react';
import { BENGALURU_WARDS } from '../data/mockData';
import { WardInfo } from '../types';

interface NavbarProps {
  selectedWard: string;
  onSelectWard: (ward: string) => void;
  onOpenReportModal: () => void;
  onResetData: () => void;
  isOfficerMode: boolean;
  onToggleOfficerMode: () => void;
  stats: {
    totalActive: number;
    highSeverity: number;
    resolvedCount: number;
    slaComplianceRate: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedWard,
  onSelectWard,
  onOpenReportModal,
  onResetData,
  isOfficerMode,
  onToggleOfficerMode,
  stats,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Municipal Bar */}
      <div className="bg-slate-950/70 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-200">Bruhat Bengaluru Mahanagara Palike (BBMP)</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">BWSSB & BESCOM Inter-Agency Grid</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-amber-300">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{stats.highSeverity} Critical Alerts</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{stats.resolvedCount} Resolved</span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-slate-400">
              <span>SLA Target:</span>
              <span className="text-white font-semibold">{stats.slaComplianceRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black text-xl tracking-tighter ring-2 ring-amber-400/40">
                <Building2 className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    CivicPulse <span className="text-amber-400">Bengaluru</span>
                  </h1>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
                    Live Grid
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Empowering Citizens & BBMP / BWSSB / BESCOM Authorities
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={onOpenReportModal}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>
          </div>

          {/* Location Selector & Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Location Ward Picker */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 shadow-inner">
              <MapPin className="w-3.5 h-3.5 text-amber-400 mr-2 shrink-0" />
              <span className="text-slate-400 mr-1.5 hidden sm:inline">Location:</span>
              <select
                value={selectedWard}
                onChange={(e) => onSelectWard(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-2"
                aria-label="Filter by Bengaluru Ward"
              >
                {BENGALURU_WARDS.map((ward: WardInfo) => (
                  <option key={ward.name} value={ward.name} className="bg-slate-900 text-slate-100">
                    {ward.name} {ward.number ? `(Ward ${ward.number})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Authority View Toggle (BBMP Officer Mode) */}
            <button
              onClick={onToggleOfficerMode}
              title="Toggle between Citizen View and BBMP Ward Officer Verification Mode"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isOfficerMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-1 ring-amber-400/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {isOfficerMode ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Officer Mode ON</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ward Officer Mode</span>
                </>
              )}
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={onResetData}
              title="Reset to default Bengaluru civic reports"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Primary Report CTA */}
            <button
              onClick={onOpenReportModal}
              className="hidden md:inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Report an Issue</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
