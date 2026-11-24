import { SlotStatus } from "./enums";

// Row exactly as it comes from the meeting_slot table
export interface MeetingSlotRow {
  slot_id: number;
  advisor_id: number;
  start_time: Date;
  end_time: Date;
  slot_status: string;
}

// FR-06: a time slot an advisor opens for meetings
export class MeetingSlot {
  constructor(
    public readonly slotId: number,
    public advisorId: number,
    public startTime: Date,
    public endTime: Date,
    public status: SlotStatus,
  ) {}

  static fromRow(row: MeetingSlotRow): MeetingSlot {
    return new MeetingSlot(row.slot_id, row.advisor_id, row.start_time, row.end_time, row.slot_status as SlotStatus);
  }

  durationMinutes(): number {
    return (this.endTime.getTime() - this.startTime.getTime()) / 60000;
  }

  // BR-05: only free slots in the future can be requested
  canBeRequested(now: Date = new Date()): boolean {
    return this.status === SlotStatus.Available && this.startTime > now;
  }
}
