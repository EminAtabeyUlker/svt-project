import { ReviewDecision } from "./enums";

// Row exactly as it comes from the feedback table
export interface FeedbackRow {
  feedback_id: number;
  submission_id: number;
  advisor_id: number;
  decision: string;
  comment: string | null;
  created_at: Date;
}

// FR-16, FR-17: the advisor's decision on a submission
export class Feedback {
  constructor(
    public readonly feedbackId: number,
    public submissionId: number,
    public advisorId: number,
    public decision: ReviewDecision,
    public comment: string | null,
    public readonly createdAt: Date,
  ) {}

  static fromRow(row: FeedbackRow): Feedback {
    return new Feedback(
      row.feedback_id,
      row.submission_id,
      row.advisor_id,
      row.decision as ReviewDecision,
      row.comment,
      row.created_at,
    );
  }

  // BR-07: a revision request must come with a comment
  isValid(): boolean {
    if (this.decision === ReviewDecision.RevisionRequested) {
      return this.comment !== null && this.comment.trim() !== "";
    }
    return true;
  }
}
