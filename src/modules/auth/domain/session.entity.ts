export interface SessionEntity {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  jti: string;
  userAgent: string | null;
  ipAddress: string | null;
  isRevoked: boolean;
  expires: Date;
  createdAt: Date;
}
