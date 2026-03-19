// ============================================
// CORE SYSTEM ENTITIES FOR KAIRO PLATFORM
// ============================================

/**
 * USER & IDENTITY MODULE
 */
export interface User {
  id: string;
  email?: string;
  username?: string;
  phoneNumber?: string; // Optional now - legacy field
  name: string;
  fullName?: string;
  city?: string;
  state?: string;
  role: UserRole;
  preferredLanguage: Language;
  isVerified: boolean;
  emailVerified?: boolean;
  verificationBadge?: VerificationBadge;
  trustScore?: number;
  authProvider?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 
  | 'student'
  | 'worker'
  | 'woman'
  | 'business'
  | 'senior_citizen'
  | 'other';

export type Language = 
  | 'en' 
  | 'hi' 
  | 'ta' 
  | 'te' 
  | 'bn' 
  | 'mr' 
  | 'gu' 
  | 'kn' 
  | 'ml' 
  | 'pa' 
  | 'or';

export interface VerificationBadge {
  type: 'aadhaar' | 'digilocker' | 'phone';
  verifiedAt: Date;
  expiresAt?: Date;
}

/**
 * PETITION MODULE (CORE ENTITY)
 */
export interface Petition {
  id: string;
  title: string;
  description: string;
  category: PetitionCategory;
  location: Location;
  creatorId: string;
  creator: User;
  signatures: Signature[];
  signatureCount: number;
  evidence: Evidence[];
  targetAuthorities: Authority[];
  status: PetitionStatus;
  updates: PetitionUpdate[];
  createdAt: Date;
  updatedAt: Date;
  sentToAuthority: boolean;
  sentAt?: Date;
  responseReceived: boolean;
  resolvedAt?: Date;
  language: Language;
}

export type PetitionCategory = 
  | 'infrastructure'
  | 'safety'
  | 'rights'
  | 'consumer'
  | 'environment'
  | 'labor'
  | 'education'
  | 'health'
  | 'corruption'
  | 'other';

export type PetitionStatus = 
  | 'draft'
  | 'active'
  | 'growing'
  | 'sent_to_authority'
  | 'response_received'
  | 'action_taken'
  | 'resolved'
  | 'closed';

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  address?: string;
  pincode?: string;
}

/**
 * SIGNATURE & VERIFICATION
 */
export interface Signature {
  id: string;
  petitionId: string;
  userId: string;
  user: User;
  signedAt: Date;
  isVerified: boolean;
  location?: Location;
  ip?: string;
}

/**
 * EVIDENCE SYSTEM
 */
export interface Evidence {
  id: string;
  type: EvidenceType;
  url: string;
  thumbnail?: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: Date;
  metadata?: Record<string, any>;
}

export type EvidenceType = 
  | 'image' 
  | 'video' 
  | 'document' 
  | 'audio';

/**
 * AUTHORITY SYSTEM
 */
export interface Authority {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone?: string;
  jurisdiction: {
    city?: string;
    state: string;
    area?: string;
  };
  categories: PetitionCategory[];
  responseRate?: number;
  averageResponseTime?: number;
}

/**
 * CIVIC ISSUE / COMMUNITY REPORT
 */
export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: PetitionCategory;
  location: Location;
  reportedBy: string;
  reporter: User;
  upvotes: number;
  upvotedBy: string[];
  verifications: Verification[];
  images: string[];
  status: IssueStatus;
  relatedPetitions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type IssueStatus = 
  | 'reported'
  | 'verified'
  | 'petition_created'
  | 'in_progress'
  | 'resolved';

export interface Verification {
  userId: string;
  verifiedAt: Date;
  comment?: string;
}

/**
 * PETITION UPDATES & TRACKING
 */
export interface PetitionUpdate {
  id: string;
  petitionId: string;
  type: UpdateType;
  content: string;
  createdBy: string;
  createdAt: Date;
  attachments?: string[];
}

export type UpdateType = 
  | 'progress'
  | 'authority_response'
  | 'action_taken'
  | 'milestone'
  | 'resolution';

/**
 * AI RIGHTS ASSISTANT
 */
export interface AIRightsQuery {
  id: string;
  userId: string;
  query: string;
  language: Language;
  category?: PetitionCategory;
  createdAt: Date;
}

export interface AIRightsResponse {
  queryId: string;
  yourRights: {
    summary: string;
    laws: string[];
    constitutionalArticles: string[];
  };
  actionSteps: string[];
  whereToComplain: {
    authority: string;
    contact: string;
    process: string;
  };
  relatedPetitions: Petition[];
  language: Language;
  generatedAt: Date;
}

/**
 * NOTIFICATION SYSTEM
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'petition_milestone'
  | 'authority_response'
  | 'signature_added'
  | 'issue_update'
  | 'resolution';

/**
 * ANALYTICS & IMPACT
 */
export interface ImpactMetrics {
  totalPetitions: number;
  activePetitions: number;
  totalSignatures: number;
  resolvedIssues: number;
  averageResolutionTime: number;
  topCategories: { category: PetitionCategory; count: number }[];
  byState: { state: string; count: number }[];
}
