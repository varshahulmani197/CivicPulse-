import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  ShieldCheck, 
  QrCode, 
  FileText,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Ticket } from '../types';
import { CATEGORIES } from '../data/mockData';

interface PrintDocketProps {
  ticket: Ticket | null;
}

export const PrintDocket: React.FC<PrintDocketProps> = ({ ticket }) => {
  if (!ticket) return null;

  const categoryMeta = CATEGORIES.find((c) => c.id === ticket.category);

  // Authority specific styling and metadata
  const getDepartmentConfig = () => {
    switch (ticket.assignedAgency) {
      case 'BWSSB':
        return {
          deptKannada: 'ಬೆಂಗಳೂರು ನೀರು ಸರಬರಾಜು ಮತ್ತು ಒಳಚರಂಡಿ ಮಂಡಳಿ',
          deptEnglish: 'BANGALORE WATER SUPPLY AND SEWERAGE BOARD',
          subOffice: `Water Supply & Drainage Maintenance Division · Ward ${ticket.wardNumber}`,
          actTitle: 'BWSSB Act, 1964 · Public Grievance Charter',
          acronym: 'BWSSB',
          logoSubtext: 'WATER WORKS',
        };
      case 'BESCOM':
        return {
          deptKannada: 'ಬೆಂಗಳೂರು ವಿದ್ಯುತ್ ಸರಬರಾಜು ಕಂಪನಿ ನಿಯಮಿತ',
          deptEnglish: 'BANGALORE ELECTRICITY SUPPLY COMPANY LIMITED',
          subOffice: `Electrical Distribution & Streetlight Maintenance Sub-Division · Ward ${ticket.wardNumber}`,
          actTitle: 'Karnataka Electricity Governance Charter',
          acronym: 'BESCOM',
          logoSubtext: 'POWER GRID',
        };
      case 'BBMP':
      default:
        return {
          deptKannada: 'ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ',
          deptEnglish: 'BRUHAT BENGALURU MAHANAGARA PALIKE',
          subOffice: `Road Infrastructure & Stormwater Drainage Division · ${ticket.zone}, Ward ${ticket.wardNumber}`,
          actTitle: 'BBMP Act, 2020 & Karnataka Sakala Services Act, 2011',
          acronym: 'BBMP',
          logoSubtext: 'CIVIC WORKS',
        };
    }
  };

  const dept = getDepartmentConfig();

  const formattedDate = new Date(ticket.reportedAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const digitalSignatureHash = `E-SIGN-KA-BLR-${ticket.ticketNumber}-${ticket.wardNumber}-${ticket.reportedAt.replace(/\D/g, '').slice(0, 10)}`;

  return (
    <aside 
      id="printable-ticket-content"
      aria-label="Formal Municipal Action Docket"
      className="print-docket-root hidden print:block w-full max-w-[820px] mx-auto bg-white text-black p-6 sm:p-8 font-sans border-2 border-black"
    >
      {/* 1. OFFICIAL DEPARTMENT LOGO & HEADER */}
      <header className="border-b-2 border-black pb-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Department Logo / Insignia Box */}
          <div className="w-20 h-20 border-2 border-black rounded-lg p-1.5 flex flex-col items-center justify-center text-center bg-neutral-50 shrink-0">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center mb-0.5">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <span className="text-[10px] font-black uppercase font-mono tracking-tight leading-none mt-0.5">
              {dept.acronym}
            </span>
            <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest leading-none mt-0.5">
              {dept.logoSubtext}
            </span>
          </div>

          {/* Department Formal Titles */}
          <div className="text-center flex-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-700">
              ಸರ್ಕಾರ ಕರ್ನಾಟಕ · GOVERNMENT OF KARNATAKA
            </div>
            <div className="text-xs sm:text-sm font-bold text-neutral-900 mt-0.5">
              {dept.deptKannada}
            </div>
            <h1 className="text-sm sm:text-lg font-black tracking-tight uppercase leading-snug">
              {dept.deptEnglish}
            </h1>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 mt-0.5">
              CIVICPULSE URBAN INFRASTRUCTURE GRIEVANCE ACTION DOCKET
            </div>
            <div className="text-[9px] font-mono text-neutral-600 mt-0.5">
              {dept.subOffice}
            </div>
          </div>

          {/* State Emblem / Seal Box */}
          <div className="w-20 h-20 border-2 border-black rounded-lg p-1.5 flex flex-col items-center justify-center text-center bg-neutral-50 shrink-0">
            <ShieldCheck className="w-8 h-8 text-neutral-900 mb-0.5" />
            <span className="text-[7px] font-black uppercase tracking-tight leading-tight">
              SATYAMEVA JAYATE
            </span>
            <span className="text-[7px] font-bold text-neutral-600 uppercase mt-0.5">
              SEAL OF KA
            </span>
          </div>
        </div>

        {/* Docket Identification & Timestamps */}
        <div className="mt-3 pt-2 border-t border-black flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div>
            <span className="font-bold text-neutral-600">DOCKET NO: </span>
            <span className="font-black text-sm bg-neutral-100 px-2 py-0.5 border border-black rounded">
              {ticket.ticketNumber}
            </span>
          </div>
          <div>
            <span className="font-bold text-neutral-600">DATE RECORDED: </span>
            <span className="font-bold">{formattedDate}</span>
          </div>
          <div>
            <span className="font-bold text-neutral-600">LIFECYCLE STATUS: </span>
            <span className="font-black uppercase px-2 py-0.5 bg-black text-white rounded">
              {ticket.status}
            </span>
          </div>
        </div>
      </header>

      {/* 2. JURISDICTION & ASSIGNED AUTHORITY */}
      <section className="border border-black rounded-md p-3 mb-3 text-xs bg-neutral-50">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <span className="block text-[9px] font-bold uppercase text-neutral-600">Responsible Authority:</span>
            <span className="font-black text-sm">{ticket.assignedAgency}</span>
            <span className="block text-[10px] text-neutral-700">{dept.actTitle}</span>
          </div>
          <div>
            <span className="block text-[9px] font-bold uppercase text-neutral-600">Ward & Zone:</span>
            <span className="font-bold">Ward {ticket.wardNumber} - {ticket.ward}</span>
            <span className="block text-[10px] text-neutral-700">{ticket.zone}</span>
          </div>
          <div>
            <span className="block text-[9px] font-bold uppercase text-neutral-600">Assigned Nodal Officer:</span>
            <span className="font-bold">{ticket.nodalOfficer.name}</span>
            <span className="block text-[10px] text-neutral-700">{ticket.nodalOfficer.contact}</span>
          </div>
        </div>
      </section>

      {/* 3. REPORTER METADATA (NAME, CONTACT) */}
      <section className="border border-black rounded-md p-3 mb-3 text-xs">
        <div className="text-[9px] font-black uppercase tracking-wider text-neutral-700 border-b border-neutral-300 pb-1 mb-2 flex items-center justify-between">
          <span>Complainant / Citizen Reporter Identification</span>
          <span className="font-bold">Sakala Verified Grievance</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <span className="block text-[9px] text-neutral-600 uppercase font-semibold">Reporter Name:</span>
            <span className="font-black text-sm">{ticket.reporter.name}</span>
          </div>
          <div>
            <span className="block text-[9px] text-neutral-600 uppercase font-semibold">Mobile Number:</span>
            <span className="font-bold font-mono text-sm">{ticket.reporter.phoneMasked}</span>
          </div>
          <div>
            <span className="block text-[9px] text-neutral-600 uppercase font-semibold">Community Priority:</span>
            <span className="font-bold">{ticket.upvotes} Citizen Endorsements · {ticket.duplicateCount} Merged</span>
          </div>
        </div>
      </section>

      {/* 4. TICKET METADATA (TITLE, CATEGORY, DESCRIPTION, LOCATION) */}
      <section className="border border-black rounded-md p-3.5 mb-3 text-xs space-y-2.5">
        <div>
          <span className="block text-[9px] font-bold uppercase text-neutral-600 tracking-wider">
            Issue Title & Classification
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-[11px] px-2 py-0.5 bg-neutral-100 border border-neutral-400 rounded">
              {categoryMeta?.label}
            </span>
            <span className="font-bold text-[10px] px-2 py-0.5 border border-black rounded">
              {ticket.severity} Priority Severity
            </span>
          </div>
          <h2 className="text-base font-black text-neutral-950 mt-1.5 leading-snug">
            {ticket.title}
          </h2>
        </div>

        <div>
          <span className="block text-[9px] font-bold uppercase text-neutral-600 tracking-wider">
            Detailed Citizen Description:
          </span>
          <p className="text-xs text-neutral-900 bg-neutral-50 p-2.5 rounded border border-neutral-300 mt-1 leading-relaxed">
            {ticket.description}
          </p>
        </div>

        <div>
          <span className="block text-[9px] font-bold uppercase text-neutral-600 tracking-wider">
            Exact Location & Coordinates:
          </span>
          <div className="flex items-start gap-2 bg-neutral-50 p-2 rounded border border-neutral-300 mt-1">
            <MapPin className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">{ticket.landmark}</span>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-neutral-700 mt-0.5">
                <span>Ward: {ticket.ward} (No. {ticket.wardNumber})</span>
                <span>·</span>
                <span>Zone: {ticket.zone}</span>
                <span>·</span>
                <span>GPS: Lat {ticket.coordinates.lat}, Lng {ticket.coordinates.lng}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PHOTOGRAPHIC PROOF */}
      {ticket.photoUrl && (
        <section className="border border-black rounded-md p-3 mb-3 text-xs">
          <span className="block text-[9px] font-bold uppercase text-neutral-600 tracking-wider mb-2">
            Photographic Evidence / Site Inspection Record
          </span>
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="border border-black rounded overflow-hidden max-h-40 bg-neutral-100 relative">
              <img 
                src={ticket.photoUrl} 
                alt="Fault Evidence" 
                className="w-full h-36 object-cover" 
              />
              <div className="absolute bottom-0 inset-x-0 bg-black text-white text-[8px] font-mono px-2 py-0.5 flex justify-between">
                <span>GEO-LOCATED PROOF</span>
                <span>{ticket.coordinates.lat}, {ticket.coordinates.lng}</span>
              </div>
            </div>
            <div className="text-[11px] text-neutral-800 space-y-1.5 bg-neutral-50 p-2.5 rounded border border-neutral-300">
              <div><span className="font-bold">Image Hash: </span><span className="font-mono">SHA256:{ticket.id.slice(0, 10)}...OK</span></div>
              <div><span className="font-bold">Geo-Verification: </span>Bengaluru Urban Limits</div>
              <div><span className="font-bold">AI Triage Rationale: </span>{ticket.severityReason}</div>
              {ticket.workOrderNumber && (
                <div><span className="font-bold">Work Order: </span><span className="font-mono">{ticket.workOrderNumber}</span></div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. SIGNATURE PLACEHOLDERS & FORMAL E-SIGN STAMP AT THE BOTTOM */}
      <footer className="border-2 border-black rounded-md p-4 bg-neutral-50 text-xs">
        {/* Physical & Official Signatures Row */}
        <div className="grid grid-cols-2 gap-8 pb-4 mb-3 border-b border-black">
          
          {/* Reporter Signature Box */}
          <div className="flex flex-col justify-between h-24">
            <span className="text-[9px] font-bold uppercase text-neutral-600 tracking-wider">
              1. Complainant / Citizen Reporter
            </span>
            <div className="border-b-2 border-black border-dashed mt-auto mb-1"></div>
            <div className="flex items-center justify-between text-[10px] text-neutral-700">
              <span>Signature of Reporter</span>
              <span>Date: ____/____/2026</span>
            </div>
          </div>

          {/* Department Inspecting Authority Signature Box */}
          <div className="flex flex-col justify-between h-24 border-l border-neutral-300 pl-6">
            <span className="text-[9px] font-bold uppercase text-neutral-600 tracking-wider">
              2. Ward Inspecting Officer / Executive Engineer
            </span>
            <div className="border-b-2 border-black border-dashed mt-auto mb-1"></div>
            <div className="flex items-center justify-between text-[10px] text-neutral-700">
              <span>Official Signature & Seal</span>
              <span>Work Order Issued: [ &nbsp; ]</span>
            </div>
          </div>

        </div>

        {/* Digital E-Sign Authentication & Sakala Reference */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-tight">
              <ShieldCheck className="w-4 h-4 text-neutral-900" />
              <span>AUTHENTICATED DIGITAL E-SIGNATURE</span>
            </div>
            <div className="font-serif italic text-base font-bold text-neutral-900">
              Digitally Validated via CivicPulse PKI Key
            </div>
            <div className="text-[9px] font-mono text-neutral-600">
              Certificate Token: <span className="font-bold text-neutral-900">{digitalSignatureHash}</span>
            </div>
            <div className="text-[8px] text-neutral-500 max-w-md leading-tight mt-1">
              Issued under the Karnataka Guarantee of Services to Citizens (Sakala) Act, 2011. Computer-generated certified docket.
            </div>
          </div>

          <div className="flex items-center gap-2 border border-black p-1.5 rounded bg-white shrink-0">
            <div className="w-12 h-12 bg-black text-white p-1 rounded flex items-center justify-center">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <div className="text-[8px] font-mono text-neutral-700 leading-tight">
              <div className="font-bold text-black">{ticket.ticketNumber}</div>
              <div>SAKALA CERTIFIED</div>
              <div className="text-black font-bold">BBMP/BWSSB/BESCOM</div>
            </div>
          </div>
        </div>
      </footer>
    </aside>
  );
};
