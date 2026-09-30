/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Map as MapIcon, 
  ListFilter, 
  SlidersHorizontal, 
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Ticket, CategoryType, StatusType, SeverityType } from './types';
import { INITIAL_TICKETS, CATEGORIES, BENGALURU_WARDS } from './data/mockData';
import { loadSavedTickets, saveTickets } from './utils/triage';
import { Navbar } from './components/Navbar';
import { CategoryGrid } from './components/CategoryGrid';
import { BengaluruMap } from './components/BengaluruMap';
import { TicketCard } from './components/TicketCard';
import { TicketDetailModal } from './components/TicketDetailModal';
import { ReportModal } from './components/ReportModal';
import { PublicLedgerStats } from './components/PublicLedgerStats';
import { PrintDocket } from './components/PrintDocket';

// Robust helper to match ticket numbers, formats like #1042, CP-BLR-1042, 1042, ticket 1042
function matchesTicketNumber(ticket: Ticket, query: string): boolean {
  const raw = query.trim().toLowerCase();
  if (!raw) return false;

  const ticketNumLower = ticket.ticketNumber.toLowerCase();
  const ticketIdLower = ticket.id.toLowerCase();

  // 1. Direct substring match (e.g. "cp-blr-1042", "1042", "t-1")
  if (ticketNumLower.includes(raw) || ticketIdLower.includes(raw)) {
    return true;
  }

  // 2. Strip leading '#' or 'ticket' or 'ticket#' (e.g. "#1042", "ticket 1042", "ticket #1042", "#CP-BLR-1042")
  const stripped = raw.replace(/^(ticket\s*#?|#)/i, '').trim();
  if (stripped && (ticketNumLower.includes(stripped) || ticketIdLower.includes(stripped))) {
    return true;
  }

  // 3. Alphanumeric match (ignoring dashes and spaces, e.g. "cpblr1042", "cp 1042", "cp blr 1042")
  const alphaNumQuery = raw.replace(/[^a-z0-9]/g, '');
  const alphaNumTicket = ticketNumLower.replace(/[^a-z0-9]/g, '');
  if (alphaNumQuery.length >= 2 && alphaNumTicket.includes(alphaNumQuery)) {
    return true;
  }

  // 4. Numeric digits match (e.g. query "1042" or "0985" matches "CP-BLR-1042")
  const queryDigits = raw.replace(/\D/g, '');
  const ticketDigits = ticket.ticketNumber.replace(/\D/g, '');
  if (queryDigits.length >= 2 && ticketDigits.includes(queryDigits)) {
    return true;
  }

  // 5. Work order number match (e.g. "WO-4819", "4819")
  if (ticket.workOrderNumber) {
    const woLower = ticket.workOrderNumber.toLowerCase();
    if (woLower.includes(raw) || (stripped && woLower.includes(stripped))) {
      return true;
    }
  }

  return false;
}

export default function App() {
  // Persistence State
  const [tickets, setTickets] = useState<Ticket[]>(() => loadSavedTickets(INITIAL_TICKETS));

  // Sync state to LocalStorage
  useEffect(() => {
    saveTickets(tickets);
  }, [tickets]);

  // Filters & Search State
  const [selectedWard, setSelectedWard] = useState<string>('All Bengaluru');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'urgent' | 'upvotes' | 'newest'>('urgent');

  // Auto-focus and highlight ticket on map and feed if search query matches a specific ticket #
  useEffect(() => {
    if (searchQuery.trim()) {
      const match = tickets.find((t) => matchesTicketNumber(t, searchQuery));
      if (match) {
        setSelectedTicketId(match.id);
      }
    }
  }, [searchQuery, tickets]);

  // UI View Modes
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'feed'>('split');
  const [isOfficerMode, setIsOfficerMode] = useState<boolean>(false);

  // Modals State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [detailModalTicket, setDetailModalTicket] = useState<Ticket | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportModalCategory, setReportModalCategory] = useState<CategoryType>('pothole');

  // Success Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Upvote Handler
  const handleUpvote = (ticketId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const hasUpvoted = t.hasUpvoted;
          const newUpvotes = hasUpvoted ? t.upvotes - 1 : t.upvotes + 1;
          return {
            ...t,
            upvotes: newUpvotes,
            hasUpvoted: !hasUpvoted,
          };
        }
        return t;
      })
    );

    // Also update detail modal ticket if currently viewing it
    setDetailModalTicket((curr) => {
      if (curr && curr.id === ticketId) {
        return {
          ...curr,
          upvotes: curr.hasUpvoted ? curr.upvotes - 1 : curr.upvotes + 1,
          hasUpvoted: !curr.hasUpvoted,
        };
      }
      return curr;
    });

    showToast('Civic priority upvoted! Thank you for participating.');
  };

  // Add New Ticket Handler
  const handleAddNewTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicketId(newTicket.id);
    setDetailModalTicket(newTicket);
    showToast(`Ticket #${newTicket.ticketNumber} successfully dispatched to ${newTicket.assignedAgency}! Printable docket ready.`);
  };

  // Merge Duplicate Handler
  const handleMergeDuplicate = (masterTicketId: string, additionalPhotoUrl: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === masterTicketId) {
          const newDuplicateCount = t.duplicateCount + 1;
          const newUpvotes = t.upvotes + 1;
          return {
            ...t,
            duplicateCount: newDuplicateCount,
            upvotes: newUpvotes,
            hasUpvoted: true,
            timeline: [
              ...t.timeline,
              {
                id: `ev-dup-${Date.now()}`,
                status: t.status,
                title: 'Duplicate Report Aggregated & Upvote Added',
                description: `AI Auto-Triage grouped a new citizen report from the same coordinates (+1 endorsement).`,
                timestamp: new Date().toISOString(),
                actor: 'CivicPulse Auto-Triage Engine',
                proofImageUrl: additionalPhotoUrl,
              },
            ],
          };
        }
        return t;
      })
    );

    setSelectedTicketId(masterTicketId);
    showToast(`Duplicate merged with Master Ticket #${masterTicketId}. Priority score boosted!`);
  };

  // Officer Update Status Handler
  const handleUpdateTicketStatus = (
    ticketId: string,
    newStatus: StatusType,
    notes?: string,
    completionPhotoUrl?: string
  ) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const isResolving = newStatus === 'Resolved';
          const updated: Ticket = {
            ...t,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            resolvedPhotoUrl: isResolving ? completionPhotoUrl || t.resolvedPhotoUrl : t.resolvedPhotoUrl,
            resolvedAt: isResolving ? new Date().toISOString() : t.resolvedAt,
            resolutionDetails: isResolving
              ? {
                  contractor: 'BBMP Rapid Remediation Gang',
                  materialsUsed: 'Standard municipal materials (Asphalt / Concrete / Precast)',
                  inspectedBy: 'Ward Assistant Executive Engineer',
                  completionNotes: notes || 'Work verified and photographic audit uploaded.',
                }
              : t.resolutionDetails,
            timeline: [
              ...t.timeline,
              {
                id: `ev-status-${Date.now()}`,
                status: newStatus,
                title: `Status advanced to: ${newStatus}`,
                description: notes || `Ward authority updated ticket status to ${newStatus}.`,
                timestamp: new Date().toISOString(),
                actor: 'BBMP Ward Authority',
                agency: t.assignedAgency,
                proofImageUrl: isResolving ? completionPhotoUrl : undefined,
              },
            ],
          };
          // Also sync detail modal ticket
          setDetailModalTicket(updated);
          return updated;
        }
        return t;
      })
    );

    showToast(`Ticket status updated to ${newStatus}. Public ledger timestamped.`);
  };

  // Reset Data to defaults
  const handleResetData = () => {
    if (confirm('Reset CivicPulse Bengaluru back to sample civic reports?')) {
      localStorage.removeItem('civicpulse_blr_tickets_v1');
      setTickets(INITIAL_TICKETS);
      setSelectedCategory('all');
      setSelectedWard('All Bengaluru');
      showToast('Civic database reset to default Bengaluru test reports.');
    }
  };

  // Direct Report from Category Grid
  const handleDirectReportCategory = (cat: CategoryType) => {
    setReportModalCategory(cat);
    setIsReportModalOpen(true);
  };

  // Calculate live category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType, number> = {
      pothole: 0,
      streetlight: 0,
      water_leak: 0,
      open_drain: 0,
      garbage: 0,
    };
    tickets.forEach((t) => {
      if (counts[t.category] !== undefined) {
        counts[t.category]++;
      }
    });
    return counts;
  }, [tickets]);

  // Municipal SLA & Overview Stats
  const municipalStats = useMemo(() => {
    const totalActive = tickets.filter((t) => t.status !== 'Resolved').length;
    const highSeverity = tickets.filter((t) => t.severity === 'High' && t.status !== 'Resolved').length;
    const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
    const slaComplianceRate = 92; // Benchmark target %

    return {
      totalActive,
      highSeverity,
      resolvedCount,
      slaComplianceRate,
    };
  }, [tickets]);

  // Filtered & Sorted Tickets
  const filteredTickets = useMemo(() => {
    const rawSearch = searchQuery.trim().toLowerCase();

    // Check if user is searching specifically by ticket number (e.g. "#1042", "1042", "CP-BLR-1042", "ticket 1042")
    const isSpecificTicketSearch = 
      rawSearch.startsWith('#') ||
      rawSearch.startsWith('cp') ||
      rawSearch.startsWith('ticket') ||
      /^\d{2,6}$/.test(rawSearch.replace(/\D/g, ''));

    return tickets
      .filter((t) => {
        // Evaluate ticket match with smart normalization
        const isTicketMatch = rawSearch ? matchesTicketNumber(t, searchQuery) : false;

        // If searching specifically by ticket number, a direct ticket match bypasses ward/category/status/severity filters
        if (rawSearch && isSpecificTicketSearch && isTicketMatch) {
          return true;
        }

        // Search query evaluation for general terms
        if (rawSearch) {
          const q = rawSearch.replace(/^[#]/, '').trim();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchLandmark = t.landmark.toLowerCase().includes(q);
          const matchWard = t.ward.toLowerCase().includes(q);
          const matchNumber = isTicketMatch;
          const matchAgency = t.assignedAgency.toLowerCase().includes(q);
          const matchReporter = t.reporter.name.toLowerCase().includes(q);
          const matchDesc = t.description.toLowerCase().includes(q);

          if (!matchTitle && !matchLandmark && !matchWard && !matchNumber && !matchAgency && !matchReporter && !matchDesc) {
            return false;
          }
        }

        // Ward filter (if not an explicit ticket match)
        if (!isTicketMatch && selectedWard !== 'All Bengaluru' && t.ward !== selectedWard) {
          return false;
        }

        // Category filter (if not an explicit ticket match)
        if (!isTicketMatch && selectedCategory !== 'all' && t.category !== selectedCategory) {
          return false;
        }

        // Status filter (if not an explicit ticket match)
        if (!isTicketMatch && statusFilter !== 'all' && t.status !== statusFilter) {
          return false;
        }

        // Severity filter (if not an explicit ticket match)
        if (!isTicketMatch && severityFilter !== 'all' && t.severity !== severityFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // When searching, direct ticket number matches are prioritized right to the top
        if (rawSearch) {
          const aTicketMatch = matchesTicketNumber(a, searchQuery);
          const bTicketMatch = matchesTicketNumber(b, searchQuery);
          if (aTicketMatch && !bTicketMatch) return -1;
          if (!aTicketMatch && bTicketMatch) return 1;
        }

        if (sortBy === 'urgent') {
          const severityWeight = { High: 3, Medium: 2, Low: 1 };
          const diff = severityWeight[b.severity] - severityWeight[a.severity];
          if (diff !== 0) return diff;
          return b.upvotes - a.upvotes;
        } else if (sortBy === 'upvotes') {
          return b.upvotes - a.upvotes;
        } else {
          return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
        }
      });
  }, [tickets, selectedWard, selectedCategory, statusFilter, severityFilter, searchQuery, sortBy]);

  // Active ticket for formal print docket
  const activePrintTicket = detailModalTicket || tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Municipal Navbar */}
      <Navbar
        selectedWard={selectedWard}
        onSelectWard={(w) => setSelectedWard(w)}
        onOpenReportModal={() => {
          setReportModalCategory('pothole');
          setIsReportModalOpen(true);
        }}
        onResetData={handleResetData}
        isOfficerMode={isOfficerMode}
        onToggleOfficerMode={() => {
          setIsOfficerMode(!isOfficerMode);
          showToast(
            !isOfficerMode
              ? 'Ward Officer Mode activated. You can now advance lifecycle statuses and upload resolution proof!'
              : 'Citizen Mode activated.'
          );
        }}
        stats={municipalStats}
      />

      {/* Officer Mode Banner Alert */}
      {isOfficerMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold text-center border-b border-amber-600 flex items-center justify-center gap-2 shadow-xs print:hidden">
          <Shield className="w-4 h-4 text-slate-950" />
          <span>
            BBMP / BWSSB / BESCOM OFFICER MODE ENGAGED — Click any ticket to inspect, verify, issue work orders, and attach Before & After completion proofs.
          </span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 print:hidden">
        
        {/* Category-First Homepage Grid */}
        <CategoryGrid
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          categoryCounts={categoryCounts}
          onDirectReportCategory={handleDirectReportCategory}
        />

        {/* Filter Bar & Controls */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ticket #, street landmark, ward, or keyword (e.g. Sony World, crater, BWSSB)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-slate-500 mr-1.5 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusType | 'all')}
                  className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Reported">Reported</option>
                  <option value="Verified">Verified</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-slate-500 mr-1.5 font-medium">Severity:</span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as SeverityType | 'all')}
                  className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Severities</option>
                  <option value="High">High Severity</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'urgent' | 'upvotes' | 'newest')}
                  className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="urgent">Sort: Critical First</option>
                  <option value="upvotes">Sort: Most Upvoted</option>
                  <option value="newest">Sort: Recently Logged</option>
                </select>
              </div>

              {/* Split / Map / Feed Toggle (for responsive layout control) */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('split')}
                  title="Split Screen (Map + Feed)"
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  title="Map View Only"
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Map Only
                </button>
                <button
                  onClick={() => setViewMode('feed')}
                  title="Card Feed Only"
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'feed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Feed Only
                </button>
              </div>
            </div>

          </div>

          {/* Active Filter Indicators */}
          {(selectedCategory !== 'all' || selectedWard !== 'All Bengaluru' || statusFilter !== 'all' || severityFilter !== 'all' || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <span className="font-semibold text-slate-500">Active Filters:</span>
              {selectedWard !== 'All Bengaluru' && (
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                  Ward: {selectedWard}
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
                  Category: {selectedCategory}
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-medium">
                  Status: {statusFilter}
                </span>
              )}
              {severityFilter !== 'all' && (
                <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded font-medium">
                  Severity: {severityFilter}
                </span>
              )}
              {searchQuery && (
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  Search: "{searchQuery}"
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedWard('All Bengaluru');
                  setSelectedCategory('all');
                  setStatusFilter('all');
                  setSeverityFilter('all');
                  setSearchQuery('');
                }}
                className="text-amber-800 hover:text-amber-900 font-bold ml-auto underline"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Interactive Map & Live Feed Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Interactive Map Container */}
            {(viewMode === 'split' || viewMode === 'map') && (
              <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'} sticky top-24`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Live Bengaluru Micro-Infrastructure Geo-Map
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Showing {filteredTickets.length} pinned faults
                  </span>
                </div>

                <BengaluruMap
                  tickets={filteredTickets}
                  selectedTicketId={selectedTicketId}
                  onSelectTicket={(ticket) => {
                    setSelectedTicketId(ticket.id);
                    setDetailModalTicket(ticket);
                  }}
                  heightClass={viewMode === 'map' ? 'h-[620px]' : 'h-[500px] lg:h-[580px]'}
                />
              </div>
            )}

            {/* Live Feed Card List Container */}
            {(viewMode === 'split' || viewMode === 'feed') && (
              <div className={`${viewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-slate-700" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Civic Fault Ledger & Resolution Stream
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    {filteredTickets.length} active records
                  </span>
                </div>

                {filteredTickets.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">No matching civic faults found</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Try broadening your search term or selecting "All Bengaluru" and "All Categories".
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedWard('All Bengaluru');
                        setStatusFilter('all');
                        setSeverityFilter('all');
                        setSearchQuery('');
                      }}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        isSelected={ticket.id === selectedTicketId}
                        onSelect={(t) => {
                          setSelectedTicketId(t.id);
                          setDetailModalTicket(t);
                        }}
                        onUpvote={handleUpvote}
                        isOfficerMode={isOfficerMode}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </section>

        {/* Municipal Governance Dashboard & Public Ledger Analytics */}
        <PublicLedgerStats tickets={tickets} />

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
              <span>CivicPulse Bengaluru</span>
              <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-mono">
                Gov-Tech 2.0
              </span>
            </div>
            <p className="text-slate-400 max-w-md">
              A transparent, community-driven micro-infrastructure monitoring platform connecting Bengaluru citizens with BBMP, BWSSB, and BESCOM departmental field gangs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-mono text-slate-400">
            <div>Emergency BBMP Control: <span className="text-amber-400 font-bold">1533 / 080-22660000</span></div>
            <div>BWSSB Water Toll-Free: <span className="text-sky-400 font-bold">1916</span></div>
            <div>BESCOM Power Helpline: <span className="text-yellow-400 font-bold">1912</span></div>
          </div>
        </div>
      </footer>

      {/* Ticket Details & Lifecycle Ledger Modal */}
      {detailModalTicket && (
        <TicketDetailModal
          ticket={detailModalTicket}
          isOpen={!!detailModalTicket}
          onClose={() => setDetailModalTicket(null)}
          onUpvote={handleUpvote}
          isOfficerMode={isOfficerMode}
          onUpdateTicketStatus={handleUpdateTicketStatus}
        />
      )}

      {/* Report an Issue Modal */}
      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          existingTickets={tickets}
          initialCategory={reportModalCategory}
          onSubmitNewTicket={handleAddNewTicket}
          onMergeWithDuplicate={handleMergeDuplicate}
        />
      )}

      {/* Stylized Formal PrintDocket (Hidden in standard UI, appears exclusively during print) */}
      <PrintDocket ticket={activePrintTicket} />
    </div>
  );
}
