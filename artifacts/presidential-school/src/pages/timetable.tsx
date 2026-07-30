import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useCmsTimetable } from "@/hooks/useCms";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, User, DoorOpen } from "lucide-react";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
interface Lesson {
  period: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

type DaySchedule = Record<string, Lesson[]>;
type GradeSchedule = Record<string, DaySchedule>;

// ─────────────────────────────────────────────────────────────────
// Mock data  (7 grades × 6 days × 6–7 lessons)
// ─────────────────────────────────────────────────────────────────
const PERIODS = [
  { period: 1, time: "08:00 – 08:45" },
  { period: 2, time: "08:55 – 09:40" },
  { period: 3, time: "09:50 – 10:35" },
  { period: 4, time: "10:55 – 11:40" },
  { period: 5, time: "11:50 – 12:35" },
  { period: 6, time: "12:45 – 13:30" },
  { period: 7, time: "13:40 – 14:25" },
];

const DAYS_UZ = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_RU = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

const GRADES = ["5-sinf", "6-sinf", "7-sinf", "8-sinf", "9-sinf", "10-sinf", "11-sinf"];


// Subject → gradient mapping for coloured badges
const SUBJECT_COLORS: Record<string, string> = {
  "Matematika": "from-blue-500 to-blue-600",
  "Algebra": "from-blue-500 to-indigo-600",
  "Geometriya": "from-indigo-500 to-purple-600",
  "Oliy matematika": "from-blue-600 to-cyan-600",
  "Matematik analiz": "from-blue-600 to-indigo-700",
  "Algebra va analiz": "from-indigo-500 to-blue-600",
  "Matematika tahlili": "from-blue-500 to-violet-600",
  "Fizika": "from-violet-500 to-purple-600",
  "Nazariy fizika": "from-violet-600 to-fuchsia-600",
  "Fizika (chuqur)": "from-purple-500 to-violet-700",
  "Kvant fizikasi": "from-fuchsia-600 to-purple-700",
  "Kimyo": "from-emerald-500 to-teal-600",
  "Organik kimyo": "from-teal-500 to-emerald-600",
  "Kimyo (chuqur)": "from-emerald-600 to-green-700",
  "Analitik kimyo": "from-green-600 to-teal-700",
  "Biologiya": "from-green-500 to-emerald-600",
  "Genetika va biologiya": "from-lime-600 to-green-600",
  "Molekulyar biologiya": "from-green-600 to-lime-600",
  "Ingliz tili": "from-amber-500 to-orange-500",
  "Ingliz tili (IELTS)": "from-amber-500 to-yellow-600",
  "Ingliz tili (SAT/IELTS)": "from-orange-500 to-amber-600",
  "Rus tili": "from-rose-500 to-pink-600",
  "O'zbek tili": "from-red-500 to-rose-500",
  "O'zbek adabiyoti": "from-rose-600 to-red-600",
  "O'zbek tili va adabiyoti": "from-red-600 to-rose-700",
  "Tarix": "from-amber-600 to-yellow-700",
  "Informatika": "from-cyan-500 to-blue-500",
  "Dasturlash (Python)": "from-sky-500 to-cyan-600",
  "Sun'iy intellekt": "from-sky-600 to-blue-700",
  "Jismoniy tarbiya": "from-lime-500 to-green-500",
  "Musiqa": "from-pink-500 to-rose-500",
  "Chizmachilik": "from-slate-500 to-gray-600",
  "Falsafa va etika": "from-violet-400 to-purple-500",
};

function subjectGradient(subject: string): string {
  for (const key of Object.keys(SUBJECT_COLORS)) {
    if (subject.startsWith(key)) return SUBJECT_COLORS[key];
  }
  return "from-primary/80 to-primary";
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────
export default function Timetable() {
  const { t, language } = useLanguage();
  const { data: cmsItems = [], isLoading } = useCmsTimetable();

  const DAYS = language === "ru" ? DAYS_RU : language === "en" ? DAYS_EN : DAYS_UZ;

  const [grade, setGrade] = useState(GRADES[0]);
  const [day, setDay]     = useState(DAYS_UZ[0]); // always keyed by Uzbek day name internally

  const dayIndex = DAYS.indexOf(day);
  const uzDay    = DAYS_UZ[dayIndex] ?? DAYS_UZ[0];

  const lessons = Array.isArray(cmsItems) ? cmsItems.filter(i => i.grade === grade && i.day === uzDay).sort((a,b) => a.period - b.period) : [];

  // When language changes, reset day index but keep position
  const displayDay = DAYS[dayIndex] ?? DAYS[0];

  return (
    <div className="w-full">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-[#0f1b4d] via-[#1a2a7a] to-[#0d1a5c] py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px]" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-6"
          >
            <CalendarDays className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-serif text-accent mb-3"
          >
            {t("nav.timetable")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-slate-300 text-lg max-w-xl mx-auto"
          >
            {language === "ru"
              ? "Расписание уроков по классам и дням недели"
              : language === "en"
              ? "Weekly lesson schedule by grade and day"
              : "Sinflar va hafta kunlari bo'yicha dars jadvali"}
          </motion.p>
        </div>
      </section>

      {/* ── Main content ── */}
      <section className="py-12 bg-background min-h-[60vh]">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* ── Grade selector ── */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              {language === "ru" ? "Класс" : language === "en" ? "Grade" : "Sinf"}
            </p>
            <div className="flex flex-wrap gap-2">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                    grade === g
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                      : "bg-card border-border text-foreground/70 hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* ── Day selector ── */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              {language === "ru" ? "День" : language === "en" ? "Day" : "Kun"}
            </p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d, idx) => {
                const isActive = idx === dayIndex;
                return (
                  <button
                    key={d}
                    onClick={() => setDay(DAYS[idx])}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      isActive
                        ? "bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/25"
                        : "bg-card border-border text-foreground/70 hover:border-accent/40 hover:text-foreground"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Summary badge ── */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {grade} · {displayDay} · {lessons.length}{" "}
              {language === "ru" ? "уроков" : language === "en" ? "lessons" : "dars"}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* ── Lesson cards ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={grade + uzDay}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {isLoading ? (
                <div className="text-center py-20 text-muted-foreground">
                  <p className="font-medium text-lg">Yuklanmoqda...</p>
                </div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">
                    {language === "ru"
                      ? "В этот день уроков нет"
                      : language === "en"
                      ? "No lessons on this day"
                      : "Bu kunda dars yo'q"}
                  </p>
                </div>
              ) : (
                lessons.map((lesson, i) => (
                  <motion.div
                    key={lesson.period}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                    className="flex items-stretch gap-3 sm:gap-4 bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/25 transition-all duration-200 group"
                  >
                    {/* Period colour strip */}
                    <div
                      className={`w-1.5 shrink-0 bg-gradient-to-b ${subjectGradient(lesson.subject)}`}
                    />

                    {/* Period number */}
                    <div className="flex flex-col items-center justify-center w-10 sm:w-12 py-4 shrink-0">
                      <span className="text-xl sm:text-2xl font-bold font-serif text-foreground/80 leading-none">
                        {lesson.period}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        {language === "ru" ? "ур." : language === "en" ? "per." : "dars"}
                      </span>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 py-4 min-w-0">
                      {/* Subject */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full bg-gradient-to-br ${subjectGradient(lesson.subject)} shrink-0`}
                        />
                        <h3 className="font-bold text-base sm:text-lg leading-tight truncate text-foreground group-hover:text-primary transition-colors">
                          {lesson.subject}
                        </h3>
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          {lesson.teacher}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <DoorOpen className="h-3.5 w-3.5 shrink-0" />
                          {language === "ru" ? "Кab." : language === "en" ? "Room" : "Xona"}: {lesson.room}
                        </span>
                      </div>
                    </div>

                    {/* Time column */}
                    <div className="flex flex-col items-end justify-center pr-4 py-4 shrink-0">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground/70">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="whitespace-nowrap tabular-nums">{lesson.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Legend ── */}
          <div className="mt-10 p-5 bg-muted/40 rounded-2xl border border-border">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              {language === "ru" ? "Условные обозначения" : language === "en" ? "Legend" : "Belgilar izohi"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { label: language === "ru" ? "Точные науки" : language === "en" ? "Exact sciences" : "Aniq fanlar", gradient: "from-blue-500 to-indigo-600" },
                { label: language === "ru" ? "Физика" : language === "en" ? "Physics" : "Fizika", gradient: "from-violet-500 to-purple-600" },
                { label: language === "ru" ? "Химия/Биология" : language === "en" ? "Chemistry/Biology" : "Kimyo/Biologiya", gradient: "from-emerald-500 to-teal-600" },
                { label: language === "ru" ? "Языки" : language === "en" ? "Languages" : "Tillar", gradient: "from-amber-500 to-orange-500" },
                { label: "IT / " + (language === "ru" ? "Информатика" : language === "en" ? "CS" : "Informatika"), gradient: "from-cyan-500 to-blue-500" },
                { label: language === "ru" ? "Гуманитарные" : language === "en" ? "Humanities" : "Gumanitar", gradient: "from-amber-600 to-yellow-700" },
                { label: language === "ru" ? "Физкультура" : language === "en" ? "PE" : "Jismoniy tarbiya", gradient: "from-lime-500 to-green-500" },
                { label: language === "ru" ? "Прочее" : language === "en" ? "Other" : "Boshqa", gradient: "from-slate-500 to-gray-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm bg-gradient-to-br ${item.gradient} shrink-0`} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
