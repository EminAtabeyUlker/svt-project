import { pool, testConnection } from "./config/database";
import {
  userRepository,
  groupRepository,
  membershipRepository,
  slotRepository,
  requestRepository,
  taskRepository,
  submissionRepository,
  feedbackRepository,
} from "./repositories";

async function main(): Promise<void> {
  // 1. Database connection
  const version = await testConnection();
  console.log("Connected to the database.");
  console.log(`  ${version.split(",")[0]}\n`);

  // 2. Load every table through its model
  const users = await userRepository.findAll();
  const groups = await groupRepository.findAll();
  const memberships = await membershipRepository.findAll();
  const slots = await slotRepository.findAll();
  const requests = await requestRepository.findAll();
  const tasks = await taskRepository.findAll();
  const submissions = await submissionRepository.findAll();
  const feedback = await feedbackRepository.findAll();

  console.log("Records loaded through the models:");
  const counts: [string, number][] = [
    ["UserAccount", users.length],
    ["ProjectGroup", groups.length],
    ["GroupMembership", memberships.length],
    ["MeetingSlot", slots.length],
    ["MeetingRequest", requests.length],
    ["Task", tasks.length],
    ["Submission", submissions.length],
    ["Feedback", feedback.length],
  ];
  for (const [model, count] of counts) {
    console.log(`  ${model.padEnd(16)} ${count}`);
  }

  // 3. Use the models together: groups with their advisor and active students
  console.log("\nGroups:");
  for (const group of groups) {
    const advisor = users.find((u) => u.userId === group.advisorId);
    const students = memberships
      .filter((m) => m.groupId === group.groupId && m.isActive())
      .map((m) => users.find((u) => u.userId === m.studentId)?.fullName ?? "?");
    const fullText = group.isFull(students.length) ? " (full)" : "";
    console.log(`  ${group.groupName} - ${group.projectTitle}`);
    console.log(`    advisor: ${advisor?.fullName ?? "?"} | students: ${students.join(", ")}${fullText}`);
  }

  // 4. A business rule from the requirements, calculated by the Task model (FR-14)
  console.log("\nOverdue tasks (FR-14):");
  const overdue = tasks.filter((t) => t.isOverdue());
  if (overdue.length === 0) {
    console.log("  none");
  }
  for (const task of overdue) {
    console.log(`  ${task.title} | due ${task.dueDate.toISOString().slice(0, 10)} | status ${task.status}`);
  }
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Could not run the application:", message);
    console.error("Check that PostgreSQL is running and that the values in the .env file are correct.");
    process.exitCode = 1;
  })
  .finally(() => pool.end());
