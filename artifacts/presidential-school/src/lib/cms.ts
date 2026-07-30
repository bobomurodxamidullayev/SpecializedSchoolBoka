import type { Language } from "@/data/translations";

export type LangField = { uz: string; en: string; ru: string };

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function formatReadTime(rt: string | number): string {
  const n = parseInt(String(rt), 10);
  if (isNaN(n)) return String(rt);
  return `${n} min`;
}

export function pickLang(field: LangField | string | undefined, lang: Language): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] || field.en || field.uz || field.ru || "";
}

export async function fetchContent<T>(path: string): Promise<T> {
  const res = await fetch(`/api/content/${path}`);
  const json = await res.json() as { ok: boolean; data?: T; error?: string };
  if (!res.ok || !json.ok || json.data === undefined) {
    throw new Error(json.error ?? "Failed to load content");
  }
  return json.data;
}

export interface CmsSettings {
  schoolName: LangField;
  slogan: LangField;
  description: LangField;
  heroTitle: LangField;
  heroStats: Array<{ value: string; label: LangField }>;
  phone: string;
  phone2: string;
  email: string;
  email2: string;
  address: LangField;
  workingHours: string;
  mapUrl: string;
  social: { telegram: string; instagram: string; youtube: string };
  seoTitle: LangField;
  seoDescription: LangField;
  copyright: string;
}

export interface CmsContact {
  phone: string;
  phone2: string;
  email: string;
  email2: string;
  address: LangField;
  workingHours: LangField;
  mapUrl: string;
  telegram: string;
  instagram: string;
}

export interface CmsAdmin {
  id: string;
  name: LangField;
  position: LangField;
  degree: LangField;
  bio: LangField;
  phone: string;
  email: string;
  receptionTime: LangField;
  photo: string;
}

export interface CmsTeacher {
  id: string;
  name: string;
  subject: string;
  grade: string;
  phone: string;
  university: string;
  graduationYear: number;
  experience: number;
  email: string;
  bio?: LangField;
  photo: string;
}

export interface CmsNews {
  id: string;
  title: LangField;
  slug: string;
  content: LangField;
  category: string;
  author: string;
  readTime: string;
  publishDate: string;
  coverImage: string;
  status: string;
  featured: boolean;
  videoUrl?: string;
  mediaType?: "image" | "video";
}

export interface CmsGalleryItem {
  id: string;
  title: LangField;
  description: LangField;
  category: string;
  date: string;
  images: string[];
  videoUrl?: string;
  mediaType?: "image" | "video";
}

export interface CmsStudent {
  id: string;
  name: LangField;
  achievement: LangField;
  olympiad: LangField;
  medalType: string;
  country: string;
  year: number;
  bio: LangField;
  photo: string;
}

export interface CmsCertificate {
  id: string;
  name: LangField;
  subject: string;
  level: string;
  quantity: number;
  year: number;
}

export interface CmsAdmissionStage {
  id: string;
  order: number;
  name: LangField;
  description: LangField;
  deadline: string;
  status: string;
}

export interface CmsAdmissionRequirement {
  id: string;
  order: number;
  text: LangField;
}

export interface CmsAdmissionDate {
  id: string;
  order: number;
  date: string;
  event: LangField;
}

export interface CmsEvent {
  id: string;
  order: number;
  title: LangField;
  date: string;
  time: string;
  location: LangField;
  description: LangField;
  category: string;
}

export interface CmsFaq {
  id: string;
  order: number;
  category: string;
  question: LangField;
  answer: LangField;
}

export interface CmsAchievementInternational {
  id: string;
  order: number;
  subject: string;
  competition: string;
  award: string;
  flag: string;
  country: string;
}

export interface CmsAchievementNational {
  id: string;
  order: number;
  subject: string;
  award: string;
  count: number;
  color: string;
}

export interface CmsDirection {
  id: string;
  order: number;
  name: LangField;
  desc: LangField;
  students: number;
  teachers: number;
  labs: number;
  subjects: LangField;
  careers: LangField;
}

export interface CmsPhilosophyItem {
  id: string;
  order: number;
  title: LangField;
  desc: LangField;
}

export interface CmsTimelineItem {
  id: string;
  order: number;
  year: string;
  title: LangField;
  desc: LangField;
}

export interface CmsAbout {
  mission: LangField;
  vision: LangField;
  philosophy: CmsPhilosophyItem[];
  timeline: CmsTimelineItem[];
}

export interface CmsSubjectGrade { grade: string; count: number }
export interface CmsSubjectResult {
  id: string;
  name: string;
  iconKey: string;
  iconBg: string;
  iconColor: string;
  grades: CmsSubjectGrade[];
}

export interface CmsEnglishLevel { level: string; count: number }
export interface CmsEnglishGrowth { year: string; count: number }
export interface CmsEnglishCerts {
  levels: CmsEnglishLevel[];
  growthData: CmsEnglishGrowth[];
}

export interface CmsTimetableItem {
  id: string;
  grade: string;
  day: string;
  period: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

export function getYouTubeEmbedUrl(url: string): { embedUrl: string; thumbnailUrl: string } | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
  }
  return null;
}
