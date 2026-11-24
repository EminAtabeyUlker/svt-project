// Row exactly as it comes from the project_group table
export interface ProjectGroupRow {
  group_id: number;
  group_name: string;
  project_title: string;
  project_description: string | null;
  advisor_id: number;
  created_at: Date;
}

// FR-01, FR-03, FR-04: a student group, its project and its single advisor (BR-03)
export class ProjectGroup {
  static readonly MAX_STUDENTS = 2; // BR-01

  constructor(
    public readonly groupId: number,
    public groupName: string,
    public projectTitle: string,
    public projectDescription: string | null,
    public advisorId: number,
    public readonly createdAt: Date,
  ) {}

  static fromRow(row: ProjectGroupRow): ProjectGroup {
    return new ProjectGroup(
      row.group_id,
      row.group_name,
      row.project_title,
      row.project_description,
      row.advisor_id,
      row.created_at,
    );
  }

  isFull(activeMemberCount: number): boolean {
    return activeMemberCount >= ProjectGroup.MAX_STUDENTS;
  }
}
