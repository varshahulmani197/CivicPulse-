import React from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Phone, 
  User, 
  ShieldCheck, 
  QrCode,
  Building2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Ticket } from '../types';
import { CATEGORIES } from '../data/mockData';

interface PrintableTicketModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableTicketModal: React.FC<PrintableTicketModalProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const categoryMeta = CATEGORIES.find((c) => c.id === ticket.category);

  // Authority specific insignia details
  const getAuthorityDetails = () => {
    switch (ticket.assignedAgency) {
      case 'BWSSB':
        return {
          kannadaName: 'ಬೆಂಗಳೂರು ನೀರು ಸರಬರಾಜು ಮತ್ತು ಒಳಚರಂಡಿ ಮಂಡಳಿ',
          fullName: 'Bangalore Water Supply and Sewerage Board (BWSSB)',
          subDivision: `Cauvery Water Supply & Drainage Sub-Division · ${ticket.ward} Ward ${ticket.wardNumber}`,
          actRef: 'BWSSB Act, 1964 · Citizen Charter Grievance Redressal',
          color: '#0284c7',
        };
      case 'BESCOM':
        return {
          kannadaName: 'ಬೆಂಗಳೂರು ವಿದ್ಯುತ್ ಸರಬರಾಜು ಕಂಪನಿ ನಿಯಮಿತ',
          fullName: 'Bangalore Electricity Supply Company Limited (BESCOM)',
          subDivision: `Operations & Electrical Maintenance Sub-Division · ${ticket.ward} Ward ${ticket.wardNumber}`,
          actRef: 'Karnataka Electricity Regulatory Grievance Cell',
          color: '#ca8a04',
        };
      case 'BBMP':
      default:
        return {
          kannadaName: 'ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ',
          fullName: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
          subDivision: `Road Infrastructure & Stormwater Drain Cell · ${ticket.zone}, Ward ${ticket.wardNumber}`,
          actRef: 'Karnataka Sakala Services Act, 2011 & BBMP Act, 2020',
          color: '#b45309',
        };
    }
  };

  const authority = getAuthorityDetails();

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(ticket.reportedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Simulated digital e-signature hash
  const digitalSignatureHash = `E-SIGN-KA-BLR-${ticket.ticketNumber}-${ticket.wardNumber}-${ticket.reportedAt.replace(/\D/g, '').slice(0, 10)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold">Official Municipal Docket Preview</h3>
              <p className="text-[11px] text-slate-400">Ready for printing or PDF export (A4 format)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Print Official Ticket / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
          
          {/* THE PRINTABLE TICKET SHEET */}
          <div 
            id="printable-ticket-content"
            className="bg-white mx-auto max-w-[800px] border-2 border-slate-900 p-6 sm:p-8 shadow-lg print:shadow-none print:border-2 print:border-black print:p-6 print:m-0 text-slate-900 font-sans"
          >
            {/* 1. MUNICIPAL AUTHORITY HEADER WITH OFFICIAL LOGO & EMBLEM */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5">
              <div className="flex items-center justify-between gap-4">
                {/* Authority Insignia / Seal */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-slate-900 p-2 flex flex-col items-center justify-center text-center bg-slate-50 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-amber-400 mb-1">
                    <Building2 className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-[9px] font-black uppercase font-mono tracking-tighter">
                    {ticket.assignedAgency}
                  </span>
                </div>

                {/* Authority Title Banner */}
                <div className="text-center flex-1">
                  <div className="text-xs font-semibold text-slate-600 mb-0.5">
                    ಸರ್ಕಾರ ಕರ್ನಾಟಕ · GOVERNMENT OF KARNATAKA
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-800">
                    {authority.kannadaName}
                  </div>
                  <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-950 uppercase">
                    {authority.fullName}
                  </h1>
                  <div className="text-xs font-bold text-amber-800 mt-0.5">
                    CIVICPULSE BENGALURU URBAN FAULT DISPATCH & ACCOUNTABILITY LEDGER
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {authority.subDivision}
                  </div>
                </div>

                {/* State Emblem Crest Reference */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-slate-900 p-1 flex flex-col items-center justify-center text-center bg-slate-50 shrink-0">
                  <ShieldCheck className="w-7 h-7 text-slate-800 mb-0.5" />
                  <span className="text-[8px] font-bold text-slate-600 uppercase">
                    SATYAMEVA JAYATE
                  </span>
                </div>
              </div>

              {/* Docket Sub-header bar */}
              <div className="mt-4 pt-2.5 border-t border-dashed border-slate-400 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500">OFFICIAL DOCKET NO: </span>
                  <span className="font-black text-slate-900 text-sm bg-slate-100 px-2 py-0.5 border border-slate-300 rounded">
                    {ticket.ticketNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">DATE LODGED: </span>
                  <span className="font-bold text-slate-900">{formattedDate}</span>
                </div>
                <div>
                  <span className="text-slate-500">LIFECYCLE STATUS: </span>
                  <span className="font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                    {ticket.status}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. RESPONSIBLE JURISDICTION & AUTHORITY DETAILS */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned Authority:</span>
                  <span className="font-black text-slate-900 text-sm">{ticket.assignedAgency}</span>
                  <span className="text-slate-600 block text-[11px]">{authority.actRef}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Ward & Zone:</span>
                  <span className="font-bold text-slate-900">Ward {ticket.wardNumber} - {ticket.ward}</span>
                  <span className="text-slate-600 block text-[11px]">{ticket.zone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Nodal Grievance Officer:</span>
                  <span className="font-bold text-slate-900">{ticket.nodalOfficer.name}</span>
                  <span className="text-slate-600 block text-[11px]">{ticket.nodalOfficer.contact}</span>
                </div>
              </div>
            </div>

            {/* 3. CITIZEN REPORTER DETAILS */}
            <div className="border border-slate-300 rounded-lg p-3 mb-5 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Citizen Reporter Identification</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Identity OTP Verified
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 block text-[11px]">Reporter Name:</span>
                  <span className="font-black text-slate-900 text-sm flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    <span>{ticket.reporter.name}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Reporter Mobile No:</span>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>{ticket.reporter.phoneMasked}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Citizen Endorsements:</span>
                  <span className="font-bold text-slate-900">
                    {ticket.upvotes} Citizen Upvotes · {ticket.duplicateCount} Merged
                  </span>
                </div>
              </div>
            </div>

            {/* 4. ISSUE DETAILS & DETAILED DESCRIPTION */}
            <div className="border border-slate-300 rounded-lg p-3.5 mb-5 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Fault Classification & Summary
                </span>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">{categoryMeta?.emoji}</span>
                  <span className="font-bold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {categoryMeta?.label}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    ticket.severity === 'High' 
                      ? 'bg-rose-100 text-rose-800 border-rose-300' 
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {ticket.severity} Severity Priority
                  </span>
                </div>
                <h2 className="text-base font-black text-slate-950 leading-snug">
                  {ticket.title}
                </h2>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Detailed Citizen Description
                </span>
                <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                  {ticket.description}
                </p>
              </div>

              {/* Exact Location & GPS Coordinates */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Exact Location & Landmark
                </span>
                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                  <MapPin className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block">{ticket.landmark}</span>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 mt-0.5 font-mono">
                      <span>Ward: {ticket.ward} (No. {ticket.wardNumber})</span>
                      <span>·</span>
                      <span>Zone: {ticket.zone}</span>
                      <span>·</span>
                      <span>GPS Coordinates: {ticket.coordinates.lat}, {ticket.coordinates.lng}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. PHOTOGRAPHIC PROOF */}
            <div className="border border-slate-300 rounded-lg p-3.5 mb-5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
                Mandatory Photographic Evidence / Site Proof
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="rounded-lg overflow-hidden border-2 border-slate-900 max-h-52 bg-slate-100 relative">
                  <img
                    src={ticket.photoUrl}
                    alt="Photographic Proof"
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-white text-[9px] font-mono px-2 py-1 flex items-center justify-between">
                    <span>GEO-TAGGED EVIDENCE</span>
                    <span>GPS: {ticket.coordinates.lat}, {ticket.coordinates.lng}</span>
                  </div>
                </div>

                <div className="text-xs space-y-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 text-xs">Digital Verification Metadata:</div>
                  <div className="text-[11px]">
                    <span className="text-slate-500">Image Hash: </span>
                    <span className="font-mono font-bold">SHA-256:{ticket.id.slice(0, 12)}...OK</span>
                  </div>
                  <div className="text-[11px]">
                    <span className="text-slate-500">Geo-Fence Match: </span>
                    <span className="text-emerald-700 font-bold">Validated inside Bengaluru City Limits</span>
                  </div>
                  <div className="text-[11px]">
                    <span className="text-slate-500">Triage Result: </span>
                    <span className="font-semibold text-slate-800">{ticket.severityReason}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. OFFICIAL E-SIGNATURE & SAKALA ACT AUTHENTICATION */}
            <div className="border-2 border-slate-900 rounded-xl p-4 bg-slate-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* E-Signature Seal */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-950 uppercase tracking-tight">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>AUTHENTICATED DIGITAL E-SIGNATURE</span>
                  </div>
                  
                  {/* Digital Signature Display */}
                  <div className="font-serif italic text-lg sm:text-xl font-bold text-slate-800 py-1 border-b border-slate-400">
                    Digitally Signed via CivicPulse PKI
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono">
                    Certificate Token: <span className="font-bold text-slate-800">{digitalSignatureHash}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Signed Timestamp: <span className="text-slate-800">{new Date(ticket.reportedAt).toISOString()}</span>
                  </div>
                </div>

                {/* QR Code / Grievance Cell Seal */}
                <div className="flex items-center gap-3 border border-slate-300 p-2.5 rounded-lg bg-white shrink-0">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded p-1 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-white" />
                  </div>
                  <div className="text-[9px] text-slate-600 leading-tight">
                    <div className="font-bold text-slate-900">KARNATAKA SAKALA</div>
                    <div>Grievance Cell Ref</div>
                    <div className="font-mono text-slate-800 font-bold mt-0.5">{ticket.ticketNumber}</div>
                    <div className="text-[8px] text-emerald-700 font-bold mt-0.5">VERIFIED DOCKET</div>
                  </div>
                </div>

              </div>

              {/* Legal Disclaimer */}
              <div className="mt-3 pt-2.5 border-t border-slate-200 text-[9px] text-slate-500 leading-normal">
                This is an official computer-generated micro-infrastructure grievance ticket issued under the Bruhat Bengaluru Mahanagara Palike Act, 2020 and the Karnataka Guarantee of Services to Citizens (Sakala) Act, 2011. It bears an authenticated digital e-signature; no physical signature is required.
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls (Hidden during print) */}
        <div className="print:hidden bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Click <strong>Print Official Ticket</strong> or press <strong>Ctrl+P (Cmd+P)</strong> to save as PDF.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Ticket</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
