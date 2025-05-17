import { z } from "zod";

const LocationSchema = z.object({
  city: z.string(),
  region: z.string(),
  country: z.string(),
}).describe("Location");

const ProfileSchema = z.object({
  network: z.string(),
  username: z.string(),
  url: z.string(),
}).describe("Profile");
export const PersonalInfoSchema = z.object({
  name: z.string(),
  email: z.string().describe("Email address").optional(),
  phone: z.string().optional(),
  url: z.string().url().optional(),
  titles: z.array(z.string()).optional(),
  location: LocationSchema.partial().optional(),
  profiles: z.array(ProfileSchema).optional(),
});

const PositionSchema = z.object({
  position: z.string(),
  startDate: z.string(), // Could also be Date, but keeping it string for consistency
  endDate: z.string().or(z.literal("present")), // Could also be Date | "present"
  highlights: z.array(z.string()),
}).describe("Position");

const WorkExperienceSchema = z
  .object({
    organization: z.string(),
    url: z.string().url(),
    location: z.string(),
    positions: z.array(PositionSchema),
  })
  .describe("Work Experience")

const EducationSchema = z.object({
  institution: z.string(),
  url: z.string(),
  area: z.string(),
  studyType: z.string(),
  startDate: z.string(), // Could also be Date, but keeping it string for consistency
  endDate: z.string(), // Could also be Date, but keeping it string for consistency
  location: z.string(),
  honors: z.array(z.string()),
  courses: z.array(z.string()),
  highlights: z.array(z.string()),
}).describe("Education");

const AffiliationSchema = z.object({
  organization: z.string(),
  position: z.string(),
  location: z.string(),
  url: z.string().optional(), // Optional based on YAML example
  startDate: z.string(), // Could also be Date, but keeping it string for consistency
  endDate: z.string(), // Could also be Date, but keeping it string for consistency
  highlights: z.array(z.string()),
}).describe("Affiliation");

const AwardSchema = z.object({
  title: z.string(),
  date: z.string(), // Could also be Date, but keeping it string for consistency
  issuer: z.string(),
  url: z.string().optional(), // Optional based on YAML example
  location: z.string(),
  highlights: z.array(z.string()),
}).describe("Award");

const CertificateSchema = z.object({
  name: z.string(),
  date: z.string(), // Could also be Date, but keeping it string for consistency
  issuer: z.string(),
  url: z.string(),
  id: z.string(),
}).describe("Certificate");

const PublicationSchema = z.object({
  name: z.string(),
  publisher: z.string(),
  releaseDate: z.string(), // Could also be Date, but keeping it string for consistency
  url: z.string(),
}).describe("Publication");

const ProjectSchema = z.object({
  name: z.string(),
  url: z.string(),
  affiliation: z.string(),
  startDate: z.string(), // Could also be Date, but keeping it string for consistency
  endDate: z.string(), // Could also be Date, but keeping it string for consistency
  highlights: z.array(z.string()),
}).describe("Project");

const SkillCategorySchema = z.object({
  category: z.string(),
  skills: z.array(z.string()),
}).describe("Skill Category");

const LanguageSchema = z.object({
  language: z.string(),
  fluency: z.string(),
}).describe("Language");

const ReferenceSchema = z.object({
  name: z.string(),
  reference: z.string(),
  url: z.string(),
}).describe("Reference");

export const ResumeDataSchema = z.object({
  personal: PersonalInfoSchema,
  work: z.array(WorkExperienceSchema).optional(),
  education: z.array(EducationSchema).optional(),
  affiliations: z.array(AffiliationSchema).optional(),
  awards: z.array(AwardSchema).optional(),
  certificates: z.array(CertificateSchema).optional(),
  publications: z.array(PublicationSchema).optional(),
  projects: z.array(ProjectSchema).optional(),
  skills: z.array(SkillCategorySchema).optional(),
  languages: z.array(LanguageSchema).optional(),
  interests: z.array(z.string()).optional(),
  references: z.array(ReferenceSchema).optional(),
});

export type ResumeData = z.infer<typeof ResumeDataSchema>;
