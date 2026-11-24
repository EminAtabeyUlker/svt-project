import { RequestStatus } from "./enums";

// Row exactly as it comes from the meeting_request table
export interface MeetingRequestRow {
  request_id: number;
  slot_id: number;
  group_id: number;
  request_status: string;
  created_at: Date;
  decided_at: Date | null;
}

// FR-07 to FR-10: a group's request for one meeting slot
export class MeetingRequest {
  constructor(
    public readonly requestId: number,
    public slotId: number,
    public groupId: number,
    public status: RequestStatus,
    public readonly createdAt: Date,
    public decidedAt: Date | null,
  ) {}

  static fromRow(row: MeetingRequestRow): MeetingRequest {
    return new MeetingRequest(
      row.request_id,
      row.slot_id,
      row.group_id,
      row.request_status as RequestStatus,
      row.created_at,
      row.decided_at,
    );
  }

  isPending(): boolean {
    return this.status === RequestStatus.Pending;
  }
}
