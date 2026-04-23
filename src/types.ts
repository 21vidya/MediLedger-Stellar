export type UserRole = 'PATIENT' | 'DOCTOR' | 'HOSPITAL';

export interface User {
  address: string;
  role: UserRole;
  name: string;
}

export interface MedicalRecord {
  id: string;
  patientAddress: string;
  hospitalAddress: string;
  title: string;
  category: 'LAB_REPORT' | 'SCAN' | 'PRESCRIPTION' | 'GENERAL';
  ipfsHash: string; // CID
  encryptedKey: string; // AES key encrypted with patient's public key (RSA simulation or just stored)
  timestamp: string;
}

export interface AccessPermission {
  id: string;
  patientAddress: string;
  doctorAddress: string;
  category: 'LAB_REPORT' | 'SCAN' | 'PRESCRIPTION' | 'GENERAL' | 'ALL';
  expiryTimestamp: string;
  grantedAt: string;
}

export interface AuditLog {
  id: string;
  recordId?: string;
  action: 'UPLOAD' | 'VIEW' | 'GRANT_ACCESS' | 'REVOKE_ACCESS';
  actorAddress: string;
  targetAddress?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  recipientAddress: string;
  title: string;
  message: string;
  type: 'RECORD' | 'ACCESS' | 'SYSTEM';
  read: boolean;
  timestamp: string;
}
