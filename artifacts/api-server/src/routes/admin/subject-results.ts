import { Router } from "express";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();
const FILE = "subject-results.json";

const DEFAULT_DATA = [
  { id: "mat", name: "Matematika", iconKey: "Calculator", iconBg: "bg-blue-100 dark:bg-blue-900/40", iconColor: "text-blue-600 dark:text-blue-400", grades: [{ grade: "A+", count: 4 }, { grade: "A", count: 4 }, { grade: "B+", count: 5 }, { grade: "B", count: 8 }, { grade: "C+", count: 14 }, { grade: "C", count: 2 }] },
  { id: "rus", name: "Rus tili", iconKey: "BookMarked", iconBg: "bg-red-100 dark:bg-red-900/40", iconColor: "text-red-600 dark:text-red-400", grades: [{ grade: "A+", count: 0 }, { grade: "A", count: 0 }, { grade: "B+", count: 0 }, { grade: "B", count: 0 }, { grade: "C+", count: 2 }, { grade: "C", count: 0 }] },
  { id: "ona", name: "Ona tili", iconKey: "BookOpen", iconBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400", grades: [{ grade: "A+", count: 0 }, { grade: "A", count: 9 }, { grade: "B+", count: 9 }, { grade: "B", count: 23 }, { grade: "C+", count: 23 }, { grade: "C", count: 12 }] },
  { id: "kim", name: "Kimyo", iconKey: "FlaskConical", iconBg: "bg-purple-100 dark:bg-purple-900/40", iconColor: "text-purple-600 dark:text-purple-400", grades: [{ grade: "A+", count: 3 }, { grade: "A", count: 7 }, { grade: "B+", count: 11 }, { grade: "B", count: 5 }, { grade: "C+", count: 9 }, { grade: "C", count: 1 }] },
  { id: "bio", name: "Biologiya", iconKey: "Dna", iconBg: "bg-teal-100 dark:bg-teal-900/40", iconColor: "text-teal-600 dark:text-teal-400", grades: [{ grade: "A+", count: 1 }, { grade: "A", count: 5 }, { grade: "B+", count: 8 }, { grade: "B", count: 12 }, { grade: "C+", count: 7 }, { grade: "C", count: 3 }] },
  { id: "fiz", name: "Fizika", iconKey: "Zap", iconBg: "bg-orange-100 dark:bg-orange-900/40", iconColor: "text-orange-600 dark:text-orange-400", grades: [{ grade: "A+", count: 6 }, { grade: "A", count: 10 }, { grade: "B+", count: 14 }, { grade: "B", count: 8 }, { grade: "C+", count: 5 }, { grade: "C", count: 2 }] },
];

router.get("/", requireAdmin, async (_req, res) => {
  const data = await readData(FILE, DEFAULT_DATA);
  res.json({ ok: true, data });
});

router.post("/", requireAdmin, async (req, res) => {
  const items = await readData<Record<string, unknown>[]>(FILE, DEFAULT_DATA as unknown as Record<string, unknown>[]);
  const item = { id: crypto.randomUUID(), grades: [{ grade: "A+", count: 0 }, { grade: "A", count: 0 }, { grade: "B+", count: 0 }, { grade: "B", count: 0 }, { grade: "C+", count: 0 }, { grade: "C", count: 0 }], ...req.body };
  items.push(item);
  await writeData(FILE, items);
  res.json({ ok: true, data: item });
});

router.put("/:id", requireAdmin, async (req, res) => {
  const items = await readData<Record<string, unknown>[]>(FILE, DEFAULT_DATA as unknown as Record<string, unknown>[]);
  const idx = items.findIndex((i) => i["id"] === req.params["id"]);
  if (idx === -1) { res.status(404).json({ ok: false, error: "Not found" }); return; }
  items[idx] = { ...items[idx], ...req.body, id: req.params["id"] };
  await writeData(FILE, items);
  res.json({ ok: true, data: items[idx] });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const items = await readData<Record<string, unknown>[]>(FILE, DEFAULT_DATA as unknown as Record<string, unknown>[]);
  await writeData(FILE, items.filter((i) => i["id"] !== req.params["id"]));
  res.json({ ok: true });
});

export default router;
