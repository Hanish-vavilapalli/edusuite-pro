import React, { useState } from "react";
import { MaterialItem } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Bookmark,
  Share2,
  Eye,
  Search,
  Filter,
  Video,
  FileCode,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface CourseMaterialsProps {
  materials: MaterialItem[];
  searchQuery: string;
}

export function CourseMaterials({ materials, searchQuery }: CourseMaterialsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("All");
  const [previewMaterial, setPreviewMaterial] = useState<MaterialItem | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});

  const categories = [
    "All",
    "Lecture Notes",
    "PPTs",
    "PDFs",
    "Lab Manuals",
    "Reference Books",
    "Recorded Videos",
    "Code Files",
    "Previous Papers",
  ];

  const courseCodes = ["All", "CS401", "CS402", "CS403", "CS404", "CS405", "CS406"];

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.faculty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || m.category === selectedCategory;
    const matchesCourse = selectedCourseFilter === "All" || m.courseCode === selectedCourseFilter;
    return matchesSearch && matchesCategory && matchesCourse;
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const nextState = !prev[id];
      toast.success(nextState ? "Added to bookmarked learning resources!" : "Removed from bookmarks.");
      return { ...prev, [id]: nextState };
    });
  };

  const handlePreview = (mat: MaterialItem) => {
    if (mat.url) {
      const previewUrl = mat.url.startsWith("http")
        ? mat.url
        : `http://localhost:5000${mat.url}`;
      window.open(previewUrl, "_blank");
    } else {
      setPreviewMaterial(mat);
    }
  };

  const handleDownload = async (mat: MaterialItem) => {
    if (mat.url) {
      const downloadUrl = mat.url.startsWith("http")
        ? mat.url
        : `http://localhost:5000${mat.url}`;
      
      try {
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = mat.title.toLowerCase().endsWith(".pdf") ? mat.title : `${mat.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        toast.success(`Downloaded ${mat.title} (${mat.size})`);
        return;
      } catch (err) {
        console.error("Failed to download file via blob", err);
        // Fallback to window.open if blocked
        window.open(downloadUrl, "_blank");
        return;
      }
    }

    const content = `EDUSUITE PRO LMS DIGITAL MATERIAL
=====================================================
Title: ${mat.title}
Course Code: ${mat.courseCode} (${mat.courseName})
Category: ${mat.category}
Uploaded By: ${mat.faculty}
Upload Date: ${mat.uploadDate}

RESOURCE DESCRIPTION:
${mat.description || "Official course notes, lecture slides, and reference materials provided by the academic department."}

=====================================================
Verified Official Academic Resource — EduSuite ERP`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${mat.title.replace(/[\s,]+/g, "_")}.${mat.type || "pdf"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${mat.title} (${mat.size})`);
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = (mat: MaterialItem) => {
    const shareUrl = `https://edusuite.pro/lms/materials/${mat.id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedId(mat.id);
        toast.success(`Copied share link for "${mat.title}" to clipboard!`);
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(() => {
        setCopiedId(mat.id);
        toast.success(`Share Link: ${shareUrl}`);
        setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      setCopiedId(mat.id);
      toast.success(`Share Link: ${shareUrl}`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  console.log("=== CourseMaterials Render ===");
  console.log("materials prop passed:", materials);
  console.log("filteredMaterials output:", filteredMaterials);

  return (
    <div className="space-y-6">
      {/* STUDY NOTE CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMaterials.map((mat) => (
          <div
            key={mat.id}
            className="p-4 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md hover:border-primary/20 transition-all flex flex-col justify-between space-y-3.5 group overflow-hidden"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/15 font-mono">
                  {mat.courseCode !== "GEN" ? mat.courseCode : "General"}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {mat.size}
                </span>
              </div>
              <h4 className="text-xs font-bold text-foreground line-clamp-2 min-h-[32px] group-hover:text-primary transition-colors">
                {mat.title}
              </h4>
              <p className="text-[10px] text-muted-foreground truncate" title={mat.courseName}>
                {mat.courseCode !== "GEN" ? mat.courseName : "General Academic Resource"}
              </p>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground font-medium">
              <span>{mat.faculty}</span>
              <span className="font-mono">{mat.uploadDate}</span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                onClick={() => handlePreview(mat)}
                size="sm"
                variant="outline"
                className="h-8 text-[11px] font-bold border-border text-foreground hover:bg-muted/40 w-full"
              >
                <Eye className="h-3.5 w-3.5 text-purple-600 mr-1 shrink-0" />
                Preview
              </Button>
              <Button
                onClick={() => handleDownload(mat)}
                size="sm"
                variant="outline"
                className="h-8 text-[11px] font-bold border-border text-foreground hover:bg-muted/40 w-full"
              >
                <Download className="h-3.5 w-3.5 text-blue-600 mr-1 shrink-0" />
                Save
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="p-12 text-center border border-dashed border-border bg-muted/10 rounded-2xl">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2.5 opacity-50 animate-pulse" />
          <p className="text-xs text-muted-foreground font-bold">
            No official study notes or PDFs cataloged for your department.
          </p>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewMaterial && (
        <Dialog open={!!previewMaterial} onOpenChange={() => setPreviewMaterial(null)}>
          <DialogContent className="max-w-xl rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader className="border-b pb-3 border-slate-100 dark:border-slate-800 text-left">
              <Badge variant="outline" className="w-fit mb-1 font-mono font-bold text-purple-600 border-purple-200">
                {previewMaterial.courseCode} • PDF
              </Badge>
              <DialogTitle className="text-base font-bold">
                {previewMaterial.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Uploaded by {previewMaterial.faculty} on {previewMaterial.uploadDate} ({previewMaterial.size})
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <FileText className="h-12 w-12 text-purple-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Document Preview Window (PDF)
              </p>
              <p className="text-[11px] text-slate-500">
                Simulated high-resolution canvas viewer for EduSuite LMS learning materials.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                onClick={() => handleDownload(previewMaterial)}
                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 w-full"
              >
                <Download className="h-3.5 w-3.5" /> Download Full Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
