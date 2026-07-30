const fs = require('fs');

const file = 'c:/dev/SpecializedSchoolv3/SpecialSchoolsV3/artifacts/presidential-school/src/pages/timetable.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!content.includes('useCmsTimetable')) {
  content = content.replace(
    'import { useLanguage } from "@/contexts/LanguageContext";',
    'import { useLanguage } from "@/contexts/LanguageContext";\nimport { useCmsTimetable } from "@/hooks/useCms";'
  );
}

// 2. Find function makeLesson and the end of SCHEDULE
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('function makeLesson('));
const end = lines.findIndex((l, i) => i > start && l === '};');

if (start !== -1 && end !== -1) {
  // We remove the static schedule block
  lines.splice(start, end - start + 1);
  content = lines.join('\n');
}

// 3. Update the component logic
// We'll replace the first few lines of the component:
const oldLogic = `  const { t, language } = useLanguage();

  const DAYS = language === "ru" ? DAYS_RU : language === "en" ? DAYS_EN : DAYS_UZ;

  const [grade, setGrade] = useState(GRADES[0]);
  const [day, setDay]     = useState(DAYS_UZ[0]); // always keyed by Uzbek day name internally

  const dayIndex = DAYS.indexOf(day);
  const uzDay    = DAYS_UZ[dayIndex] ?? DAYS_UZ[0];
  const lessons: Lesson[] = SCHEDULE[grade]?.[uzDay] ?? [];`;

const newLogic = `  const { t, language } = useLanguage();
  const { data: cmsItems = [], isLoading } = useCmsTimetable();

  const DAYS = language === "ru" ? DAYS_RU : language === "en" ? DAYS_EN : DAYS_UZ;

  const [grade, setGrade] = useState(GRADES[0]);
  const [day, setDay]     = useState(DAYS_UZ[0]); // always keyed by Uzbek day name internally

  const dayIndex = DAYS.indexOf(day);
  const uzDay    = DAYS_UZ[dayIndex] ?? DAYS_UZ[0];

  const lessons = Array.isArray(cmsItems) ? cmsItems.filter(i => i.grade === grade && i.day === uzDay).sort((a,b) => a.period - b.period) : [];`;

if (content.includes('const lessons: Lesson[] = SCHEDULE[grade]?.[uzDay] ?? [];')) {
  content = content.replace(oldLogic, newLogic);
}

// Also replace the empty state from checking 'lessons.length === 0' to checking both isLoading and lessons
content = content.replace(
  '            <div className="flex-1">',
  '            <div className="flex-1">\n              {isLoading && <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>}\n              {!isLoading && ('
);
content = content.replace(
  '              {lessons.length === 0 ? (',
  '              {lessons.length === 0 ? ('
);
// We need to close the `{!isLoading && (` block. We can just add it before the `</div>` that closes `<div className="flex-1">`.
// Actually, it's easier to just use `isLoading` inside the condition:
// `{isLoading ? ( <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div> ) : lessons.length === 0 ? (`

fs.writeFileSync(file, content);
console.log('OK');
