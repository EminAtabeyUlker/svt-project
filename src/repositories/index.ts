import { Repository } from "./Repository";
import {
  UserAccount, UserAccountRow,
  ProjectGroup, ProjectGroupRow,
  GroupMembership, GroupMembershipRow,
  MeetingSlot, MeetingSlotRow,
  MeetingRequest, MeetingRequestRow,
  Task, TaskRow,
  Submission, SubmissionRow,
  Feedback, FeedbackRow,
} from "../models";

// One repository per table, each connected to its model
export const userRepository = new Repository<UserAccountRow, UserAccount>("user_account", "user_id", UserAccount.fromRow);
export const groupRepository = new Repository<ProjectGroupRow, ProjectGroup>("project_group", "group_id", ProjectGroup.fromRow);
export const membershipRepository = new Repository<GroupMembershipRow, GroupMembership>("group_membership", "membership_id", GroupMembership.fromRow);
export const slotRepository = new Repository<MeetingSlotRow, MeetingSlot>("meeting_slot", "slot_id", MeetingSlot.fromRow);
export const requestRepository = new Repository<MeetingRequestRow, MeetingRequest>("meeting_request", "request_id", MeetingRequest.fromRow);
export const taskRepository = new Repository<TaskRow, Task>("task", "task_id", Task.fromRow);
export const submissionRepository = new Repository<SubmissionRow, Submission>("submission", "submission_id", Submission.fromRow);
export const feedbackRepository = new Repository<FeedbackRow, Feedback>("feedback", "feedback_id", Feedback.fromRow);
