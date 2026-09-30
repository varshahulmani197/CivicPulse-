import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  ThumbsUp, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  User, 
  Phone, 
  Layers, 
  FileCheck, 
  HardHat, 
  Sparkles, 
  ChevronRight,
  Printer
} from 'lucide-react';
import { Ticket, StatusType } from '../types';
import { CATEGORIES } from '../data/mockData';
import { PrintableTicketModal } from './PrintableTicketModal';

interface TicketDetailModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onUpvote: (ticketId: string, e: React.MouseEvent) => void;
  isOfficerMode: boolean;
  onUpdateTicketStatus: (
    ticketId: string, 
    newStatus: StatusType, 
    notes?: string, 
    completionPhotoUrl?: string
  ) => void;
}

const LIFECYCLE_STEPS: StatusType[] = ['Reported', 'Verified', 'In Progress', 'Resolved'];

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpvote,
  isOfficerMode,
  onUpdateTicketStatus,
}) => {
  if (!isOpen) return null;

  const [officerNotes, setOfficerNotes] = useState('');
  const [selectedProofPhoto, setSelectedProofPhoto] = useState(
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80'
  );
  const [copied, setCopied] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const categoryMeta = CATEGORIES.find((c) => c.id === ticket.category);
  const currentStepIndex = LIFECYCLE_STEPS.indexOf(ticket.status);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdvanceStatus = (nextStatus: StatusType) => {
    onUpdateTicketStatus(
      ticket.id,
      nextStatus,
      officerNotes || `Updated to ${nextStatus} by BBMP Ward ${ticket.wardNumber} Taskforce`,
      nextStatus === 'Resolved' ? selectedProofPhoto : undefined
    );
    setOfficerNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                {ticket.ticketNumber}
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <span>{categoryMeta?.emoji}</span>
                <span>{categoryMeta?.label}</span>
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs font-bold text-amber-300">
                {ticket.assignedAgency} Jurisdictional Ticket
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
              {ticket.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              title="Print official municipal docket with authority logo and e-signature"
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Docket</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">

          {/* AI Severity & Deduplication Assessment Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md border ${
                  ticket.severity === 'High' 
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : ticket.severity === 'Medium'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}>
                  {ticket.severity} Priority Severity
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Automated Safety Triage
                </span>
              </div>

              {ticket.duplicateCount > 0 && (
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  <Layers className="w-3.5 h-3.5 text-amber-700" />
                  <span>{ticket.duplicateCount} Citizen reports aggregated into this ticket</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900">AI Triage Rationale: </span>
              {ticket.severityReason}
            </p>

            {ticket.proximityRisks.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[11px] font-bold text-slate-500">Proximity Flags:</span>
                {ticket.proximityRisks.map((risk) => (
                  <span
                    key={risk}
                    className="text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md"
                  >
                    ⚠️ {risk}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Public Accountability Lifecycle Tracker */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold tracking-tight">
                  Public Accountability Status Tracker
                </h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                Current: {ticket.status}
              </span>
            </div>

            {/* Stepper Bar */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                        isPassed
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-bold ${
                        isCurrent
                          ? 'text-amber-400'
                          : isPassed
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Timeline Audit Events */}
            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Immutable Action Audit Trail
              </div>
              {ticket.timeline.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="font-bold text-white">{ev.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ev.timestamp).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-0.5">{ev.description}</p>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>Authority / Actor:</span>
                      <span className="text-slate-200 font-semibold">{ev.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Photographic Audit (Before & After for Resolved, or Report Photo) */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span>Photographic Evidence & Transparency Verification</span>
              {ticket.status === 'Resolved' && (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  Before & After Inspection Passed
                </span>
              )}
            </h3>

            {ticket.status === 'Resolved' && ticket.resolvedPhotoUrl ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>BEFORE REPAIR</span>
                      <span className="text-slate-500 text-[10px]">Citizen Upload</span>
                    </div>
                    <div className="rounded-xl overflow-hidden h-48 bg-slate-200 border border-slate-300 relative">
                      <img
                        src={ticket.photoUrl}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        ORIGINAL FAULT
                      </span>
                    </div>
                  </div>

                  {/* After */}
                  <div>
                    <div className="text-xs font-bold text-emerald-800 mb-1.5 flex items-center justify-between">
                      <span>AFTER COMPLETION</span>
                      <span className="text-emerald-700 text-[10px] font-bold">BBMP Verified</span>
                    </div>
                    <div className="rounded-xl overflow-hidden h-48 bg-emerald-100 border border-emerald-300 relative">
                      <img
                        src={ticket.resolvedPhotoUrl}
                        alt="After Resolution"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        RESTORED INFRASTRUCTURE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resolution Details */}
                {ticket.resolutionDetails && (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900">Official Resolution Audit:</div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-800">Contractor / Gang:</span> {ticket.resolutionDetails.contractor}
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-800">Materials Used:</span> {ticket.resolutionDetails.materialsUsed}
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-800">Inspecting Officer:</span> {ticket.resolutionDetails.inspectedBy}
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-800">Official Notes:</span> {ticket.resolutionDetails.completionNotes}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden h-64 bg-slate-100 border border-slate-200 relative">
                <img
                  src={ticket.photoUrl}
                  alt={ticket.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-xs px-3 py-1 rounded-lg backdrop-blur-xs font-medium">
                  Reported by {ticket.reporter.name} · {ticket.reporter.phoneMasked}
                </div>
              </div>
            )}
          </div>

          {/* Description & Location Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Description */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Detailed Description:</span>
              <p className="text-slate-600 leading-relaxed">{ticket.description}</p>
              
              <div className="mt-3 pt-3 border-t border-slate-200 text-slate-500">
                <span className="font-semibold text-slate-700">Reported Landmark:</span>
                <p className="text-slate-800 mt-0.5">{ticket.landmark}</p>
              </div>
            </div>

            {/* Jurisdiction & Nodal Officer */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-800 block mb-2">Responsible Civic Authority:</span>
                <div className="space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong className="text-slate-800">{ticket.assignedAgency}</strong> ({ticket.zone}, Ward {ticket.wardNumber} - {ticket.ward})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong className="text-slate-800">Nodal Officer:</strong> {ticket.nodalOfficer.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-5">
                    {ticket.nodalOfficer.designation}
                  </div>
                  <div className="flex items-center gap-1.5 pl-5 text-amber-800 font-semibold">
                    <Phone className="w-3 h-3 text-amber-700" />
                    <span>{ticket.nodalOfficer.contact}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>GPS: {ticket.coordinates.lat}, {ticket.coordinates.lng}</span>
                {ticket.workOrderNumber && (
                  <span className="font-mono font-bold text-slate-700">{ticket.workOrderNumber}</span>
                )}
              </div>
            </div>
          </div>

          {/* BBMP / Authority Action Simulation Panel */}
          {isOfficerMode && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Ward Officer Live Control Panel
                  </span>
                </div>
                <span className="text-[11px] text-amber-800 bg-amber-200 px-2 py-0.5 rounded font-mono font-bold">
                  BBMP / {ticket.assignedAgency} Portal
                </span>
              </div>

              <p className="text-xs text-amber-900 mb-3">
                Update ticket progress in the municipal database. Moving to "Resolved" requires photographic audit proof.
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Official action notes (e.g. Asphalting team deployed, pipe collar installed)"
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="flex flex-wrap items-center gap-2">
                  {ticket.status === 'Reported' && (
                    <button
                      onClick={() => handleAdvanceStatus('Verified')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span>Field Inspect & Mark "Verified"</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  {(ticket.status === 'Reported' || ticket.status === 'Verified') && (
                    <button
                      onClick={() => handleAdvanceStatus('In Progress')}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span>Issue Work Order & Mark "In Progress"</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  {ticket.status !== 'Resolved' && (
                    <div className="flex flex-col gap-2 w-full pt-2 border-t border-amber-200">
                      <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Sign-off & Resolve Issue:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedProofPhoto}
                          onChange={(e) => setSelectedProofPhoto(e.target.value)}
                          className="text-xs p-2 rounded-lg border border-emerald-300 bg-white flex-1"
                        >
                          <option value="https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80">
                            Road Patched & Rolled (Hot Mix Asphalt)
                          </option>
                          <option value="https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80">
                            Footpath Cleared & Sanitized (BBMP SWM)
                          </option>
                          <option value="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80">
                            Electrical Cable Insulated & Streetlight Lit
                          </option>
                        </select>
                        <button
                          onClick={() => handleAdvanceStatus('Resolved')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                        >
                          Submit Resolution Proof
                        </button>
                      </div>
                    </div>
                  )}

                  {ticket.status === 'Resolved' && (
                    <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 py-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>This ticket has been officially resolved and verified by BBMP.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onUpvote(ticket.id, e)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                ticket.hasUpvoted
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${ticket.hasUpvoted ? 'fill-slate-950' : ''}`} />
              <span>{ticket.hasUpvoted ? 'Upvoted' : 'Upvote Urgency'} ({ticket.upvotes})</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Link!' : 'Share Ticket'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Print Official Ticket</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              Close Ledger
            </button>
          </div>
        </div>

      </div>

      {/* Printable Official Municipal Docket Modal */}
      {isPrintModalOpen && (
        <PrintableTicketModal
          ticket={ticket}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};
