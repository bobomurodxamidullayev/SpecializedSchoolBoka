export const staff = [
  {
    id: 1,
    name: "Azizbek Rahimov",
    role: "Principal",
    roleKey: "principal",
    email: "director@qch-school.uz",
    phone: "+998 90 123 45 67",
    degree: "Pedagogika fanlari doktori (PhD)",
    university: "NUUz (2001)",
    schedule: "Dushanba–Juma, 09:00–18:00",
    avatar: "",
  },
  {
    id: 2,
    name: "Dilnoza Karimova",
    role: "Vice Principal (Academic)",
    roleKey: "vicePrincipal",
    email: "academic@qch-school.uz",
    phone: "+998 93 456 78 90",
    degree: "Filologiya fanlari nomzodi",
    university: "TDPU (2005)",
    schedule: "Dushanba–Shanba, 08:30–17:00",
    avatar: "",
  },
  {
    id: 3,
    name: "Rustam Aliyev",
    role: "Vice Principal (Spiritual)",
    roleKey: "vicePrincipalSpirit",
    email: "spirit@qch-school.uz",
    phone: "+998 90 345 67 89",
    degree: "Tarix fanlari magistri",
    university: "NUUz (2008)",
    schedule: "Dushanba–Shanba, 09:00–17:00",
    avatar: "",
  },
  {
    id: 4,
    name: "Nargiza Umarova",
    role: "School Psychologist",
    roleKey: "psychologist",
    email: "psychology@qch-school.uz",
    phone: "+998 97 678 90 12",
    degree: "Psixologiya magistri",
    university: "TDPU (2012)",
    schedule: "Seshanba–Juma, 10:00–16:00",
    avatar: "",
  },
];

export type TeacherGrade = "Oliy toifa" | "1-toifa" | "2-toifa" | "Yosh mutaxassis";

export interface Teacher {
  id: number;
  name: string;
  subject: string;
  grade: TeacherGrade;
  phone: string;
  university: string;
  graduationYear: number;
  experience: number;
}

export const teachers: Teacher[] = [
  /* ─── English Language ─── */
  { id: 1,  name: "Bo'riqulov Avazbek To'lqinjonovich",    subject: "English", grade: "1-toifa",          phone: "+998 93 132 94 02", university: "ADU",    graduationYear: 2020, experience: 4  },
  { id: 2,  name: "Urazbayeva Balnura Erjanovna",           subject: "English", grade: "Oliy toifa",       phone: "+998 99 872 68 61", university: "TDJTSU", graduationYear: 2016, experience: 8  },
  { id: 3,  name: "Davronova Umida Abdimurod qizi",         subject: "English", grade: "1-toifa",          phone: "+998 97 874 19 95", university: "TDTU",   graduationYear: 2020, experience: 4  },
  { id: 4,  name: "Nuriddinova Aydin Nurjanovna",           subject: "English", grade: "1-toifa",          phone: "+998 94 630 98 97", university: "TDJTSU", graduationYear: 2009, experience: 15 },
  { id: 5,  name: "Xabibullayeva Saodat Mirobid qizi",     subject: "English", grade: "Oliy toifa",       phone: "+998 99 405 63 75", university: "TDMI",   graduationYear: 2023, experience: 2  },

  /* ─── Mathematics ─── */
  { id: 6,  name: "Sherzod Abdullayev Baxtiyorovich",       subject: "Math",    grade: "Oliy toifa",       phone: "+998 90 312 45 67", university: "NUUz",   graduationYear: 2007, experience: 16 },
  { id: 7,  name: "Murodova Zilola Akbarovna",               subject: "Math",    grade: "1-toifa",          phone: "+998 93 217 88 34", university: "SamDU",  graduationYear: 2014, experience: 10 },
  { id: 8,  name: "Qodirov Jasur Bahodir o'g'li",           subject: "Math",    grade: "1-toifa",          phone: "+998 97 443 21 56", university: "TDTU",   graduationYear: 2018, experience: 6  },
  { id: 9,  name: "Toshmatov Bobur Hamidovich",              subject: "Math",    grade: "2-toifa",          phone: "+998 99 561 77 23", university: "BuxDU",  graduationYear: 2021, experience: 3  },

  /* ─── Physics ─── */
  { id: 10, name: "Malika Toshpulatova Ibrohimovna",        subject: "Physics", grade: "Oliy toifa",       phone: "+998 90 234 56 78", university: "ToshDTU", graduationYear: 2010, experience: 13 },
  { id: 11, name: "Xoliqov Sanjar Muxtoraliyevich",         subject: "Physics", grade: "1-toifa",          phone: "+998 93 345 12 89", university: "NUUz",   graduationYear: 2013, experience: 11 },
  { id: 12, name: "Yo'ldosheva Maftuna Sobirovna",           subject: "Physics", grade: "1-toifa",          phone: "+998 94 786 34 12", university: "SamDU",  graduationYear: 2017, experience: 7  },
  { id: 13, name: "Ergashev Akbar Nematovich",               subject: "Physics", grade: "2-toifa",          phone: "+998 99 128 94 57", university: "FarDU",  graduationYear: 2022, experience: 2  },

  /* ─── Chemistry ─── */
  { id: 14, name: "Jamshid Qodirov Hamidullayevich",        subject: "Chemistry", grade: "1-toifa",        phone: "+998 97 567 23 41", university: "ToshKTI",graduationYear: 2016, experience: 8  },
  { id: 15, name: "Nazarova Gulbahor Xurshidovna",           subject: "Chemistry", grade: "Oliy toifa",     phone: "+998 90 891 34 62", university: "NUUz",   graduationYear: 2008, experience: 16 },
  { id: 16, name: "Holmatov Nodir Rashidovich",              subject: "Chemistry", grade: "2-toifa",        phone: "+998 93 674 15 28", university: "SamDU",  graduationYear: 2021, experience: 3  },

  /* ─── Biology ─── */
  { id: 17, name: "Gulnora Sayidova Xasanovna",              subject: "Biology", grade: "Oliy toifa",       phone: "+998 90 456 78 90", university: "ToshDTU", graduationYear: 2011, experience: 13 },
  { id: 18, name: "Mirzayev Shuhrat Olimjonovich",           subject: "Biology", grade: "1-toifa",          phone: "+998 97 234 56 78", university: "TDPU",   graduationYear: 2015, experience: 9  },
  { id: 19, name: "Rahimova Dilorom Baxtiyorovna",           subject: "Biology", grade: "1-toifa",          phone: "+998 99 345 67 89", university: "NUUz",   graduationYear: 2019, experience: 5  },

  /* ─── Uzbek Language ─── */
  { id: 20, name: "Hasanova Feruza Toshpo'latovna",          subject: "Uzbek",   grade: "Oliy toifa",       phone: "+998 90 567 89 01", university: "NUUz",   graduationYear: 2005, experience: 19 },
  { id: 21, name: "Norqo'ziyev Ibrohim Sotvoldiyevich",     subject: "Uzbek",   grade: "1-toifa",          phone: "+998 93 678 90 12", university: "TDPU",   graduationYear: 2013, experience: 11 },
  { id: 22, name: "Tursunova Mohira Kamolovna",               subject: "Uzbek",   grade: "2-toifa",          phone: "+998 94 789 01 23", university: "SamDU",  graduationYear: 2020, experience: 4  },

  /* ─── Russian Language ─── */
  { id: 23, name: "Ziyoda Xamrayeva Baxtiyorovna",           subject: "Russian", grade: "Oliy toifa",       phone: "+998 90 678 90 12", university: "TDPU",   graduationYear: 2009, experience: 15 },
  { id: 24, name: "Alekseyeva Natalya Viktorovna",           subject: "Russian", grade: "1-toifa",          phone: "+998 97 890 12 34", university: "UzDJTU", graduationYear: 2014, experience: 10 },
  { id: 25, name: "Toshpo'latov Akmal Xurshidovich",        subject: "Russian", grade: "1-toifa",          phone: "+998 99 901 23 45", university: "TDPU",   graduationYear: 2018, experience: 6  },

  /* ─── IT / Computer Science ─── */
  { id: 26, name: "Otabek Murodov Shodmonovich",             subject: "IT",      grade: "Oliy toifa",       phone: "+998 90 789 01 23", university: "TUIT",   graduationYear: 2014, experience: 10 },
  { id: 27, name: "Umarov Behruz Dilshodovich",              subject: "IT",      grade: "1-toifa",          phone: "+998 93 890 12 34", university: "TDTU",   graduationYear: 2019, experience: 5  },
  { id: 28, name: "Xoliqova Nozima Asliddinovna",            subject: "IT",      grade: "Yosh mutaxassis",  phone: "+998 97 012 34 56", university: "TUIT",   graduationYear: 2023, experience: 1  },

  /* ─── History ─── */
  { id: 29, name: "Bekzod Tursunov Hamidovich",              subject: "History", grade: "Oliy toifa",       phone: "+998 90 890 12 34", university: "NUUz",   graduationYear: 2008, experience: 16 },
  { id: 30, name: "Yusupova Nozima Hamidovna",               subject: "History", grade: "1-toifa",          phone: "+998 93 901 23 45", university: "TDPU",   graduationYear: 2015, experience: 9  },

  /* ─── Sports / PE ─── */
  { id: 31, name: "Xoliqov Jasur Muxtoraliyevich",          subject: "Sports",  grade: "1-toifa",          phone: "+998 90 012 34 56", university: "TDPU",   graduationYear: 2016, experience: 8  },
  { id: 32, name: "Nazarova Umida Shavkatovna",               subject: "Sports",  grade: "2-toifa",          phone: "+998 97 123 45 67", university: "TDPU",   graduationYear: 2021, experience: 3  },
];

export const news = [
  { id: 1, title: "Our Students Won Gold at the International Math Olympiad", date: "2024-03-15", category: "Achievements", excerpt: "Three of our 11th-grade students brought home gold medals from the IMO held in London, setting a new record for Uzbekistan.", author: "Press Service", readTime: "5 min" },
  { id: 2, title: "New Robotics & AI Lab Officially Inaugurated", date: "2024-02-28", category: "Facilities", excerpt: "The school has officially opened its state-of-the-art robotics and artificial intelligence laboratory equipped with 40 workstations.", author: "Admin Office", readTime: "3 min" },
  { id: 3, title: "Spring Navruz Festival — A Celebration of Culture", date: "2024-03-21", category: "Events", excerpt: "Navruz celebration at our school was a huge success with traditional performances, food, and student-led cultural showcases.", author: "Student Council", readTime: "4 min" },
  { id: 4, title: "QCh Students Sweep Regional Physics Competition", date: "2024-04-02", category: "Achievements", excerpt: "Our physics team secured 1st, 2nd and 3rd place at the regional Toshkent viloyati Physics Olympiad — a historic first for the school.", author: "Science Dept.", readTime: "4 min" },
  { id: 5, title: "Partnership Agreement Signed with Cambridge University Press", date: "2024-04-10", category: "Academic", excerpt: "QCh School has entered an exclusive curriculum partnership with Cambridge University Press to enhance STEM and English programs.", author: "Administration", readTime: "3 min" },
  { id: 6, title: "Open House Day Draws Record 400+ Families", date: "2024-04-18", category: "Events", excerpt: "This year's Open House exceeded all expectations, with over 400 families touring our facilities and attending Q&A sessions with faculty.", author: "Press Service", readTime: "5 min" },
  { id: 7, title: "Library Expanded with 2,000 New STEM Volumes", date: "2024-04-25", category: "Facilities", excerpt: "Our library collection grew significantly with a donation of 2,000 curated STEM titles from the Ministry of Public Education.", author: "Library Staff", readTime: "2 min" },
  { id: 8, title: "Student Coding Club Wins National Hackathon", date: "2024-05-03", category: "Achievements", excerpt: "QCh's 15-student IT club claimed first place at the national school hackathon in Tashkent, building an AI-powered study assistant app.", author: "IT Department", readTime: "4 min" },
];

export const events = [
  { id: 1, title: "Open Day for Prospective Students", date: "2024-04-10", time: "10:00 AM", location: "Main Hall", description: "Parents and students are welcome to tour the school and meet our faculty." },
  { id: 2, title: "Science Fair 2024", date: "2024-04-25", time: "09:00 AM", location: "Science Wing", description: "Annual exhibition of student science and engineering projects, judged by external experts." },
  { id: 3, title: "National Math Olympiad Preparation Camp", date: "2024-05-05", time: "08:00 AM", location: "Lecture Hall A", description: "Intensive 3-day preparation camp led by our award-winning Mathematics faculty." },
  { id: 4, title: "Graduation Ceremony — Class of 2024", date: "2024-06-15", time: "11:00 AM", location: "Outdoor Amphitheatre", description: "Celebrate our graduating class with awards, performances, and a keynote address." },
];

export const faqs = [
  { id: 1, category: "Admissions", question: "How can I apply for admission?", answer: "Admissions open each May. Submit an online application followed by entrance exams in Math and English. Shortlisted candidates are invited for an interview." },
  { id: 2, category: "Academic", question: "What is the language of instruction?", answer: "The primary language of instruction is Uzbek, with extensive courses in English and Russian. STEM subjects are taught in English in upper grades." },
  { id: 3, category: "Facilities", question: "Does the school provide accommodation?", answer: "Yes, we have a fully equipped modern dormitory for students coming from other regions with supervised study halls and recreational areas." },
  { id: 4, category: "Admissions", question: "What grades does QCh School accept?", answer: "We accept students entering grades 5 through 11. The main intake is at grade 5, with limited spaces available at other grade levels." },
  { id: 5, category: "Academic", question: "Are international certifications available?", answer: "Yes — Cambridge IGCSE, IELTS preparation, and SAT readiness programs are embedded in our curriculum for grades 9–11." },
];

export const galleryCategories = ["All", "Events", "Lessons", "Competitions", "School Life"];

export const galleryImages = [
  { id: 1,  category: "Lessons",      label: "Advanced Physics Lab" },
  { id: 2,  category: "Events",       label: "Navruz Festival 2024" },
  { id: 3,  category: "Competitions", label: "Math Olympiad Finals" },
  { id: 4,  category: "School Life",  label: "Campus Morning" },
  { id: 5,  category: "Lessons",      label: "Robotics Workshop" },
  { id: 6,  category: "Events",       label: "Open House Day" },
  { id: 7,  category: "Competitions", label: "Regional Science Fair" },
  { id: 8,  category: "School Life",  label: "Library Reading Hour" },
  { id: 9,  category: "Lessons",      label: "Chemistry Experiment" },
  { id: 10, category: "Events",       label: "Graduation Ceremony" },
  { id: 11, category: "Competitions", label: "IT Hackathon 2024" },
  { id: 12, category: "School Life",  label: "Sports Day" },
];
