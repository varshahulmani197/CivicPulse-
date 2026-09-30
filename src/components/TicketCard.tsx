import React from 'react';
import { 
  ThumbsUp, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  ArrowUpRight,
  Shield,
  Layers
} from 'lucide-react';
import { Ticket, StatusType } from '../types';
import { CATEGORIES } from '../data/mockData';

interface TicketCardProps {
  ticket: Ticket;
  isSelected?: boolean;
  onSelect: (ticket: Ticket) => void;
  onUpvote: (ticketId: string, e: React.MouseEvent) => void;
  isOfficerMode?: boolean;
}

const LIFECYCLE_STEPS: StatusType[] = ['Reported', 'Verified', 'In Progress', 'Resolved'];

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  isSelected = false,
  onSelect,
  onUpvote,
  isOfficerMode = false,
}) => {
  const categoryMeta = CATEGORIES.find((c) => c.id === ticket.category);
  const currentStepIndex = LIFECYCLE_STEPS.indexOf(ticket.status);

  // Severity styling
  const severityBadge = {
    High: 'bg-rose-500/10 text-rose-700 border-rose-500/30',
    Medium: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
    Low: 'bg-slate-500/10 text-slate-700 border-slate-500/30',
  }[ticket.severity];

  const formattedDate = new Date(ticket.reportedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article
      onClick={() => onSelect(ticket)}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 cursor-pointer p-4 sm:p-5 text-left flex flex-col justify-between ${
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div>
        {/* Top Meta Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500">
              {ticket.ticketNumber}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>{categoryMeta?.emoji}</span>
              <span>{categoryMeta?.shortLabel}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Duplicate grouping badge */}
            {ticket.duplicateCount > 0 && (
              <span
                title="AI Auto-Triage merged matching nearby reports into this Master Ticket"
                className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1"
              >
                <Layers className="w-3 h-3 text-amber-600" />
                <span>+{ticket.duplicateCount} Merged</span>
              </span>
            )}

            {/* Severity Indicator */}
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${severityBadge}`}
            >
              {ticket.severity === 'High' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
              <span>{ticket.severity} Severity</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug mb-2">
          {ticket.title}
        </h3>

        {/* Location Landmark & Ward */}
        <div className="flex items-start gap-1.5 text-xs text-slate-600 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
          <span className="line-clamp-1">
            <span className="font-semibold text-slate-800">{ticket.landmark}</span> (Ward {ticket.wardNumber}, {ticket.ward})
          </span>
        </div>

        {/* Photo Preview / Before & After Badge */}
        {ticket.status === 'Resolved' && ticket.resolvedPhotoUrl ? (
          <div className="mb-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1.5">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>BBMP Before & After Inspection Proof Verified</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                Resolved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative rounded-lg overflow-hidden h-24 bg-slate-100 border border-slate-200">
                <img
                  src={ticket.photoUrl}
                  alt="Issue Before"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  BEFORE
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden h-24 bg-slate-100 border border-emerald-300">
                <img
                  src={ticket.resolvedPhotoUrl}
                  alt="Issue After Resolution"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  AFTER (WORK COMPLETE)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 relative rounded-xl overflow-hidden h-28 bg-slate-100 border border-slate-200">
            <img
              src={ticket.photoUrl}
              alt={ticket.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
              Citizen Photographic Proof
            </div>
          </div>
        )}

        {/* Public Accountability Lifecycle Tracker */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-2">
            <span>Progress Lifecycle</span>
            <span className="font-bold text-slate-800">
              Agency: <span className="text-amber-800">{ticket.assignedAgency}</span>
            </span>
          </div>

          <div className="relative flex items-center justify-between">
            {/* Track Line */}
            <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${(currentStepIndex / (LIFECYCLE_STEPS.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Steps */}
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                      isCompleted
                        ? 'bg-emerald-600 border-white text-white shadow-xs'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[9px] mt-1 font-semibold whitespace-nowrap ${
                      isCurrent
                        ? 'text-slate-900 font-bold'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Citizen Upvote Button */}
          <button
            onClick={(e) => onUpvote(ticket.id, e)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              ticket.hasUpvoted
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${ticket.hasUpvoted ? 'fill-slate-950' : ''}`} />
            <span>{ticket.upvotes}</span>
          </button>

          {/* View Details Action */}
          <button
            onClick={() => onSelect(ticket)}
            className="flex items-center gap-1 text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors p-1"
          >
            <span>Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
