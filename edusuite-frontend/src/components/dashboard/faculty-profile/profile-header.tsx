import { useState } from "react";
import { Edit2, Key, CheckCircle, Briefcase, FileCheck, Calendar, ShieldCheck, Cpu, Code, Lightbulb } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EditProfileModal } from "./edit-profile-modal";
import { ChangePasswordModal } from "./change-password-modal";
import type { FacultyProfileData } from "@/data/faculty-mock-data";

interface ProfileHeaderProps {
  profileData: FacultyProfileData;
  onSaveProfile: (updatedData: Partial<FacultyProfileData>) => void;
}

export function ProfileHeader({ profileData, onSaveProfile }: ProfileHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter((n) => n.includes(".") === false) // exclude title like Dr.
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "FC";
  };

  const technicalSkills = profileData.skills?.technicalSkills?.length ? profileData.skills.technicalSkills : ["VLSI", "Signal Processing", "Embedded Systems", "IoT"];
  const progLangs = profileData.skills?.programmingLanguages?.length ? profileData.skills.programmingLanguages : ["MATLAB", "Python", "C++"];
  const researchAreas = profileData.skills?.researchAreas?.length ? profileData.skills.researchAreas : ["MEMS", "Wireless Communication"];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card space-y-6">
      <div className="absolute right-0 top-0 h-24 w-24 bg-primary/5 blur-2xl" />
      
      {/* Top Header Main Card Row - Spread Out Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Avatar & Basic Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar Area */}
          <div className="relative shrink-0 group">
            {profileData.profilePhoto ? (
              <img
                src={profileData.profilePhoto}
                alt={profileData.name}
                className="size-24 rounded-2xl object-cover border-2 border-primary/20 shadow-sm"
              />
            ) : (
              <div className="size-24 rounded-2xl bg-indigo-600/10 text-indigo-600 font-bold font-display text-3xl border border-indigo-500/20 shadow-sm grid place-items-center">
                {getInitials(profileData.name)}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white border-2 border-card shadow-sm">
              <CheckCircle className="size-3" />
            </span>
          </div>

          {/* Name & Title */}
          <div className="text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-display text-2xl font-black tracking-tight">{profileData.name}</h2>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 py-0.5 px-2.5 rounded-xl text-[0.68rem] font-bold">
                {profileData.status || "Active"}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-primary">{profileData.designation || "Professor"}</p>
            <p className="text-xs text-muted-foreground font-medium">{profileData.department || "Electronics & Communication Engineering"}</p>
          </div>
        </div>

        {/* Center/Middle: Quick Metadata Badge Cards (Spread across header) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 lg:max-w-xl bg-muted/30 p-3 rounded-2xl border border-border/50">
          <div className="space-y-0.5 p-2 rounded-xl bg-background border border-border/40 text-center sm:text-left">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
              <Briefcase className="size-3 text-indigo-600" /> Employee ID
            </span>
            <p className="text-xs font-black font-mono text-foreground">{profileData.employeeId}</p>
          </div>

          <div className="space-y-0.5 p-2 rounded-xl bg-background border border-border/40 text-center sm:text-left">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
              <FileCheck className="size-3 text-emerald-600" /> Employment
            </span>
            <p className="text-xs font-black text-foreground">{profileData.employmentType || "Full-Time"}</p>
          </div>

          <div className="space-y-0.5 p-2 rounded-xl bg-background border border-border/40 text-center sm:text-left col-span-2 sm:col-span-1">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="size-3 text-amber-600" /> Joined Date
            </span>
            <p className="text-xs font-black text-foreground">{profileData.joiningDate || "June 01, 2018"}</p>
          </div>
        </div>

        {/* Right: Action Button Group (Edit Profile & Change Password ONLY) */}
        <div className="flex sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-center w-full lg:w-auto">
          <Button
            onClick={() => setIsEditOpen(true)}
            variant="outline"
            className="flex-1 lg:flex-none justify-center rounded-xl cursor-pointer hover:bg-muted text-xs h-9 font-bold"
          >
            <Edit2 className="size-3.5 mr-1.5" /> Edit Profile
          </Button>
          <Button
            onClick={() => setIsPasswordOpen(true)}
            variant="outline"
            className="flex-1 lg:flex-none justify-center rounded-xl cursor-pointer hover:bg-muted text-xs h-9 font-bold"
          >
            <Key className="size-3.5 mr-1.5" /> Change Password
          </Button>
        </div>
      </div>

      {/* Embedded Profile Integrity & Skills Matrix Panel */}
      <div className="pt-4 border-t border-border/60 grid gap-6 md:grid-cols-3">
        {/* Profile Integrity Progress */}
        <div className="bg-muted/30 border border-border/60 p-4 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600" />
              Profile Integrity
            </span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.65rem] font-bold">
              {profileData.profileCompletion?.percentage || 92}% Complete
            </Badge>
          </div>
          <Progress value={profileData.profileCompletion?.percentage || 92} className="h-2 bg-muted" />
          <p className="text-[0.7rem] text-muted-foreground font-medium">
            ERP documentation verification score verified by Academic Dean.
          </p>
        </div>

        {/* Skills & Expertise Matrix */}
        <div className="md:col-span-2 bg-muted/30 border border-border/60 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Cpu className="size-4 text-indigo-600" />
              Skills & Expertise Matrix
            </span>
            <span className="text-[0.7rem] text-muted-foreground font-medium">Validated Technologies</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mr-1">
              <Code className="size-3" /> Tech:
            </span>
            {technicalSkills.map((sk) => (
              <Badge key={sk} variant="secondary" className="rounded-lg text-[0.68rem] font-semibold bg-background border">
                {sk}
              </Badge>
            ))}

            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-2 mr-1">
              <Lightbulb className="size-3" /> Languages:
            </span>
            {progLangs.map((pl) => (
              <Badge key={pl} variant="outline" className="rounded-lg text-[0.68rem] font-semibold bg-background border border-indigo-500/20 text-indigo-600">
                {pl}
              </Badge>
            ))}

            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-2 mr-1">
              <Cpu className="size-3" /> Research:
            </span>
            {researchAreas.map((ra) => (
              <Badge key={ra} variant="outline" className="rounded-lg text-[0.68rem] font-semibold bg-background border border-purple-500/20 text-purple-600">
                {ra}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <EditProfileModal
        profileData={profileData}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={onSaveProfile}
      />
      <ChangePasswordModal
        open={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
      />
    </div>
  );
}
