export type CategoryType = 
  | 'pothole'
  | 'streetlight'
  | 'water_leak'
  | 'open_drain'
  | 'garbage';

export type SeverityType = 'High' | 'Medium' | 'Low';

export type StatusType = 'Reported' | 'Verified' | 'In Progress' | 'Resolved';

export type AgencyType = 'BBMP' | 'BWSSB' | 'BESCOM';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface TimelineEvent {
  id: string;
  status: StatusType;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  agency?: AgencyType;
  proofImageUrl?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  category: CategoryType;
  title: string;
  description: string;
  landmark: string;
  ward: string;
  wardNumber: number;
  zone: string;
  coordinates: LocationCoordinates;
  severity: SeverityType;
  severityReason: string;
  proximityRisks: string[];
  status: StatusType;
  assignedAgency: AgencyType;
  nodalOfficer: {
    name: string;
    designation: string;
    contact: string;
  };
  reporter: {
    name: string;
    isAnonymous: boolean;
    phoneMasked: string;
  };
  reportedAt: string;
  updatedAt: string;
  upvotes: number;
  hasUpvoted?: boolean;
  duplicateCount: number;
  groupedReportIds?: string[];
  photoUrl: string;
  resolvedPhotoUrl?: string;
  resolvedAt?: string;
  workOrderNumber?: string;
  resolutionDetails?: {
    contractor: string;
    materialsUsed: string;
    inspectedBy: string;
    completionNotes: string;
    costEstimateInr?: number;
  };
  timeline: TimelineEvent[];
}

export interface WardInfo {
  name: string;
  number: number;
  zone: string;
  lat: number;
  lng: number;
}

export interface CategoryMeta {
  id: CategoryType;
  label: string;
  shortLabel: string;
  icon: string;
  emoji: string;
  defaultAgency: AgencyType;
  description: string;
  colorClass: string;
  borderColorClass: string;
  bgColorClass: string;
}
