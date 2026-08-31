import React, { useState } from "react";
import { VideoLecture } from "@/modules/lms/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Video, Play, Clock, User, Calendar, ExternalLink, Sparkles, Film } from "lucide-react";
import { toast } from "sonner";

interface VideoLecturesProps {
  videos: VideoLecture[];
  searchQuery?: string;
}

export function VideoLectures({ videos, searchQuery = "" }: VideoLecturesProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoLecture | null>(null);

  const filteredVideos = videos.filter((vid) => {
    const q = searchQuery.toLowerCase();
    return (
      vid.title.toLowerCase().includes(q) ||
      vid.subject.toLowerCase().includes(q) ||
      vid.instructor.toLowerCase().includes(q) ||
      vid.department.toLowerCase().includes(q)
    );
  });

  const getEmbedUrl = (url: string) => {
    if (!url) return "https://www.youtube.com/embed/aircAruvnKk";
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  return (
    <div className="space-y-6">
      {/* VIDEO LECTURES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map((vid) => {
          const embedUrl = getEmbedUrl(vid.videoUrl);
          const subjectCode = vid.subject && vid.subject.includes(":") ? vid.subject.split(":")[0].trim() : "GEN";
          const subjectName = vid.subject && vid.subject.includes(":") ? vid.subject.split(":")[1].trim() : vid.subject;

          return (
            <div
              key={vid.id}
              className="p-4 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md hover:border-primary/20 transition-all flex flex-col justify-between space-y-3.5 group overflow-hidden"
            >
              {/* VIDEO THUMBNAIL / PREVIEW */}
              <div className="aspect-video w-full rounded-xl bg-slate-950 overflow-hidden relative group/player border border-border/60">
                <iframe
                  src={embedUrl}
                  title={vid.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* VIDEO DETAILS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/15 font-mono">
                    {subjectCode}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {vid.duration || "45 mins"}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-foreground line-clamp-2 min-h-[32px] group-hover:text-primary transition-colors">
                  {vid.title}
                </h4>

                <p className="text-[10px] text-muted-foreground truncate" title={subjectName}>
                  {subjectName}
                </p>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1 truncate">
                  <User className="h-3 w-3 shrink-0 text-primary/70" />
                  <span className="truncate">{vid.instructor}</span>
                </span>
                <span className="font-mono flex items-center gap-1 shrink-0">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {vid.createdAt}
                </span>
              </div>

              {/* ACTION BUTTON */}
              <Button
                onClick={() => setSelectedVideo(vid)}
                size="sm"
                variant="outline"
                className="h-8.5 text-[11px] font-bold border-border text-foreground hover:bg-muted/40 w-full gap-1.5"
              >
                <Play className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600 shrink-0" />
                Watch Full Lecture
              </Button>
            </div>
          );
        })}
      </div>

      {filteredVideos.length === 0 && (
        <div className="p-12 text-center border border-dashed border-border bg-muted/10 rounded-2xl">
          <Film className="h-8 w-8 text-muted-foreground mx-auto mb-2.5 opacity-50 animate-pulse" />
          <p className="text-xs text-muted-foreground font-bold">
            No video lectures uploaded yet for your courses.
          </p>
        </div>
      )}

      {/* FULL VIDEO PLAYER MODAL */}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-3xl rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader className="border-b pb-3 border-slate-100 dark:border-slate-800 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono font-bold text-primary border-primary/20">
                  {selectedVideo.subject}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">
                  Duration: {selectedVideo.duration}
                </span>
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                {selectedVideo.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Instructor: {selectedVideo.instructor} &middot; Published: {selectedVideo.createdAt}
              </DialogDescription>
            </DialogHeader>

            <div className="my-3 aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-lg border border-border">
              <iframe
                src={getEmbedUrl(selectedVideo.videoUrl)}
                title={selectedVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
              <span className="font-medium">Department: {selectedVideo.department}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(selectedVideo.videoUrl, "_blank")}
                className="h-7 text-xs text-primary gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open in New Tab
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
