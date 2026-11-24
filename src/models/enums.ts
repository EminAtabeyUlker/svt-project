// These enums match the ENUM types in the PostgreSQL database

export enum UserRole {
  Student = "STUDENT",
  Advisor = "ADVISOR",
  Admin = "ADMIN",
}

export enum TaskStatus {
  ToDo = "TO_DO",
  InProgress = "IN_PROGRESS",
  Submitted = "SUBMITTED",
  RevisionRequested = "REVISION_REQUESTED",
  Approved = "APPROVED",
}

export enum RequestStatus {
  Pending = "PENDING",
  Approved = "APPROVED",
  Rejected = "REJECTED",
  Cancelled = "CANCELLED",
}

export enum SlotStatus {
  Available = "AVAILABLE",
  Booked = "BOOKED",
}

export enum ReviewDecision {
  Approved = "APPROVED",
  RevisionRequested = "REVISION_REQUESTED",
}
