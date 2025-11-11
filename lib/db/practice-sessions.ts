import { eq } from "drizzle-orm";
import { db } from "./drizzle";
import { practiceSessions, users, pteQuestions, pteTests } from "./schema";
import { getCurrentUser } from "@/lib/auth/server";

/**
 * Creates a practice session record in the database
 */
export async function createPracticeSession(
  userId: string,
  questionId: string,
  score?: number
) {
  try {
    const [practiceSession] = await db
      .insert(practiceSessions)
      .values({
        userId,
        questionId,
        score: score !== undefined ? score : null,
      })
      .returning();

    return practiceSession;
  } catch (error) {
    console.error("Error creating practice session:", error);
    throw error;
  }
}

/**
 * Gets all practice sessions for a user
 */
export async function getUserPracticeSessions(userId: string) {
  const sessions = await db
    .select()
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, userId))
    .orderBy(practiceSessions.submittedAt);

  return sessions;
}

/**
 * Gets practice sessions for a specific question
 */
export async function getQuestionPracticeSessions(questionId: string) {
  const sessions = await db
    .select()
    .from(practiceSessions)
    .where(eq(practiceSessions.questionId, questionId));

  return sessions;
}

/**
 * Creates practice sessions for all PTE test types
 */
export async function createAllPracticeSessions(userId?: string) {
  // If no userId is provided, try to get it from the current user
  if (!userId) {
    const authUser = await getCurrentUser();
    if (!authUser) {
      throw new Error("User must be authenticated to create practice sessions");
    }
    userId = authUser.id;
  }

  // Define all PTE test types as mentioned by the user
  const pteTestTypes = [
    // Speaking Section
    { type: "s_read_aloud", section: "Speaking", name: "Read Aloud" },
    { type: "s_repeat_sentence", section: "Speaking", name: "Repeat Sentence" },
    { type: "s_describe_image", section: "Speaking", name: "Describe Image" },
    { type: "s_retell_lecture", section: "Speaking", name: "Retell Lecture" },
    {
      type: "s_short_question",
      section: "Speaking",
      name: "Answer Short Question",
    },
    {
      type: "s_respond_to_situation",
      section: "Speaking",
      name: "Respond to a Situation",
    },
    {
      type: "s_summarize_group_discussion",
      section: "Speaking",
      name: "Summarize Group Discussion",
    },

    // Writing Section
    {
      type: "w_summarize_written_text",
      section: "Writing",
      name: "Summarize Written Text",
    },
    { type: "w_essay", section: "Writing", name: "Essay" },

    // Reading Section
    {
      type: "r_fib_dropdown",
      section: "Reading",
      name: "Fill in the Blanks (Dropdown)",
    },
    {
      type: "r_mcq_multiple",
      section: "Reading",
      name: "MC Multiple Answers (Reading)",
    },
    {
      type: "r_reorder_paragraphs",
      section: "Reading",
      name: "Re-order Paragraphs",
    },
    {
      type: "r_fib_drag_drop",
      section: "Reading",
      name: "Fill in the Blanks (Drag & Drop)",
    },
    {
      type: "r_mcq_single",
      section: "Reading",
      name: "MC Single Answers (Reading)",
    },

    // Listening Section
    {
      type: "l_summarize_spoken_text",
      section: "Listening",
      name: "Summarize Spoken Text",
    },
    {
      type: "l_mcq_multiple",
      section: "Listening",
      name: "MC Multiple Answers (Listening)",
    },
    {
      type: "l_fib",
      section: "Listening",
      name: "Fill in the Blanks (Listening)",
    },
    {
      type: "l_highlight_correct_summary",
      section: "Listening",
      name: "Highlight Correct Summary",
    },
    {
      type: "l_mcq_single",
      section: "Listening",
      name: "MC Single Answer Listening",
    },
    {
      type: "l_select_missing_word",
      section: "Listening",
      name: "Select Missing Word",
    },
    {
      type: "l_highlight_incorrect_words",
      section: "Listening",
      name: "Highlight Incorrect Words",
    },
    {
      type: "l_write_from_dictation",
      section: "Listening",
      name: "Write from Dictation",
    },
  ];

  // Create sample practice session for each test type
  // Note: This will create a session for each type, but we need actual question IDs
  // For now, we'll create with questionId = 0 until we have real questions
  const results = [];
  for (const testType of pteTestTypes) {
    try {
      const practiceSession = await createPracticeSession(
        userId,
        "00000000-0000-0000-0000-000000000000" // Placeholder question ID - should be replaced with actual question ID
        // For now, we're not providing a score since this is creating practice session templates
      );
      results.push({ ...testType, practiceSession });
    } catch (error) {
      console.error(
        `Error creating practice session for ${testType.type}:`,
        error
      );
      // Continue with other test types even if one fails
    }
  }

  return results;
}

/**
 * Creates practice sessions for specific PTE test types
 */
export async function createPracticeSessionsForTypes(
  testTypes: string[],
  userId?: string
) {
  // If no userId is provided, try to get it from the current user
  if (!userId) {
    const authUser = await getCurrentUser();
    if (!authUser) {
      throw new Error("User must be authenticated to create practice sessions");
    }
    userId = authUser.id;
  }

  const results = [];
  for (const testType of testTypes) {
    try {
      const practiceSession = await createPracticeSession(
        userId,
        "00000000-0000-0000-0000-000000000000" // Placeholder question ID
      );
      results.push({ type: testType, practiceSession });
    } catch (error) {
      console.error(`Error creating practice session for ${testType}:`, error);
    }
  }

  return results;
}