"use client";

import React, { useState } from "react"; // Import useState
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
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Import Dialog components
import { MinusCircleIcon, PlusCircle } from "lucide-react";

type UserProfileSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UserProfileSheet({
  open,
  onOpenChange,
}: UserProfileSheetProps) {
  const [userProfile, setUserProfile] = useAtom(userAtom);

  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddSkillDialogOpen, setIsAddSkillDialogOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [targetCategoryIndex, setTargetCategoryIndex] = useState<number | null>(
    null
  );

  const addWorkExperience = () => {
    setUserProfile((prev) => ({
      ...prev,
      work: [
        ...prev.work,
        {
          organization: "New Company",
          url: "",
          location: "City, Country",
          positions: [
            {
              position: "New Role",
              startDate: "YYYY-MM-DD",
              endDate: "present",
              highlights: ["Responsibility 1", "Achievement 1"],
            },
          ],
        },
      ],
    }));
  };

  const removeWorkExperience = (index: number) => {
    setUserProfile((prev) => ({
      ...prev,
      work: prev.work.filter((_, i) => i !== index),
    }));
  };

  const updateWorkExperience = (
    index: number,
    field: keyof (typeof userProfile.work)[0],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any // Using any here as position updates are complex and marked TODO
  ) => {
    setUserProfile((prev) => ({
      ...prev,
      work: prev.work.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // TODO: Add handlers for adding/removing/updating positions within work experience

  // --- Education Handlers ---
  const addEducation = () => {
    setUserProfile((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: "New University",
          url: "",
          area: "Field of Study",
          studyType: "Degree Type",
          startDate: "YYYY-MM-DD",
          endDate: "YYYY-MM-DD",
          location: "City, Country",
          honors: [],
          courses: [],
          highlights: [],
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

  const updateEducation = (
    index: number,
    field: keyof (typeof userProfile.education)[0],
    value: string | string[] // More specific type for handled fields
  ) => {
    setUserProfile((prev) => ({
      ...prev,
      education: prev.education.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // --- Skills Handlers ---
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setUserProfile((prev) => ({
        ...prev,
        skills: [
          ...prev.skills,
          { category: newCategoryName.trim(), skills: [] },
        ],
      }));
      setNewCategoryName(""); // Reset input
      setIsAddCategoryDialogOpen(false); // Close dialog
    }
  };

  const openAddCategoryDialog = () => {
    setNewCategoryName(""); // Clear previous input
    setIsAddCategoryDialogOpen(true);
  };

  const removeSkillCategory = (index: number) => {
    setUserProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleAddSkill = () => {
    if (newSkillName.trim() && targetCategoryIndex !== null) {
      setUserProfile((prev) => ({
        ...prev,
        skills: prev.skills.map((cat, i) =>
          i === targetCategoryIndex
            ? { ...cat, skills: [...cat.skills, newSkillName.trim()] }
            : cat
        ),
      }));
      setNewSkillName(""); // Reset input
      setTargetCategoryIndex(null); // Reset target index
      setIsAddSkillDialogOpen(false); // Close dialog
    }
  };

  const openAddSkillDialog = (categoryIndex: number) => {
    setTargetCategoryIndex(categoryIndex);
    setNewSkillName(""); // Clear previous input
    setIsAddSkillDialogOpen(true);
  };

  const removeSkillFromCategory = (
    categoryIndex: number,
    skillIndex: number
  ) => {
    setUserProfile((prev) => ({
      ...prev,
      skills: prev.skills.map((cat, i) =>
        i === categoryIndex
          ? { ...cat, skills: cat.skills.filter((_, si) => si !== skillIndex) }
          : cat
      ),
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="max-w-[540px] bg-dark-100 border-zinc-800 sm:max-w-[640px] md:max-w-[720px]" // Increased width
      >
        <SheetHeader className="p-6">
          <SheetTitle className="text-4xl">Resume Data</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Fill in your details to create a personalized resume. You can chat
            with AI to update this data.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-160px)] px-6">
          <div className="space-y-8 pb-8">
            {" "}
            {/* Increased spacing */}
            {/* Personal Info */}
            <div className="space-y-4 border rounded-md p-4">
              <h3 className="text-lg font-semibold mb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userProfile.personal.name}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        personal: { ...prev.personal, name: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile.personal.email}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        personal: { ...prev.personal, email: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={userProfile.personal.phone}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        personal: { ...prev.personal, phone: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="url">Website/Portfolio URL</Label>
                  <Input
                    id="url"
                    value={userProfile.personal.url}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        personal: { ...prev.personal, url: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              {/* Location Sub-section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="grid gap-2">
                  <Label htmlFor="location-city">City</Label>
                  <Input
                    id="location-city"
                    value={userProfile.personal.location.city}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        personal: {
                          ...prev.personal,
                          location: {
                            ...prev.personal.location,
                            city: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location-region">Region/State</Label>
                  <Input
                    id="location-region"
                    value={userProfile.personal.location.region}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        personal: {
                          ...prev.personal,
                          location: {
                            ...prev.personal.location,
                            region: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location-country">Country</Label>
                  <Input
                    id="location-country"
                    value={userProfile.personal.location.country}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        personal: {
                          ...prev.personal,
                          location: {
                            ...prev.personal.location,
                            country: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </div>
              </div>
              {/* Titles - Simple comma separated for now */}
              <div className="grid gap-2">
                <Label htmlFor="titles">Titles (comma-separated)</Label>
                <Input
                  id="titles"
                  value={userProfile.personal.titles.join(", ")}
                  onChange={(e) =>
                    setUserProfile((prev) => ({
                      ...prev,
                      personal: {
                        ...prev.personal,
                        titles: e.target.value.split(",").map((t) => t.trim()),
                      },
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Profiles</Label>
                {userProfile.personal.profiles.map((profile, pIdx) => (
                  <div key={pIdx} className="flex gap-2 items-center">
                    <Input
                      value={profile.network}
                      placeholder="Network (e.g. LinkedIn)"
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          personal: {
                            ...prev.personal,
                            profiles: prev.personal.profiles.map((p, i) =>
                              i === pIdx ? { ...p, network: e.target.value } : p
                            ),
                          },
                        }))
                      }
                    />
                    <Input
                      value={profile.username}
                      placeholder="Username"
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          personal: {
                            ...prev.personal,
                            profiles: prev.personal.profiles.map((p, i) =>
                              i === pIdx
                                ? { ...p, username: e.target.value }
                                : p
                            ),
                          },
                        }))
                      }
                    />
                    <Input
                      value={profile.url}
                      placeholder="URL"
                      onChange={(e) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          personal: {
                            ...prev.personal,
                            profiles: prev.personal.profiles.map((p, i) =>
                              i === pIdx ? { ...p, url: e.target.value } : p
                            ),
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Work Experience */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Work Experience</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addWorkExperience}
                  className="h-8"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
              {userProfile.work.map((exp, index) => (
                <div
                  key={index}
                  className="space-y-3 border rounded-md p-4 relative" // Increased padding
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeWorkExperience(index)}
                  >
                    <MinusCircleIcon className="h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`work-org-${index}`}>Organization</Label>
                      <Input
                        id={`work-org-${index}`}
                        value={exp.organization}
                        onChange={(e) =>
                          updateWorkExperience(
                            index,
                            "organization",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`work-location-${index}`}>Location</Label>
                      <Input
                        id={`work-location-${index}`}
                        value={exp.location}
                        onChange={(e) =>
                          updateWorkExperience(
                            index,
                            "location",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`work-url-${index}`}>Company URL</Label>
                    <Input
                      id={`work-url-${index}`}
                      value={exp.url}
                      onChange={(e) =>
                        updateWorkExperience(index, "url", e.target.value)
                      }
                    />
                  </div>

                  {/* Positions - TODO: Add better UI for multiple positions */}
                  {exp.positions.map((pos, posIndex) => (
                    <div
                      key={posIndex}
                      className="space-y-2 border-t pt-3 mt-3"
                    >
                      <h4 className="text-sm font-medium">
                        Position {posIndex + 1}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`pos-title-${index}-${posIndex}`}>
                            Position Title
                          </Label>
                          <Input
                            id={`pos-title-${index}-${posIndex}`}
                            value={pos.position}
                            onChange={(e) =>
                              updateWorkExperience(index, "positions", [
                                {
                                  ...pos,
                                  position: e.target.value,
                                },
                              ])
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`pos-start-${index}-${posIndex}`}>
                            Start Date
                          </Label>
                          <Input
                            id={`pos-start-${index}-${posIndex}`}
                            value={pos.startDate}
                            onChange={(e) =>
                              updateWorkExperience(index, "positions", [
                                {
                                  ...pos,
                                  startDate: e.target.value,
                                },
                              ])
                            }
                            // TODO: Add onChange handler for nested position update
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`pos-end-${index}-${posIndex}`}>
                            End Date
                          </Label>
                          <Input
                            id={`pos-end-${index}-${posIndex}`}
                            value={pos.endDate}
                            onChange={(e) =>
                              updateWorkExperience(index, "positions", [
                                {
                                  ...pos,
                                  endDate: e.target.value,
                                },
                              ])
                            }
                            // TODO: Add onChange handler for nested position update
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`pos-highlights-${index}-${posIndex}`}>
                          Highlights (one per line)
                        </Label>
                        <Textarea
                          id={`pos-highlights-${index}-${posIndex}`}
                          rows={3}
                          value={pos.highlights.join("\n")}
                          onChange={(e) => {
                            const highlights = e.target.value
                              .split("\n")
                              .map((h) => h.trim())
                              .filter((h) => h);
                            updateWorkExperience(index, "positions", [
                              {
                                ...pos,
                                highlights,
                              },
                            ]);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {/* TODO: Add button to add new position within this experience */}
                </div>
              ))}
            </div>
            {/* Education */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Education</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addEducation}
                  className="h-8"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>
              {userProfile.education.map((edu, index) => (
                <div
                  key={index}
                  className="space-y-3 border rounded-md p-4 relative" // Increased padding
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeEducation(index)}
                  >
                    <MinusCircleIcon className="h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`edu-institution-${index}`}>
                        Institution
                      </Label>
                      <Input
                        id={`edu-institution-${index}`}
                        value={edu.institution}
                        onChange={(e) =>
                          updateEducation(index, "institution", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`edu-area-${index}`}>Area of Study</Label>
                      <Input
                        id={`edu-area-${index}`}
                        value={edu.area}
                        onChange={(e) =>
                          updateEducation(index, "area", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`edu-studyType-${index}`}>
                        Degree Type
                      </Label>
                      <Input
                        id={`edu-studyType-${index}`}
                        value={edu.studyType}
                        onChange={(e) =>
                          updateEducation(index, "studyType", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`edu-location-${index}`}>Location</Label>
                      <Input
                        id={`edu-location-${index}`}
                        value={edu.location}
                        onChange={(e) =>
                          updateEducation(index, "location", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`edu-start-${index}`}>Start Date</Label>
                      <Input
                        id={`edu-start-${index}`}
                        value={edu.startDate}
                        onChange={(e) =>
                          updateEducation(index, "startDate", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`edu-end-${index}`}>End Date</Label>
                      <Input
                        id={`edu-end-${index}`}
                        value={edu.endDate}
                        onChange={(e) =>
                          updateEducation(index, "endDate", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`edu-url-${index}`}>Institution URL</Label>
                    <Input
                      id={`edu-url-${index}`}
                      value={edu.url}
                      onChange={(e) =>
                        updateEducation(index, "url", e.target.value)
                      }
                    />
                  </div>
                  {/* TODO: Add UI for honors, courses, highlights (e.g., Textareas) */}
                </div>
              ))}
            </div>
            {/* Skills */}
            <div className="space-y-4 pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Skills</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openAddCategoryDialog} // Use dialog opener
                  className="h-8"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              {userProfile.skills.map((category, catIndex) => (
                <div key={catIndex} className="border rounded-md p-4 relative">
                  <div className="flex gap-2 items-center mb-2">
                    <div className="flex gap-2 mr-auto">
                      <h4 className="font-medium">{category.category}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeSkillCategory(catIndex)}
                      >
                        <MinusCircleIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAddSkillDialog(catIndex)} // Use dialog opener
                      className="h-7 px-2"
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Add Skill
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, skillIndex) => (
                      <div
                        key={skillIndex}
                        className="flex text-sm items-center gap-1 px-3 py-1 bg-muted text-muted-foreground rounded-full" // Adjusted colors
                      >
                        <span>{skill}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full"
                          onClick={() =>
                            removeSkillFromCategory(catIndex, skillIndex)
                          }
                        >
                          <MinusCircleIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* TODO: Add sections for Affiliations, Awards, Certificates, Publications, Projects, Languages, Interests, References */}
          </div>
        </ScrollArea>

        {/* Add Category Dialog */}
        <Dialog
          open={isAddCategoryDialogOpen}
          onOpenChange={setIsAddCategoryDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Skill Category</DialogTitle>
              <DialogDescription>
                Enter the name for the new skill category (e.g., Programming
                Languages, Tools, Soft Skills).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              <Label htmlFor="new-category-name" className="sr-only">
                Category Name
              </Label>
              <Input
                id="new-category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category Name"
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()} // Allow Enter key submission
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddCategoryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isAddSkillDialogOpen}
          onOpenChange={setIsAddSkillDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
              <DialogDescription>
                Enter the name of the skill to add to the category:{" "}
                {targetCategoryIndex !== null
                  ? userProfile.skills[targetCategoryIndex]?.category
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              <Label htmlFor="new-skill-name" className="sr-only">
                Skill Name
              </Label>
              <Input
                id="new-skill-name"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Skill Name (e.g., React, Python, Public Speaking)"
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill()} // Allow Enter key submission
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddSkillDialogOpen(false);
                  setTargetCategoryIndex(null);
                }}
              >
                Cancel
              </Button>{" "}
              {/* Reset target index on cancel */}
              <Button onClick={handleAddSkill}>Add Skill</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}
