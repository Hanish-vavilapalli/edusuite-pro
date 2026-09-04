import React, { useEffect, useState } from "react";
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Users,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  CheckCircle,
  PlayCircle,
  Tag,
  Trash2,
  UserPlus,
  Sparkles,
  Award,
  BookOpen,
  Trophy,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  fetchCampusEvents,
  createCampusEvent,
  updateEventStatus,
  deleteEvent,
  INITIAL_CAMPUS_EVENTS,
  type CampusEvent,
} from "./CampusEventsService";

const CATEGORIES = [
  "All Categories",
  "Technical Symposium",
  "Cultural Fest",
  "Guest Lecture",
  "Sports Tournament",
  "Workshop",
];

const STATUS_TABS = ["All", "Upcoming", "Live Now", "Completed"] as const;

export function CampusEventsModuleView() {
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_CAMPUS_EVENTS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [activeStatusTab, setActiveStatusTab] = useState<
    "All" | "Upcoming" | "Live Now" | "Completed"
  >("All");
  const [loading, setLoading] = useState(false);

  // Dialog States
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  // Form State for Creating Event
  const [formData, setFormData] = useState<Partial<CampusEvent>>({
    title: "",
    category: "Technical Symposium",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    location: "Main Auditorium (Block A)",
    organizer: "Dept of CSE",
    maxCapacity: 250,
    description: "",
  });

  const loadData = async () => {
    setLoading(true);
    const data = await fetchCampusEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Logic
  const filtered = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.category.toLowerCase().includes(search.toLowerCase()) ||
      evt.location.toLowerCase().includes(search.toLowerCase()) ||
      evt.organizer.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" || evt.category === selectedCategory;

    const matchesStatus =
      activeStatusTab === "All" || evt.status === activeStatusTab;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPI Metrics
  const totalEvents = events.length;
  const liveCount = events.filter((e) => e.status === "Live Now").length;
  const upcomingCount = events.filter((e) => e.status === "Upcoming").length;
  const totalAttendees = events.reduce((sum, e) => sum + e.attendeesCount, 0);

  // Handlers
  const handleOpenCreate = () => {
    setFormData({
      title: "Generative AI & LLM Deployment Workshop",
      category: "Workshop",
      date: "2026-08-22",
      time: "10:00 AM",
      location: "CSE Computer Lab 4",
      organizer: "AI & Robotics Club",
      maxCapacity: 150,
      description: "Comprehensive hands-on session on fine-tuning open-weight foundation models.",
    });
    setIsCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please fill in event title and description.");
      return;
    }

    const created = await createCampusEvent(formData);
    setEvents((prev) => [created, ...prev]);
    setIsCreateDialogOpen(false);
    toast.success(`Campus event "${created.title}" scheduled successfully!`);
  };

  const handleRegisterSpot = (evt: CampusEvent) => {
    if (evt.attendeesCount >= evt.maxCapacity) {
      toast.error(`Event "${evt.title}" is already at full capacity (${evt.maxCapacity} seats filled)!`);
      return;
    }

    const newCount = evt.attendeesCount + 1;
    setEvents((prev) =>
      prev.map((e) => (e.id === evt.id ? { ...e, attendeesCount: newCount } : e)),
    );
    toast.success(
      `Registered for "${evt.title}"! Spot reserved (${newCount} / ${evt.maxCapacity} seats filled).`,
    );
  };

  const handleUpdateStatus = async (
    evt: CampusEvent,
    newStatus: "Upcoming" | "Live Now" | "Completed",
  ) => {
    await updateEventStatus(evt.id, newStatus);
    setEvents((prev) =>
      prev.map((e) => (e.id === evt.id ? { ...e, status: newStatus } : e)),
    );
    toast.success(`Event "${evt.title}" status updated to ${newStatus}!`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to cancel and delete campus event "${title}"?`)) {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success(`Event "${title}" deleted.`);
    }
  };

  const handleOpenView = (evt: CampusEvent) => {
    setSelectedEvent(evt);
    setIsViewDialogOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      "Event ID",
      "Title",
      "Category",
      "Date",
      "Time",
      "Location",
      "Organizer",
      "Registered Attendees",
      "Max Capacity",
      "Status",
      "Description",
    ];
    const rows = filtered.map((e) => [
      e.id,
      `"${e.title}"`,
      e.category,
      e.date,
      `"${e.time}"`,
      `"${e.location}"`,
      `"${e.organizer}"`,
      e.attendeesCount,
      e.maxCapacity,
      e.status,
      `"${e.description}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Campus_Events_Schedule_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filtered.length} campus events to CSV!`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Sparkles className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                Campus Events & Activities Module
              </h1>
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                Student Experience Core
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Organize technical symposiums, cultural fests, guest lectures, sports, and workshop registrations.
            </p>
          </div>
        </div>

        {/* Action Buttons - Top Right Corner */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-9 gap-2 text-xs font-medium border-border hover:bg-accent"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 gap-2 text-xs font-medium border-border hover:bg-accent"
          >
            <Download className="size-3.5" /> Export Schedule
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-9 bg-brand-gradient text-white gap-2 font-semibold text-xs shadow-glow hover:opacity-95"
          >
            <Plus className="size-4" /> Schedule Campus Event
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Total Events</span>
            <Calendar className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-primary">{totalEvents} Events</p>
          <p className="text-[0.68rem] text-muted-foreground">Active calendar entries</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Live Now</span>
            <Flame className="size-4 text-red-500 animate-pulse" />
          </div>
          <p className="text-2xl font-bold font-mono text-red-600">{liveCount} Happening</p>
          <p className="text-[0.68rem] text-red-600 font-medium">In-progress on campus</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Upcoming Scheduled</span>
            <Clock className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600">{upcomingCount} Events</p>
          <p className="text-[0.68rem] text-muted-foreground">Registrations open</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Total Participant Registrations</span>
            <Users className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-600">
            {totalAttendees.toLocaleString("en-IN")}
          </p>
          <p className="text-[0.68rem] text-muted-foreground">Students & faculty enrolled</p>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/50">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveStatusTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeStatusTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-1 sm:flex-none items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search title, category, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-9 w-[150px] text-xs" aria-label="Category Filter">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Grid Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
          <RefreshCw className="size-5 animate-spin text-primary" />
          Loading campus events...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
          <Calendar className="size-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No events found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No campus events matched your search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((evt) => {
            const fillPct = Math.min(100, Math.round((evt.attendeesCount / evt.maxCapacity) * 100));

            return (
              <div
                key={evt.id}
                className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Status & Category Badges */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[0.68rem] text-primary">
                      {evt.category}
                    </Badge>
                    <Badge
                      className={
                        evt.status === "Live Now"
                          ? "bg-red-500/10 text-red-600 border-red-500/20 text-[0.68rem] animate-pulse"
                          : evt.status === "Upcoming"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.68rem]"
                          : "bg-muted text-muted-foreground text-[0.68rem]"
                      }
                    >
                      {evt.status === "Live Now" && <PlayCircle className="size-3 mr-1 inline" />}
                      {evt.status === "Upcoming" && <Clock className="size-3 mr-1 inline" />}
                      {evt.status === "Completed" && <CheckCircle className="size-3 mr-1 inline" />}
                      {evt.status}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {evt.description}
                    </p>
                  </div>

                  {/* Schedule Details */}
                  <div className="space-y-1.5 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-primary/70 shrink-0" /> Date & Time:
                      </span>
                      <span className="font-semibold text-foreground">
                        {evt.date} &middot; {evt.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-primary/70 shrink-0" /> Venue:
                      </span>
                      <span className="font-medium text-foreground truncate max-w-[160px]">
                        {evt.location}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="size-3.5 text-primary/70 shrink-0" /> Organizer:
                      </span>
                      <span className="font-medium text-foreground">{evt.organizer}</span>
                    </div>

                    {/* Progress Bar for Seats */}
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[0.68rem]">
                        <span className="text-muted-foreground">Registrations:</span>
                        <span className="font-bold font-mono text-foreground">
                          {evt.attendeesCount} / {evt.maxCapacity} ({fillPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            fillPct >= 90
                              ? "bg-red-500"
                              : fillPct >= 75
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenView(evt)}
                    className="h-8 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="size-3.5" /> Details
                  </Button>

                  <div className="flex items-center gap-1">
                    {evt.status === "Upcoming" && (
                      <Button
                        size="sm"
                        onClick={() => handleRegisterSpot(evt)}
                        disabled={evt.attendeesCount >= evt.maxCapacity}
                        className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                      >
                        <UserPlus className="size-3.5" /> Register
                      </Button>
                    )}

                    {evt.status === "Upcoming" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(evt, "Live Now")}
                        className="h-8 text-xs font-semibold text-red-600 hover:bg-red-500/10 gap-1"
                        title="Mark Event as Live Now"
                      >
                        <PlayCircle className="size-3.5" /> Live
                      </Button>
                    )}

                    {evt.status === "Live Now" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(evt, "Completed")}
                        className="h-8 text-xs font-semibold text-primary hover:bg-primary/10 gap-1"
                      >
                        <CheckCircle className="size-3.5" /> Complete
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(evt.id, evt.title)}
                      className="size-8 text-muted-foreground hover:text-red-600 hover:bg-red-500/10"
                      title="Cancel Event"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DIALOG 1: CREATE CAMPUS EVENT MODAL */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="size-5 text-primary" /> Schedule New Campus Event
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create a new student workshop, guest lecture, or cultural festival entry.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Event Title *</Label>
                <Input
                  required
                  placeholder="e.g. AI & Robotics Hackathon 2026"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val: any) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== "All Categories").map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Date *</Label>
                <Input
                  type="date"
                  required
                  value={formData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Time *</Label>
                <Input
                  placeholder="e.g. 10:00 AM"
                  value={formData.time || ""}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Venue / Location *</Label>
                <Input
                  required
                  placeholder="e.g. Main Auditorium"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Max Seat Capacity</Label>
                <Input
                  type="number"
                  value={formData.maxCapacity || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, maxCapacity: Number(e.target.value) })
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Organizing Club / Dept *</Label>
              <Input
                required
                placeholder="e.g. Dept of CSE & AI Society"
                value={formData.organizer || ""}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Event Overview & Description *</Label>
              <Textarea
                required
                placeholder="Describe key speakers, agenda, and participant prerequisites..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-xs min-h-[80px]"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">
                Schedule Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: VIEW EVENT DOSSIER MODAL */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Campus Event Details
            </DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs">
                    {selectedEvent.category}
                  </Badge>
                  <Badge
                    className={
                      selectedEvent.status === "Live Now"
                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    }
                  >
                    {selectedEvent.status}
                  </Badge>
                </div>
                <h2 className="text-base font-bold text-foreground">{selectedEvent.title}</h2>
                <p className="text-xs text-primary font-medium">
                  Organized by: {selectedEvent.organizer}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span className="font-semibold text-foreground">
                    {selectedEvent.date} at {selectedEvent.time}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Venue:</span>
                  <span className="font-medium text-foreground">{selectedEvent.location}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60 font-mono">
                  <span className="text-muted-foreground font-sans">Capacity & Enrollment:</span>
                  <span className="font-bold text-foreground">
                    {selectedEvent.attendeesCount} / {selectedEvent.maxCapacity} seats filled
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-card border border-border/60 space-y-1">
                  <span className="text-muted-foreground font-semibold">Event Agenda:</span>
                  <p className="text-xs text-foreground">{selectedEvent.description}</p>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="w-full text-xs"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
