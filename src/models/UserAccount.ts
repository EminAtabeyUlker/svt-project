import { UserRole } from "./enums";

// Row exactly as it comes from the user_account table
export interface UserAccountRow {
  user_id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: string;
  is_verified: boolean;
  created_at: Date;
}

// FR-20: every user has one role (student, advisor or admin)
export class UserAccount {
  constructor(
    public readonly userId: number,
    public fullName: string,
    public email: string,
    private passwordHash: string, // never shown to other parts of the app (NFR-01)
    public role: UserRole,
    public isVerified: boolean,
    public readonly createdAt: Date,
  ) {}

  static fromRow(row: UserAccountRow): UserAccount {
    return new UserAccount(
      row.user_id,
      row.full_name,
      row.email,
      row.password_hash,
      row.role as UserRole,
      row.is_verified,
      row.created_at,
    );
  }

  isStudent(): boolean {
    return this.role === UserRole.Student;
  }

  isAdvisor(): boolean {
    return this.role === UserRole.Advisor;
  }

  // An advisor can act only after an administrator verifies the account
  canActAsAdvisor(): boolean {
    return this.isAdvisor() && this.isVerified;
  }
}
