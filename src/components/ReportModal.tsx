import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Layers, 
  Cpu, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  Navigation,
  Upload,
  FolderOpen,
  FileCheck,
  ImageIcon
} from 'lucide-react';
import { CategoryType, LocationCoordinates, SeverityType, Ticket } from '../types';
import { CATEGORIES, BENGALURU_WARDS } from '../data/mockData';
import { computeAutomatedSeverity, checkDuplicateReport } from '../utils/triage';
import { BengaluruMap } from './BengaluruMap';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTickets: Ticket[];
  initialCategory?: CategoryType;
  onSubmitNewTicket: (newTicket: Ticket) => void;
  onMergeWithDuplicate: (masterTicketId: string, additionalPhotoUrl: string) => void;
}

const PROXIMITY_OPTIONS = [
  'Near School / College',
  'Near Hospital / Clinic',
  'Major Traffic Junction',
  'Pedestrian Walkway',
  'Flooding Risk',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  existingTickets,
  initialCategory = 'pothole',
  onSubmitNewTicket,
  onMergeWithDuplicate,
}) => {
  if (!isOpen) return null;

  // Form State
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wardName, setWardName] = useState('Koramangala');
  const [landmark, setLandmark] = useState('');
  const [coordinates, setCoordinates] = useState<LocationCoordinates>({
    lat: 12.9352,
    lng: 77.6245,
  });
  const [proximityRisks, setProximityRisks] = useState<string[]>(['Major Traffic Junction']);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [reporterName, setReporterName] = useState('Naveen Gowda');
  const [reporterPhone, setReporterPhone] = useState('+91 98451 22910');

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setPhotoUrl(result);
        setUploadedFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // UI Flow State
  const [isMapPinMode, setIsMapPinMode] = useState(false);
  const [isTriageProcessing, setIsTriageProcessing] = useState(false);
  const [triageStage, setTriageStage] = useState('');
  const [duplicateFound, setDuplicateFound] = useState<{
    isDuplicate: boolean;
    masterTicket?: Ticket;
    distanceMeters?: number;
    similarityPercent: number;
  } | null>(null);

  // Update default coordinates when ward changes
  const handleWardChange = (newWard: string) => {
    setWardName(newWard);
    const wardObj = BENGALURU_WARDS.find((w) => w.name === newWard);
    if (wardObj && wardObj.number !== 0) {
      setCoordinates({
        lat: Number((wardObj.lat + (Math.random() - 0.5) * 0.006).toFixed(5)),
        lng: Number((wardObj.lng + (Math.random() - 0.5) * 0.006).toFixed(5)),
      });
    }
  };

  // Toggle proximity checkbox
  const toggleRisk = (risk: string) => {
    setProximityRisks((prev) =>
      prev.includes(risk) ? prev.filter((r) => r !== risk) : [...prev, risk]
    );
  };

  // Real-time calculated automated severity preview
  const liveSeverity = computeAutomatedSeverity(
    title || 'Pothole issue',
    description,
    proximityRisks,
    category
  );

  // Handle Form Submission -> AI Auto-Triage & Deduplication Simulation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!photoUrl) {
      alert('Please upload photographic proof using the file manager before dispatching.');
      return;
    }

    setIsTriageProcessing(true);
    setTriageStage('Scanning spatial coordinates across Bengaluru ward database...');

    setTimeout(() => {
      setTriageStage('Computing Haversine proximity & textual similarity matrices...');

      setTimeout(() => {
        // Run deduplication check
        const dupResult = checkDuplicateReport(
          coordinates,
          category,
          title,
          existingTickets
        );

        if (dupResult.isDuplicate && dupResult.masterTicket) {
          setDuplicateFound(dupResult);
          setIsTriageProcessing(false);
        } else {
          // Brand new unique ticket
          completeTicketCreation();
        }
      }, 700);
    }, 600);
  };

  const completeTicketCreation = () => {
    const selectedWardObj = BENGALURU_WARDS.find((w) => w.name === wardName) || BENGALURU_WARDS[1];
    const catMeta = CATEGORIES.find((c) => c.id === category);
    const agency = catMeta?.defaultAgency || 'BBMP';

    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
      ticketNumber: `CP-BLR-${Math.floor(1050 + Math.random() * 900)}`,
      category,
      title: title.trim(),
      description: description.trim() || 'Citizen reported issue requiring municipal inspection and remedial action.',
      landmark: landmark.trim() || `Near ${wardName} junction`,
      ward: wardName,
      wardNumber: selectedWardObj.number || 151,
      zone: selectedWardObj.zone || 'South Zone',
      coordinates,
      severity: liveSeverity.severity,
      severityReason: liveSeverity.reason,
      proximityRisks,
      status: 'Reported',
      assignedAgency: agency,
      nodalOfficer: {
        name: agency === 'BWSSB' ? 'Er. Manjunath Swamy' : agency === 'BESCOM' ? 'Er. Girish Hegde' : 'Er. Ramesh Kumar',
        designation: `Executive Engineer, ${agency} ${wardName} Sub-Division`,
        contact: '+91 94806 83100',
      },
      reporter: {
        name: reporterName || 'Bengaluru Resident',
        isAnonymous: false,
        phoneMasked: reporterPhone || '+91 98451 22910',
      },
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 1,
      hasUpvoted: true,
      duplicateCount: 0,
      photoUrl,
      timeline: [
        {
          id: `ev-new-${Date.now()}`,
          status: 'Reported',
          title: 'Citizen Report Filed & Geo-Tagged',
          description: `Logged with GPS coordinates (${coordinates.lat}, ${coordinates.lng}) and safety score of ${liveSeverity.severity} Priority.`,
          timestamp: new Date().toISOString(),
          actor: reporterName || 'Bengaluru Citizen',
        },
      ],
    };

    onSubmitNewTicket(newTicket);
    setIsTriageProcessing(false);
    onClose();
  };

  const handleMergeConfirm = () => {
    if (duplicateFound?.masterTicket) {
      onMergeWithDuplicate(duplicateFound.masterTicket.id, photoUrl);
      setIsTriageProcessing(false);
      setDuplicateFound(null);
      onClose();
    }
  };

  const handleIgnoreAndCreateNew = () => {
    setDuplicateFound(null);
    completeTicketCreation();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-amber-300">
                CITIZEN FAULT DISPATCH
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Report Urban Infrastructure Fault
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Triage Simulation Overlay */}
        {isTriageProcessing && (
          <div className="p-8 text-center bg-white flex flex-col items-center justify-center space-y-4 min-h-[360px]">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 animate-pulse">
                <Cpu className="w-8 h-8 animate-spin" />
              </div>
              <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              AI Auto-Triage & Deduplication Engine Active
            </h3>
            <p className="text-xs font-mono text-slate-500 max-w-md">
              {triageStage}
            </p>
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 animate-[pulse_1s_infinite] w-3/4 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Deduplication Detected Interstitial Dialog */}
        {!isTriageProcessing && duplicateFound?.masterTicket && (
          <div className="p-6 bg-slate-50 space-y-4">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1">
                <Layers className="w-5 h-5 text-amber-600" />
                <span>Duplicate Report Detected Nearby!</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Our AI Triage system identified an active report already filed within{' '}
                <strong>{duplicateFound.distanceMeters} meters</strong> of your location with a{' '}
                <strong>{duplicateFound.similarityPercent}% similarity score</strong>.
              </p>
            </div>

            {/* Existing Master Ticket Preview */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-500">
                  {duplicateFound.masterTicket.ticketNumber}
                </span>
                <span className="bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">
                  Status: {duplicateFound.masterTicket.status}
                </span>
              </div>
              <div className="font-bold text-slate-900">
                {duplicateFound.masterTicket.title}
              </div>
              <div className="text-slate-500">
                📍 {duplicateFound.masterTicket.landmark} ({duplicateFound.masterTicket.ward})
              </div>
              <div className="text-[11px] text-slate-400">
                Already backed by {duplicateFound.masterTicket.upvotes} citizens · {duplicateFound.masterTicket.duplicateCount} merged reports
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleMergeConfirm}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Merge with Existing Ticket (Boosts Urgency Ranking)</span>
              </button>

              <button
                type="button"
                onClick={handleIgnoreAndCreateNew}
                className="w-full bg-white hover:bg-slate-100 text-slate-600 font-medium text-xs py-2 rounded-xl border border-slate-200 transition-colors"
              >
                No, this is a different fault — Create Separate Ticket
              </button>
            </div>
          </div>
        )}

        {/* Main Form */}
        {!isTriageProcessing && !duplicateFound && (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5">
            
            {/* Category Selector (5 Main Types) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                1. Select Fault Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/40'
                          : 'bg-slate-50 hover:bg-white border-slate-200'
                      }`}
                    >
                      <div className="text-lg mb-1">{cat.emoji}</div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{cat.shortLabel}</div>
                        <div className="text-[10px] text-slate-500">{cat.defaultAgency}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Issue Title / Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dangerous 2ft crater pothole causing bike skids"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide context, depth of pothole, duration of water leak, hazard details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>

            {/* Location & GPS Pin Drop */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>2. Location & GPS Geo-Tagging</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsMapPinMode(!isMapPinMode)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                    isMapPinMode
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Navigation className="w-3 h-3 text-amber-600" />
                  <span>{isMapPinMode ? 'Close Pin Map' : 'Click on Map to Drop Pin'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Bengaluru Ward / Neighborhood
                  </label>
                  <select
                    value={wardName}
                    onChange={(e) => handleWardChange(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {BENGALURU_WARDS.filter((w) => w.number !== 0).map((w) => (
                      <option key={w.name} value={w.name}>
                        {w.name} (Ward {w.number})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Exact Landmark / Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Near Sony World Signal, 80 Feet Road"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Coordinates display */}
              <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                <span>GPS: Lat {coordinates.lat}, Lng {coordinates.lng}</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Geo-Tagged
                </span>
              </div>

              {/* Interactive Pin Drop Mini Map */}
              {isMapPinMode && (
                <div className="mt-2 border border-slate-300 rounded-xl overflow-hidden">
                  <div className="p-2 bg-slate-900 text-white text-[11px] flex items-center justify-between">
                    <span>Click on map to position fault pin</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {coordinates.lat}, {coordinates.lng}
                    </span>
                  </div>
                  <BengaluruMap
                    tickets={existingTickets}
                    isPinDropMode={true}
                    pinLocation={coordinates}
                    onLocationSelect={(newCoords) => setCoordinates(newCoords)}
                    centerLocation={coordinates}
                    zoomLevel={13}
                    heightClass="h-56"
                    onSelectTicket={() => {}}
                  />
                </div>
              )}
            </div>

            {/* Proximity Risk Factors (Engine Trigger) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  3. Safety & Proximity Risk Hazards
                </span>
                <span className="text-[10px] text-slate-500">
                  Auto-calculates priority score
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {PROXIMITY_OPTIONS.map((opt) => {
                  const isChecked = proximityRisks.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleRisk(opt)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-rose-50 text-rose-800 border-rose-300 font-semibold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                        isChecked ? 'bg-rose-600 text-white' : 'border border-slate-300'
                      }`}>
                        {isChecked && '✓'}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Severity Rating Calculation */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Automated Severity Score:</span>
                    <span className={`font-extrabold px-2 py-0.5 rounded text-[11px] ${
                      liveSeverity.severity === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : liveSeverity.severity === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {liveSeverity.severity} Priority
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{liveSeverity.reason}</p>
                </div>
              </div>
            </div>

            {/* Photographic Proof */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  4. Photographic Evidence & Site Proof *
                </label>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Required for Municipal Dispatch
                </span>
              </div>

              {/* Hidden file input for opening native OS file manager */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                id="civic-file-upload-input"
              />

              {/* Primary File Manager Upload Area */}
              <div
                onClick={handleOpenFilePicker}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group ${
                  uploadedFileName
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  uploadedFileName
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700 group-hover:scale-105'
                }`}>
                  {uploadedFileName ? <FileCheck className="w-6 h-6" /> : <FolderOpen className="w-6 h-6" />}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenFilePicker();
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Upload Photo (Open File Manager)</span>
                  </button>

                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Click to browse your device files or drag and drop image here (PNG, JPG, JPEG)
                  </p>
                </div>

                {uploadedFileName && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-200 mt-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>File Selected from Device: <strong>{uploadedFileName}</strong></span>
                  </div>
                )}
              </div>

              {/* Photo Preview Card */}
              {photoUrl && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                    <img src={photoUrl} alt="Selected Proof" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="font-bold text-slate-800 block truncate">
                      {uploadedFileName ? uploadedFileName : 'Uploaded Photographic Evidence'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      Attached from local file manager
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenFilePicker}
                      className="text-amber-800 hover:text-amber-900 font-bold text-[11px] underline mt-0.5"
                    >
                      Change Photo File
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Citizen Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Reporter Name
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Mobile No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98451 22910"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Submission Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Run AI Triage & Dispatch Ticket</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
