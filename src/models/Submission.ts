// Row exactly as it comes from the submission table
export interface SubmissionRow {
  submission_id: number;
  task_id: number;
  uploaded_by: number;
  version_no: number;
  file_name: string;
  file_type: string;
  file_size_kb: number;
  submitted_at: Date;
  is_late: boolean;
}

// FR-15, FR-18, FR-19: one uploaded version of a task's work
export class Submission {
  static readonly ALLOWED_TYPES = ["PDF", "DOCX", "ZIP"]; // Q-04
  static readonly MAX_SIZE_KB = 20480; // 20 MB, Q-04

  constructor(
    public readonly submissionId: number,
    public taskId: number,
    public uploadedBy: number,
    public versionNo: number,
    public fileName: string,
    public fileType: string,
    public fileSizeKb: number,
    public readonly submittedAt: Date,
    public isLate: boolean, // Q-03
  ) {}

  static fromRow(row: SubmissionRow): Submission {
    return new Submission(
      row.submission_id,
      row.task_id,
      row.uploaded_by,
      row.version_no,
      row.file_name,
      row.file_type,
      row.file_size_kb,
      row.submitted_at,
      row.is_late,
    );
  }

  // Same rule the database enforces with CHECK constraints
  static isValidFile(fileType: string, fileSizeKb: number): boolean {
    return Submission.ALLOWED_TYPES.includes(fileType.toUpperCase()) && fileSizeKb > 0 && fileSizeKb <= Submission.MAX_SIZE_KB;
  }
}
