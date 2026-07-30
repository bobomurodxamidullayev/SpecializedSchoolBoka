import { useQuery } from "@tanstack/react-query";
import {
  fetchContent,
  type CmsSettings,
  type CmsContact,
  type CmsAdmin,
  type CmsTeacher,
  type CmsNews,
  type CmsGalleryItem,
  type CmsStudent,
  type CmsCertificate,
  type CmsAdmissionStage,
  type CmsAdmissionRequirement,
  type CmsAdmissionDate,
  type CmsEvent,
  type CmsFaq,
  type CmsAchievementInternational,
  type CmsAchievementNational,
  type CmsDirection,
  type CmsAbout,
  type CmsSubjectResult,
  type CmsEnglishCerts,
  type CmsTimetableItem,
} from "@/lib/cms";

export function useCmsSettings() {
  return useQuery({
    queryKey: ["cms", "settings"],
    queryFn: () => fetchContent<CmsSettings>("settings"),
    staleTime: 0,
  });
}

export function useCmsContact() {
  return useQuery({
    queryKey: ["cms", "contact"],
    queryFn: () => fetchContent<CmsContact>("contact"),
    staleTime: 0,
  });
}

export function useCmsAdministration() {
  return useQuery({
    queryKey: ["cms", "administration"],
    queryFn: () => fetchContent<CmsAdmin[]>("administration"),
    staleTime: 0,
  });
}

export function useCmsTeachers() {
  return useQuery({
    queryKey: ["cms", "teachers"],
    queryFn: () => fetchContent<CmsTeacher[]>("teachers"),
    staleTime: 0,
  });
}

export function useCmsNews(featured?: boolean) {
  const q = featured ? "news?featured=true" : "news";
  return useQuery({
    queryKey: ["cms", "news", featured ?? false],
    queryFn: () => fetchContent<CmsNews[]>(q),
    staleTime: 0,
  });
}

export function useCmsGallery() {
  return useQuery({
    queryKey: ["cms", "gallery"],
    queryFn: () => fetchContent<CmsGalleryItem[]>("gallery"),
    staleTime: 0,
  });
}

export function useCmsStudents() {
  return useQuery({
    queryKey: ["cms", "students"],
    queryFn: () => fetchContent<CmsStudent[]>("students"),
    staleTime: 0,
  });
}

export function useCmsCertificates() {
  return useQuery({
    queryKey: ["cms", "certificates"],
    queryFn: () => fetchContent<CmsCertificate[]>("certificates"),
    staleTime: 0,
  });
}

export function useCmsAdmissions() {
  return useQuery({
    queryKey: ["cms", "admissions"],
    queryFn: () => fetchContent<CmsAdmissionStage[]>("admissions"),
    staleTime: 0,
  });
}

export function useCmsAdmissionRequirements() {
  return useQuery({
    queryKey: ["cms", "admissions-requirements"],
    queryFn: () => fetchContent<CmsAdmissionRequirement[]>("admissions-requirements"),
    staleTime: 0,
  });
}

export function useCmsAdmissionDates() {
  return useQuery({
    queryKey: ["cms", "admissions-dates"],
    queryFn: () => fetchContent<CmsAdmissionDate[]>("admissions-dates"),
    staleTime: 0,
  });
}

export function useCmsEvents() {
  return useQuery({
    queryKey: ["cms", "events"],
    queryFn: () => fetchContent<CmsEvent[]>("events"),
    staleTime: 0,
  });
}

export function useCmsFaq() {
  return useQuery({
    queryKey: ["cms", "faq"],
    queryFn: () => fetchContent<CmsFaq[]>("faq"),
    staleTime: 0,
  });
}

export function useCmsAchievementsInternational() {
  return useQuery({
    queryKey: ["cms", "achievements-international"],
    queryFn: () => fetchContent<CmsAchievementInternational[]>("achievements-international"),
    staleTime: 0,
  });
}

export function useCmsAchievementsNational() {
  return useQuery({
    queryKey: ["cms", "achievements-national"],
    queryFn: () => fetchContent<CmsAchievementNational[]>("achievements-national"),
    staleTime: 0,
  });
}

export function useCmsDirections() {
  return useQuery({
    queryKey: ["cms", "directions"],
    queryFn: () => fetchContent<CmsDirection[]>("directions"),
    staleTime: 0,
  });
}

export function useCmsAbout() {
  return useQuery({
    queryKey: ["cms", "about"],
    queryFn: () => fetchContent<CmsAbout>("about"),
    staleTime: 0,
  });
}

export function useCmsSubjectResults() {
  return useQuery({
    queryKey: ["cms", "subject-results"],
    queryFn: () => fetchContent<CmsSubjectResult[]>("subject-results"),
    staleTime: 0,
  });
}

export function useCmsEnglishCerts() {
  return useQuery({
    queryKey: ["cms", "english-certs"],
    queryFn: () => fetchContent<CmsEnglishCerts>("english-certs"),
    staleTime: 0,
  });
}

export function useCmsTimetable() {
  return useQuery({
    queryKey: ["cms", "timetable"],
    queryFn: () => fetchContent<CmsTimetableItem[]>("timetable"),
    staleTime: 0,
  });
}

export function useCmsAdminTimetable() {
  return useQuery({
    queryKey: ["admin", "timetable"],
    queryFn: async () => {
      const res = await fetch("/api/admin/timetable");
      const json = await res.json();
      return (json.data || []) as CmsTimetableItem[];
    },
    staleTime: 0,
  });
}
