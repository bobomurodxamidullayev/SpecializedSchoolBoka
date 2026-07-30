import { Router, type IRouter } from "express";
import { readData } from "../lib/dataManager.js";

const router: IRouter = Router();

router.get("/settings", async (_req, res) => {
  const data = await readData("settings.json", {});
  res.json({ ok: true, data });
});

router.get("/contact", async (_req, res) => {
  const data = await readData("contact.json", {});
  res.json({ ok: true, data });
});

router.get("/administration", async (_req, res) => {
  const data = await readData<unknown[]>("administration.json", []);
  res.json({ ok: true, data });
});

router.get("/teachers", async (_req, res) => {
  const data = await readData<unknown[]>("teachers.json", []);
  res.json({ ok: true, data });
});

router.get("/certificates", async (_req, res) => {
  const data = await readData<unknown[]>("certificates.json", []);
  res.json({ ok: true, data });
});

router.get("/news", async (req, res) => {
  const all = await readData<Array<Record<string, unknown>>>("news.json", []);
  let items = all.filter((n) => n["status"] === "published");
  if (req.query["featured"] === "true") {
    items = items.filter((n) => n["featured"] === true);
  }
  items.sort((a, b) => String(b["publishDate"] ?? "").localeCompare(String(a["publishDate"] ?? "")));
  res.json({ ok: true, data: items });
});

router.get("/news/:slug", async (req, res) => {
  const all = await readData<Array<Record<string, unknown>>>("news.json", []);
  const item = all.find((n) => n["slug"] === req.params["slug"] && n["status"] === "published");
  if (!item) {
    res.status(404).json({ ok: false, error: "Not found" });
    return;
  }
  res.json({ ok: true, data: item });
});

router.get("/gallery", async (_req, res) => {
  const data = await readData<unknown[]>("gallery.json", []);
  res.json({ ok: true, data });
});

router.get("/students", async (_req, res) => {
  const data = await readData<unknown[]>("students.json", []);
  res.json({ ok: true, data });
});

router.get("/admissions", async (_req, res) => {
  const data = await readData<Array<Record<string, unknown>>>("admissions.json", []);
  const sorted = [...data].sort(
    (a, b) => ((a["order"] as number) || 0) - ((b["order"] as number) || 0),
  );
  res.json({ ok: true, data: sorted });
});

router.get("/admissions-requirements", async (_req, res) => {
  const data = await readData<Array<Record<string, unknown>>>("admissions-requirements.json", []);
  const sorted = [...data].sort(
    (a, b) => ((a["order"] as number) || 0) - ((b["order"] as number) || 0),
  );
  res.json({ ok: true, data: sorted });
});

router.get("/admissions-dates", async (_req, res) => {
  const data = await readData<Array<Record<string, unknown>>>("admissions-dates.json", []);
  const sorted = [...data].sort((a, b) => ((a["order"] as number) || 0) - ((b["order"] as number) || 0));
  res.json({ ok: true, data: sorted });
});

router.get("/events", async (_req, res) => {
  const data = await readData<Array<Record<string, unknown>>>("events.json", []);
  const sorted = [...data].sort((a, b) => ((a["order"] as number) || 0) - ((b["order"] as number) || 0));
  res.json({ ok: true, data: sorted });
});

router.get("/faq", async (_req, res) => {
  const data = await readData<Array<Record<string, unknown>>>("faq.json", []);
  const sorted = [...data].sort((a, b) => ((a["order"] as number) || 0) - ((b["order"] as number) || 0));
  res.json({ ok: true, data: sorted });
});

router.get("/achievements-international", async (_req, res) => {
  const data = await readData<Array<Record<string, unknown>>>("achievements-international.json", []);
  const sorted = [...data].sort((a, b) => ((a["order"] as number) || 0) - ((b["order"] as number) || 0));
  res.json({ ok: true, data: sorted });
});

router.get("/achievements-national", async (_req, res) => {
  const data = await readData<Array<Record<string, unknown>>>("achievements-national.json", []);
  const sorted = [...data].sort((a, b) => ((a["order"] as number) || 0) - ((b["order"] as number) || 0));
  res.json({ ok: true, data: sorted });
});

router.get("/directions", async (_req, res) => {
  const data = await readData<Array<Record<string, unknown>>>("directions.json", []);
  const sorted = [...data].sort((a, b) => ((a["order"] as number) || 0) - ((b["order"] as number) || 0));
  res.json({ ok: true, data: sorted });
});

router.get("/about", async (_req, res) => {
  const data = await readData("about.json", {});
  res.json({ ok: true, data });
});

const DEFAULT_SUBJECT_RESULTS = [
  { id: "mat", name: "Matematika", iconKey: "Calculator", iconBg: "bg-blue-100 dark:bg-blue-900/40", iconColor: "text-blue-600 dark:text-blue-400", grades: [{ grade: "A+", count: 4 }, { grade: "A", count: 4 }, { grade: "B+", count: 5 }, { grade: "B", count: 8 }, { grade: "C+", count: 14 }, { grade: "C", count: 2 }] },
  { id: "rus", name: "Rus tili", iconKey: "BookMarked", iconBg: "bg-red-100 dark:bg-red-900/40", iconColor: "text-red-600 dark:text-red-400", grades: [{ grade: "A+", count: 0 }, { grade: "A", count: 0 }, { grade: "B+", count: 0 }, { grade: "B", count: 0 }, { grade: "C+", count: 2 }, { grade: "C", count: 0 }] },
  { id: "ona", name: "Ona tili", iconKey: "BookOpen", iconBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400", grades: [{ grade: "A+", count: 0 }, { grade: "A", count: 9 }, { grade: "B+", count: 9 }, { grade: "B", count: 23 }, { grade: "C+", count: 23 }, { grade: "C", count: 12 }] },
  { id: "kim", name: "Kimyo", iconKey: "FlaskConical", iconBg: "bg-purple-100 dark:bg-purple-900/40", iconColor: "text-purple-600 dark:text-purple-400", grades: [{ grade: "A+", count: 3 }, { grade: "A", count: 7 }, { grade: "B+", count: 11 }, { grade: "B", count: 5 }, { grade: "C+", count: 9 }, { grade: "C", count: 1 }] },
  { id: "bio", name: "Biologiya", iconKey: "Dna", iconBg: "bg-teal-100 dark:bg-teal-900/40", iconColor: "text-teal-600 dark:text-teal-400", grades: [{ grade: "A+", count: 1 }, { grade: "A", count: 5 }, { grade: "B+", count: 8 }, { grade: "B", count: 12 }, { grade: "C+", count: 7 }, { grade: "C", count: 3 }] },
];

const DEFAULT_ENGLISH_CERTS = {
  levels: [{ level: "B1", count: 216 }, { level: "B2", count: 63 }, { level: "C1", count: 0 }],
  growthData: [{ year: "2021", count: 3 }, { year: "2022", count: 60 }, { year: "2023", count: 131 }, { year: "2024", count: 192 }, { year: "2025", count: 252 }],
};

router.get("/subject-results", async (_req, res) => {
  const data = await readData("subject-results.json", DEFAULT_SUBJECT_RESULTS);
  res.json({ ok: true, data });
});

router.get("/english-certs", async (_req, res) => {
  const data = await readData("english-certs.json", DEFAULT_ENGLISH_CERTS);
  res.json({ ok: true, data });
});

router.get("/timetable", async (_req, res) => {
  const data = await readData<unknown[]>("timetable.json", []);
  res.json({ ok: true, data });
});

export default router;
