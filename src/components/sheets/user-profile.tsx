"use client";

import { useAtom } from "jotai";
import { userAtom } from "@/lib/atoms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, X } from "lucide-react";

type UserProfileSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UserProfileSheet({
  open,
  onOpenChange,
}: UserProfileSheetProps) {
  const [userProfile, setUserProfile] = useAtom(userAtom);

  const handleSave = () => {
    // In a real app, you might want to validate the data
    onOpenChange(false);
  };

  const addExperience = () => {
    setUserProfile((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: "New Position",
          company: "Company Name",
          period: "Start - End",
          description: "Describe your responsibilities and achievements",
        },
      ],
    }));
  };

  const removeExperience = (index: number) => {
    setUserProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    setUserProfile((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: "Degree Name",
          institution: "Institution Name",
          period: "Start - End",
        },
      ],
    }));
  };

  const removeEducation = (index: number) => {
    setUserProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const addSkill = () => {
    const newSkill = prompt("Enter a new skill:");
    if (newSkill) {
      setUserProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill],
      }));
    }
  };

  const removeSkill = (index: number) => {
    setUserProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[400px] sm:w-[540px] bg-dark-100 border-zinc-800"
      >
        <SheetHeader className="p-6">
          <SheetTitle className="text-4xl">Resume Data</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Fill in your details to create a personalized resume. You can chat
            with AI to update this data.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-320px)] px-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userProfile.name}
                  onChange={(e) =>
                    setUserProfile((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  onChange={(e) =>
                    setUserProfile((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={userProfile.phone}
                  onChange={(e) =>
                    setUserProfile((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={userProfile.location}
                  onChange={(e) =>
                    setUserProfile((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  rows={4}
                  value={userProfile.summary}
                  onChange={(e) =>
                    setUserProfile((prev) => ({
                      ...prev,
                      summary: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            {/* Experience */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Work Experience</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addExperience}
                  className="h-8"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              {userProfile.experience.map((exp, index) => (
                <div
                  key={index}
                  className="space-y-2 border rounded-md p-3 relative"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeExperience(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="grid gap-2">
                    <Label htmlFor={`exp-title-${index}`}>Job Title</Label>
                    <Input
                      id={`exp-title-${index}`}
                      value={exp.title}
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          experience: prev.experience.map((item, i) =>
                            i === index
                              ? { ...item, title: e.target.value }
                              : item
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`exp-company-${index}`}>Company</Label>
                    <Input
                      id={`exp-company-${index}`}
                      value={exp.company}
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          experience: prev.experience.map((item, i) =>
                            i === index
                              ? { ...item, company: e.target.value }
                              : item
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`exp-period-${index}`}>Period</Label>
                    <Input
                      id={`exp-period-${index}`}
                      value={exp.period}
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          experience: prev.experience.map((item, i) =>
                            i === index
                              ? { ...item, period: e.target.value }
                              : item
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`exp-desc-${index}`}>Description</Label>
                    <Textarea
                      id={`exp-desc-${index}`}
                      rows={3}
                      value={exp.description}
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          experience: prev.experience.map((item, i) =>
                            i === index
                              ? { ...item, description: e.target.value }
                              : item
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Education */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Education</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addEducation}
                  className="h-8"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              {userProfile.education.map((edu, index) => (
                <div
                  key={index}
                  className="space-y-2 border rounded-md p-3 relative"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeEducation(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="grid gap-2">
                    <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                    <Input
                      id={`edu-degree-${index}`}
                      value={edu.degree}
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          education: prev.education.map((item, i) =>
                            i === index
                              ? { ...item, degree: e.target.value }
                              : item
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`edu-institution-${index}`}>
                      Institution
                    </Label>
                    <Input
                      id={`edu-institution-${index}`}
                      value={edu.institution}
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          education: prev.education.map((item, i) =>
                            i === index
                              ? { ...item, institution: e.target.value }
                              : item
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`edu-period-${index}`}>Period</Label>
                    <Input
                      id={`edu-period-${index}`}
                      value={edu.period}
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          education: prev.education.map((item, i) =>
                            i === index
                              ? { ...item, period: e.target.value }
                              : item
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Skills */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Skills</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSkill}
                  className="h-8"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {userProfile.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex text-sm items-center gap-1 px-3 py-1 bg-muted text-background rounded-full"
                  >
                    <span>{skill}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full"
                      onClick={() => removeSkill(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
