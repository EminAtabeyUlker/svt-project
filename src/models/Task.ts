import { TaskStatus } from "./enums";

// Row exactly as it comes from the task table
export interface TaskRow {
  task_id: number;
  group_id: number;
  title: string;
  description: string;
  due_date: Date;
  task_status: string;
  created_at: Date;
}

// FR-11 to FR-14: a task the advisor assigns to a group
export class Task {
  constructor(
    public readonly taskId: number,
    public groupId: number,
    public title: string,
    public description: string,
    public dueDate: Date,
    public status: TaskStatus,
    public readonly createdAt: Date,
  ) {}

  static fromRow(row: TaskRow): Task {
    return new Task(
      row.task_id,
      row.group_id,
      row.title,
      row.description,
      row.due_date,
      row.task_status as TaskStatus,
      row.created_at,
    );
  }

  // FR-14: past the due date and not approved yet
  isOverdue(now: Date = new Date()): boolean {
    return this.dueDate < now && this.status !== TaskStatus.Approved;
  }
}
