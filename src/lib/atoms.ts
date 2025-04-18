import { atom } from "jotai"

// User profile atom
export type UserProfile = {
  name: string
  email: string
  phone: string
  location: string
  summary: string
  avatarUrl: string
  experience: {
    title: string
    company: string
    period: string
    description: string
  }[]
  education: {
    degree: string
    institution: string
    period: string
  }[]
  skills: string[]
}

export const userAtom = atom<UserProfile>({
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "(555) 123-4567",
  location: "San Francisco, CA",
  summary:
    "Experienced software engineer with a passion for building user-friendly applications. Skilled in JavaScript, React, and Node.js with a track record of delivering high-quality products on time.",
  avatarUrl: "//placecats.com/400/400",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Tech Solutions Inc.",
      period: "2020 - Present",
      description:
        "Led development of a customer-facing web application that increased user engagement by 40%. Mentored junior developers and implemented best practices for code quality.",
    },
    {
      title: "Software Developer",
      company: "Digital Innovations",
      period: "2017 - 2020",
      description:
        "Developed and maintained multiple web applications using React and Node.js. Collaborated with design team to implement responsive UI components.",
    },
  ],
  education: [
    {
      degree: "Master of Computer Science",
      institution: "University of Technology",
      period: "2015 - 2017",
    },
    {
      degree: "Bachelor of Science in Computer Engineering",
      institution: "State University",
      period: "2011 - 2015",
    },
  ],
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "HTML/CSS",
    "Git",
    "REST APIs",
    "SQL",
    "AWS",
    "Agile Methodologies",
  ],
})

// LLM configuration atom
export type LLMConfig = {
  provider: string
  model: string
  apiKey: string
  endpoint?: string
  temperature: number
  streaming: boolean
  includeResumeContext: boolean
}

export const llmConfigAtom = atom<LLMConfig>({
  provider: "OpenAI",
  model: "gpt-4o",
  apiKey: "",
  temperature: 0.7,
  streaming: true,
  includeResumeContext: true,
})
