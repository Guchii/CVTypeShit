interface Location {
  city: string;
  region: string;
  country: string;
}

interface Profile {
  network: string;
  username: string;
  url: string;
}

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  url: string;
  titles: string[];
  location: Location;
  profiles: Profile[];
}

interface Position {
  position: string;
  startDate: string; // Could also be Date
  endDate: string | "present"; // Could also be Date | "present"
  highlights: string[];
}

interface WorkExperience {
  organization: string;
  url: string;
  location: string;
  positions: Position[];
}

interface Education {
  institution: string;
  url: string;
  area: string;
  studyType: string;
  startDate: string; // Could also be Date
  endDate: string; // Could also be Date
  location: string;
  honors: string[];
  courses: string[];
  highlights: string[];
}

interface Affiliation {
  organization: string;
  position: string;
  location: string;
  url?: string; // Optional based on YAML example
  startDate: string; // Could also be Date
  endDate: string; // Could also be Date
  highlights: string[];
}

interface Award {
  title: string;
  date: string; // Could also be Date
  issuer: string;
  url?: string; // Optional based on YAML example
  location: string;
  highlights: string[];
}

interface Certificate {
  name: string;
  date: string; // Could also be Date
  issuer: string;
  url: string;
  id: string;
}

interface Publication {
  name: string;
  publisher: string;
  releaseDate: string; // Could also be Date
  url: string;
}

interface Project {
  name: string;
  url: string;
  affiliation: string;
  startDate: string; // Could also be Date
  endDate: string; // Could also be Date
  highlights: string[];
}

interface SkillCategory {
  category: string;
  skills: string[];
}

interface Language {
  language: string;
  fluency: string;
}

interface Reference {
  name: string;
  reference: string;
  url: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  work: WorkExperience[];
  education: Education[];
  affiliations: Affiliation[];
  awards: Award[];
  certificates: Certificate[];
  publications: Publication[];
  projects: Project[];
  skills: SkillCategory[];
  languages: Language[];
  interests: string[];
  references?: Reference[]; // Marked as optional based on comment in YAML
}
