// Row exactly as it comes from the group_membership table
export interface GroupMembershipRow {
  membership_id: number;
  group_id: number;
  student_id: number;
  joined_at: Date;
  left_at: Date | null;
}

// FR-02, BR-02: a student's membership in a group; history is kept when they leave
export class GroupMembership {
  constructor(
    public readonly membershipId: number,
    public groupId: number,
    public studentId: number,
    public readonly joinedAt: Date,
    public leftAt: Date | null,
  ) {}

  static fromRow(row: GroupMembershipRow): GroupMembership {
    return new GroupMembership(row.membership_id, row.group_id, row.student_id, row.joined_at, row.left_at);
  }

  isActive(): boolean {
    return this.leftAt === null;
  }
}
