import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademicPracticeHeader } from "@/components/pte/practice-header";
import QuestionsTable from "@/components/pte/questions-table";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initialCategories } from "@/lib/pte/data";
import { Star } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SortableTableHeader } from "@/components/ui/sortable-table-header";
import { BookmarkButton } from "@/components/ui/bookmark-button";

function capitalize(s?: string | null) {
  if (!s) return "Medium";
  const t = String(s);
  return t.charAt(0).toUpperCase() + t.slice(1);
}

type Params = {
  params: Promise<{ section: string; questionType: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
};

const S_CODE_TO_SPEAKING: Record<string, string> = {
  // speaking codes -> API SpeakingType
  s_read_aloud: "read_aloud",
  s_repeat_sentence: "repeat_sentence",
  s_describe_image: "describe_image",
  s_retell_lecture: "retell_lecture",
  s_short_question: "answer_short_question",
  s_summarize_group_discussion: "summarize_group_discussion",
  s_respond_situation_academic: "respond_to_a_situation",
};

function toKebab(v: string) {
  return v.replace(/_/g, "-");
}

export default async function PracticeListPage({
  params,
  searchParams,
}: Params) {
  const { section: rawSection, questionType } = await params;
  const section = (rawSection ?? "").toLowerCase();

  const page = Number(searchParams?.page || 1);

  // Validate questionType exists in known categories
  const typeCat = initialCategories.find((cat) => cat.code === questionType);
  if (!typeCat) notFound();

  // Validate parent mapping to section
  const parentCat = initialCategories.find((cat) => cat.id === typeCat.parent);
  if (!parentCat || parentCat.code !== section) notFound();

  // Speaking branch: use /api/speaking/questions
  if (section === "speaking") {
    const speakingType = S_CODE_TO_SPEAKING[questionType];
    if (!speakingType) {
      notFound();
    }

    // Build absolute API URL for server-side fetch using request headers
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host =
      h.get("x-forwarded-host") ??
      h.get("host") ??
      `localhost:${process.env.PORT || 3000}`;
    const base = `${proto}://${host}`;

    const url = new URL(`/api/speaking/questions`, base);
    url.searchParams.set("type", speakingType);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", "10");
    const sortBy = searchParams?.sortBy || "createdAt";
    const sortOrder = searchParams?.sortOrder || "desc";
    url.searchParams.set("sortBy", sortBy);
    url.searchParams.set("sortOrder", sortOrder);

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      notFound();
    }
    const payload = (await res.json()) as {
      page: number;
      pageSize: number;
      total: number;
      items: Array<{
        id: string;
        title?: string | null;
        promptText?: string | null;
        difficulty?: "Easy" | "Medium" | "Hard" | null;
        createdAt?: string | null;
        bookmarked?: boolean;
      }>;
    };

    const rows = Array.isArray(payload?.items) ? payload.items : [];
    const totalPages = Math.ceil(payload.total / payload.pageSize);
    const kebabType = toKebab(speakingType);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <AcademicPracticeHeader section={section} showFilters={true} />

          <div className="mt-6 rounded-md border bg-white dark:border-gray-800 dark:bg-gray-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-32">
                    <SortableTableHeader
                      column="difficulty"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      section={section}
                      questionType={questionType}
                    >
                      Difficulty
                    </SortableTableHeader>
                  </TableHead>
                  <TableHead className="w-40">
                    <SortableTableHeader
                      column="createdAt"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      section={section}
                      questionType={questionType}
                    >
                      Created
                    </SortableTableHeader>
                  </TableHead>
                  <TableHead className="w-24">Bookmark</TableHead>
                  <TableHead className="w-40 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No questions available
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => {
                    const id = r.id;
                    const title = r.title || r.promptText || "Question";
                    const diff = r.difficulty || "Medium";
                    const created = r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : "—";
                    return (
                      <TableRow key={id}>
                        <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-400">
                          {id}
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link
                            href={`/pte/academic/practice/speaking/${kebabType}/question/${id}`}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              diff === "Hard"
                                ? "destructive"
                                : diff === "Easy"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {diff}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {created}
                        </TableCell>
                        <TableCell>
                          <BookmarkButton
                            questionId={id}
                            questionType={section}
                            bookmarked={r.bookmarked || false}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/pte/academic/practice/speaking/${kebabType}/question/${id}`}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            Practice
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/pte/academic/practice/${section}/${questionType}?page=${
                        page - 1
                      }`}
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href={`/pte/academic/practice/${section}/${questionType}?page=${p}`}
                        isActive={p === page}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href={`/pte/academic/practice/${section}/${questionType}?page=${
                        page + 1
                      }`}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    );
  }

  // Writing branch: use /api/writing/questions
  if (section === "writing") {
    // Map URL questionType to API expected type
    const writingTypeMap: Record<string, string> = {
      w_summarize_text: "summarize_written_text",
      w_essay: "write_essay",
    };
    const writingType = writingTypeMap[questionType];
    if (!writingType) {
      notFound();
    }

    // Build absolute API URL for server-side fetch using request headers
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host =
      h.get("x-forwarded-host") ??
      h.get("host") ??
      `localhost:${process.env.PORT || 3000}`;
    const base = `${proto}://${host}`;

    const url = new URL(`/api/writing/questions`, base);
    url.searchParams.set("type", writingType);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", "10");
    const sortBy = searchParams?.sortBy || "createdAt";
    const sortOrder = searchParams?.sortOrder || "desc";
    url.searchParams.set("sortBy", sortBy);
    url.searchParams.set("sortOrder", sortOrder);

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      notFound();
    }

    const payload = (await res.json()) as {
      page: number;
      pageSize: number;
      total: number;
      items: Array<{
        id: string;
        title?: string | null;
        promptText?: string | null;
        difficulty?: "Easy" | "Medium" | "Hard" | null;
        createdAt?: string | null;
        bookmarked?: boolean;
      }>;
    };

    const rows = Array.isArray(payload?.items) ? payload.items : [];
    const totalPages = Math.ceil(payload.total / payload.pageSize);

    const kebabType = toKebab(questionType);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <AcademicPracticeHeader section={section} showFilters={true} />

          <div className="mt-6 rounded-md border bg-white dark:border-gray-800 dark:bg-gray-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-32">
                    <SortableTableHeader
                      column="difficulty"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      section={section}
                      questionType={questionType}
                    >
                      Difficulty
                    </SortableTableHeader>
                  </TableHead>
                  <TableHead className="w-40">
                    <SortableTableHeader
                      column="createdAt"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      section={section}
                      questionType={questionType}
                    >
                      Created
                    </SortableTableHeader>
                  </TableHead>
                  <TableHead className="w-24">Bookmark</TableHead>
                  <TableHead className="w-40 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No questions available
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => {
                    const id = r.id;
                    const title = r.title || r.promptText || "Question";
                    const diff = r.difficulty || "Medium";
                    const created = r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : "—";
                    return (
                      <TableRow key={id}>
                        <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-400">
                          {id}
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link
                            href={`/pte/academic/practice/writing/summarize-written-text/question/${id}`}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              diff === "Hard"
                                ? "destructive"
                                : diff === "Easy"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {diff}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {created}
                        </TableCell>
                        <TableCell>
                          <BookmarkButton
                            questionId={id}
                            questionType={section}
                            bookmarked={r.bookmarked || false}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/pte/academic/practice/writing/summarize-written-text/question/${id}`}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            Practice
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/pte/academic/practice/${section}/${questionType}?page=${
                        page - 1
                      }&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href={`/pte/academic/practice/${section}/${questionType}?page=${p}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                        isActive={p === page}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href={`/pte/academic/practice/${section}/${questionType}?page=${
                        page + 1
                      }&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    );
  }

  // Reading branch: use /api/reading/questions
  if (section === "reading") {
    const readingTypeMap: Record<string, string> = {
      rw_fib: "reading_writing_fill_blanks",
      r_mcq_multiple: "multiple_choice_multiple",
      r_reorder_paragraphs: "reorder_paragraphs",
      r_fib: "fill_in_blanks",
      r_mcq_single: "multiple_choice_single",
    };
    const readingType = readingTypeMap[questionType];
    if (!readingType) {
      notFound();
    }

    // Build absolute API URL for server-side fetch using request headers
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host =
      h.get("x-forwarded-host") ??
      h.get("host") ??
      `localhost:${process.env.PORT || 3000}`;
    const base = `${proto}://${host}`;

    const url = new URL(`/api/reading/questions`, base);
    url.searchParams.set("type", readingType);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", "10");
    const sortBy = searchParams?.sortBy || "createdAt";
    const sortOrder = searchParams?.sortOrder || "desc";
    url.searchParams.set("sortBy", sortBy);
    url.searchParams.set("sortOrder", sortOrder);

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      notFound();
    }

    const payload = (await res.json()) as {
      page: number;
      pageSize: number;
      total: number;
      items: Array<{
        id: string;
        title?: string | null;
        promptText?: string | null;
        difficulty?: "Easy" | "Medium" | "Hard" | null;
        createdAt?: string | null;
        bookmarked?: boolean;
      }>;
    };

    const rows = Array.isArray(payload?.items) ? payload.items : [];
    const totalPages = Math.ceil(payload.total / payload.pageSize);

    const kebabType = toKebab(questionType);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <AcademicPracticeHeader section={section} showFilters={true} />

          <div className="mt-6 rounded-md border bg-white dark:border-gray-800 dark:bg-gray-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-32">
                    <SortableTableHeader
                      column="difficulty"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      section={section}
                      questionType={questionType}
                    >
                      Difficulty
                    </SortableTableHeader>
                  </TableHead>
                  <TableHead className="w-40">
                    <SortableTableHeader
                      column="createdAt"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      section={section}
                      questionType={questionType}
                    >
                      Created
                    </SortableTableHeader>
                  </TableHead>
                  <TableHead className="w-24">Bookmark</TableHead>
                  <TableHead className="w-40 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No questions available
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => {
                    const id = r.id;
                    const title = r.title || r.promptText || "Question";
                    const diff = r.difficulty || "Medium";
                    const created = r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : "—";
                    return (
                      <TableRow key={id}>
                        <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-400">
                          {id}
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link
                            href={`/pte/academic/practice/reading/${kebabType}/question/${id}`}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              diff === "Hard"
                                ? "destructive"
                                : diff === "Easy"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {diff}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {created}
                        </TableCell>
                        <TableCell>
                          <BookmarkButton
                            questionId={id}
                            questionType={section}
                            bookmarked={r.bookmarked || false}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/pte/academic/practice/reading/${kebabType}/question/${id}`}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            Practice
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/pte/academic/practice/${section}/${questionType}?page=${
                        page - 1
                      }&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href={`/pte/academic/practice/${section}/${questionType}?page=${p}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                        isActive={p === page}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href={`/pte/academic/practice/${section}/${questionType}?page=${
                        page + 1
                      }&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    );
  }

  // Listening branch: use /api/listening/questions
  if (section === "listening") {
    const listeningTypeMap: Record<string, string> = {
      l_summarize_text: "summarize_spoken_text",
      l_mcq_multiple: "multiple_choice_multiple",
      l_fib: "fill_in_blanks",
      l_highlight_correct_summary: "highlight_correct_summary",
      l_mcq_single: "multiple_choice_single",
      l_select_missing_word: "select_missing_word",
      l_highlight_incorrect_words: "highlight_incorrect_words",
      l_write_from_dictation: "write_from_dictation",
    };
    const listeningType = listeningTypeMap[questionType];
    if (!listeningType) {
      notFound();
    }

    // Build absolute API URL for server-side fetch using request headers
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host =
      h.get("x-forwarded-host") ??
      h.get("host") ??
      `localhost:${process.env.PORT || 3000}`;
    const base = `${proto}://${host}`;

    const url = new URL(`/api/listening/questions`, base);
    url.searchParams.set("type", listeningType);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", "10");
    const sortBy = searchParams?.sortBy || "createdAt";
    const sortOrder = searchParams?.sortOrder || "desc";
    url.searchParams.set("sortBy", sortBy);
    url.searchParams.set("sortOrder", sortOrder);

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      notFound();
    }

    const payload = (await res.json()) as {
      page: number;
      pageSize: number;
      total: number;
      items: Array<{
        id: string;
        title?: string | null;
        promptText?: string | null;
        difficulty?: "Easy" | "Medium" | "Hard" | null;
        createdAt?: string | null;
        bookmarked?: boolean;
      }>;
    };

    const rows = Array.isArray(payload?.items) ? payload.items : [];
    const totalPages = Math.ceil(payload.total / payload.pageSize);

    const kebabType = toKebab(questionType);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <AcademicPracticeHeader section={section} showFilters={true} />

          <div className="mt-6 rounded-md border bg-white dark:border-gray-800 dark:bg-gray-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-32">
                    <SortableTableHeader
                      column="difficulty"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      section={section}
                      questionType={questionType}
                    >
                      Difficulty
                    </SortableTableHeader>
                  </TableHead>
                  <TableHead className="w-40">
                    <SortableTableHeader
                      column="createdAt"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      section={section}
                      questionType={questionType}
                    >
                      Created
                    </SortableTableHeader>
                  </TableHead>
                  <TableHead className="w-24">Bookmark</TableHead>
                  <TableHead className="w-40 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No questions available
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => {
                    const id = r.id;
                    const title = r.title || r.promptText || "Question";
                    const diff = r.difficulty || "Medium";
                    const created = r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : "—";
                    return (
                      <TableRow key={id}>
                        <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-400">
                          {id}
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link
                            href={`/pte/academic/practice/listening/${kebabType}/question/${id}`}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              diff === "Hard"
                                ? "destructive"
                                : diff === "Easy"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {diff}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {created}
                        </TableCell>
                        <TableCell>
                          <BookmarkButton
                            questionId={id}
                            questionType={section}
                            bookmarked={r.bookmarked || false}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/pte/academic/practice/listening/${kebabType}/question/${id}`}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            Practice
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/pte/academic/practice/${section}/${questionType}?page=${
                        page - 1
                      }&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href={`/pte/academic/practice/${section}/${questionType}?page=${p}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                        isActive={p === page}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href={`/pte/academic/practice/${section}/${questionType}?page=${
                        page + 1
                      }&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    );
  }

  // Default (non-speaking) branch: keep existing behavior using /api/pte-practice/questions
  // Build absolute API URL for server-side fetch using request headers (Next 15/16 async APIs)
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host =
    h.get("x-forwarded-host") ??
    h.get("host") ??
    `localhost:${process.env.PORT || 3000}`;
  const base = `${proto}://${host}`;

  const url = new URL(
    `/api/pte-practice/questions?section=${encodeURIComponent(
      section
    )}&type=${encodeURIComponent(questionType)}&limit=50`,
    base
  );

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    // In case of API failure, surface 404 to keep UX simple for now
    notFound();
  }

  type ApiRow = {
    id: string;
    question?: string | null;
    questionType: string;
    section: string | null;
    difficulty?: string | null;
  };
  const payload = (await res.json()) as { data: ApiRow[] };
  const rows = Array.isArray(payload?.data) ? payload.data : [];

  const questions = rows.map((r) => ({
    id: r.id,
    title: r.question ?? "Question",
    category: capitalize(r.section),
    subcategory: r.questionType,
    difficulty: capitalize(r.difficulty ?? "medium"),
    status: "not-started" as const,
    attempts: 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section={section} showFilters={true} />

        <div className="mt-6">
          <QuestionsTable
            rows={questions}
            section={
              section as "speaking" | "writing" | "reading" | "listening"
            }
            questionType={questionType}
          />
        </div>
      </div>
    </div>
  );
}
