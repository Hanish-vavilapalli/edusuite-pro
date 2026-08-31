import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, Download, Filter, Moon, Search, Sun, Settings as SettingsIcon, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  roleOrder,
  roleProfiles,
  RESPONSIBILITY_FLAGS,
  EXTERNAL_PERSONAS,
  DEPARTMENTS,
  type LoginRole,
  type ExternalPersona,
  type DepartmentCode,
} from "@/config/roles";
import { useRole } from "@/context/role-context";
import { notificationService, type Notification } from "@/shared/notifications";
import { eventBus } from "@/shared/services/eventBus";

function useCrumbs() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part, index) => ({
    label: part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + parts.slice(0, index + 1).join("/"),
    last: index === parts.length - 1,
  }));
}

export function Topbar() {
  const crumbs = useCrumbs();
  const navigate = useNavigate();
  const {
    role,
    setRole,
    profile,
    flags,
    setFlags,
    department,
    setDepartment,
    externalPersona,
    setExternalPersona,
  } = useRole();
  const [dark, setDark] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const getTargetNotifRole = (): string => {
    if (role === "student") return "student";
    if (role === "parent") return "parent";
    if (role === "super-admin" || role === "super_admin") return "super-admin";
    if (role === "staff") {
      if (flags.includes("isHod")) return "hod";
      if (flags.includes("isLibraryAdmin")) return "librarian";
      if (flags.includes("isPlacementOfficer")) return "placement";
      if (flags.includes("isExamController") || flags.includes("isExamAssistant")) return "exam_cell";
      if (flags.includes("isFinanceOfficer")) return "accounts";
      if (flags.includes("isHostelWarden")) return "warden";
      if (flags.includes("isTransportOfficer")) return "transport";
      return "faculty";
    }
    return "external-user";
  };

  const activeNotifRole = getTargetNotifRole();

  useEffect(() => {
    let active = true;
    const fetchNotifs = () => {
      notificationService.getNotificationsForRole(activeNotifRole).then((data) => {
        if (active) {
          setNotifs(data);
        }
      });
    };

    fetchNotifs();

    const unsubscribeNew = eventBus.on("notification:new_added", (newNotif) => {
      if (newNotif.target_role === activeNotifRole) {
        fetchNotifs();
      }
    });

    return () => {
      active = false;
      unsubscribeNew();
    };
  }, [activeNotifRole]);

  const unread = notifs.filter((n) => n.status === "unread").length;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical":
        return <span className="bg-red-600 text-white animate-pulse text-[0.6rem] font-bold px-1.5 py-0.5 rounded">Critical</span>;
      case "High":
        return <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 text-[0.6rem] font-bold px-1.5 py-0.5 rounded">High</span>;
      case "Medium":
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[0.6rem] font-bold px-1.5 py-0.5 rounded">Medium</span>;
      case "Low":
        return <span className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 text-[0.6rem] font-bold px-1.5 py-0.5 rounded">Low</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 text-[0.6rem] font-bold px-1.5 py-0.5 rounded">Info</span>;
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 min-w-0">
        <div className="flex min-w-0 items-center gap-2 shrink-0">
          <SidebarTrigger className="shrink-0" />
          <div className="relative hidden xl:block min-w-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search students, staff..." className="h-8 w-44 lg:w-56 text-xs pl-8" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto scrollbar-none py-0.5 max-w-full">
          <Select
            value={role}
            onValueChange={(v) => {
              const newRole = v as LoginRole;
              setRole(newRole);
              if (newRole === "super-admin") navigate({ to: "/super-admin/dashboard" });
              else if (newRole === "student") navigate({ to: "/student/dashboard" });
              else if (newRole === "parent") navigate({ to: "/parent/dashboard" });
              else if (newRole === "external-user") navigate({ to: "/external-user/dashboard" });
              else if (newRole === "staff") navigate({ to: "/dashboard" });
            }}
          >
            <SelectTrigger className="h-9 w-[160px] font-semibold text-xs border-primary/40 bg-card" aria-label="5 Core Login Roles">
              <SelectValue placeholder="Core Login Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super-admin">1. Super Admin</SelectItem>
              <SelectItem value="staff">2. Staff (Faculty)</SelectItem>
              <SelectItem value="student">3. Student</SelectItem>
              <SelectItem value="parent">4. Parent</SelectItem>
              <SelectItem value="external-user">5. External User</SelectItem>
            </SelectContent>
          </Select>

          {role === "staff" && (
            <>
              {/* Primary Staff Privilege Flag Dropdown */}
              <Select
                value={flags.find((f) => f.startsWith("is")) || "isMentor"}
                onValueChange={(flagVal) => {
                  const otherFlags = flags.filter((f) => !f.startsWith("is") || f === "isMentor");
                  setFlags(Array.from(new Set([flagVal, ...otherFlags])));
                }}
              >
                <SelectTrigger className="h-9 w-[150px] text-xs font-mono bg-card" aria-label="Staff Flag">
                  <SelectValue placeholder="Privilege Flag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="isHod">Flag: isHod (HOD)</SelectItem>
                  <SelectItem value="isDean">Flag: isDean (Dean)</SelectItem>
                  <SelectItem value="isExamController">Flag: Exam Officer</SelectItem>
                  <SelectItem value="isExamAssistant">Flag: Exam Assistant</SelectItem>
                  <SelectItem value="isPlacementOfficer">Flag: isPlacementOfficer</SelectItem>
                  <SelectItem value="isTransportOfficer">Flag: isTransportOfficer</SelectItem>
                  <SelectItem value="isHostelWarden">Flag: isHostelWarden</SelectItem>
                  <SelectItem value="isFinanceOfficer">Flag: isFinanceOfficer</SelectItem>
                  <SelectItem value="isLibraryAdmin">Flag: isLibraryAdmin</SelectItem>
                  <SelectItem value="isHRManager">Flag: isHRManager</SelectItem>
                  <SelectItem value="isPrincipal">Flag: isPrincipal</SelectItem>
                  <SelectItem value="isVicePrincipal">Flag: isVicePrincipal</SelectItem>
                  <SelectItem value="isMentor">Flag: isMentor (Default)</SelectItem>
                </SelectContent>
              </Select>

              {/* Department Scope Dropdown */}
              <Select value={department || "CSE"} onValueChange={(v) => setDepartment((v || undefined) as DepartmentCode)}>
                <SelectTrigger className="h-9 w-[110px] text-xs font-mono bg-card" aria-label="Department Scope">
                  <SelectValue placeholder="Dept" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.code} value={dept.code}>
                      Dept: {dept.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {role === "external-user" && (
            <Select
              value={externalPersona || "recruiter"}
              onValueChange={(v) => {
                const persona = (v || undefined) as ExternalPersona;
                setExternalPersona(persona);
                navigate({ to: "/external-user/dashboard" });
              }}
            >
              <SelectTrigger className="h-9 w-[160px] text-xs font-medium bg-card" aria-label="External Persona">
                <SelectValue placeholder="External Persona" />
              </SelectTrigger>
              <SelectContent>
                {EXTERNAL_PERSONAS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    Persona: {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {role === "staff" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 px-3">
                  <SettingsIcon className="size-3.5" /> Privileges ({flags.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end">
                <h4 className="font-semibold text-sm mb-2 border-b border-border pb-1">
                  Responsibility Flags
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {RESPONSIBILITY_FLAGS.map((f) => {
                    const active = flags.includes(f.id);
                    return (
                      <div key={f.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`flag-${f.id}`}
                          checked={active}
                          onCheckedChange={(checked) => {
                            const isChecked = !!checked;
                            if (isChecked) {
                              setFlags([...flags, f.id]);
                              if (f.id === "isLibraryAdmin") navigate({ to: "/library" });
                              else if (f.id === "isTransportOfficer") navigate({ to: "/transport" });
                              else if (f.id === "isHostelWarden") navigate({ to: "/hostel" });
                              else if (f.id === "isPlacementOfficer") navigate({ to: "/placement/dashboard" });
                              else if (f.id === "isHod") navigate({ to: "/hod/dashboard" });
                              else if (f.id === "isDean") navigate({ to: "/staff" });
                              else if (f.id === "isExamController") navigate({ to: "/examcell/dashboard" });
                              else if (f.id === "isExamAssistant") navigate({ to: "/examcell/dashboard" });
                              else if (f.id === "isFinanceOfficer") navigate({ to: "/finance/dashboard" });
                              else if (f.id === "isHRManager") navigate({ to: "/hr/dashboard" });
                            } else {
                              setFlags(flags.filter((x) => x !== f.id));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`flag-${f.id}`}
                          className="text-xs cursor-pointer select-none truncate"
                        >
                          {f.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setDark((d) => !d)}
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <Sheet open={isNotifOpen} onOpenChange={setIsNotifOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell className="size-4 text-slate-700 dark:text-slate-200" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-red-600 text-[0.6rem] font-bold text-white shadow-xs animate-pulse">
                    {unread}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-sm flex flex-col h-full p-6">
              <SheetHeader className="mb-4 shrink-0">
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>Campus updates for {profile.personaName}</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {notifs.length === 0 ? (
                  <div className="text-center py-10 text-sm text-muted-foreground">
                    No notifications for this role.
                  </div>
                ) : (
                  notifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={async () => {
                        if (n.status === "unread") {
                          await notificationService.markNotificationAsRead(n.id, profile.personaName);
                          setNotifs((prev) =>
                            prev.map((x) => (x.id === n.id ? { ...x, status: "read" } : x))
                          );
                        } else {
                          await notificationService.trackClick(n.id, profile.personaName);
                        }
                        if (n.route) {
                          navigate({ to: n.route });
                        }
                      }}
                      className={`rounded-xl border border-border bg-card p-3 shadow-card transition-colors hover:bg-accent/40 cursor-pointer ${
                        n.status === "unread" ? "border-l-4 border-l-primary" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[0.65rem] px-2 py-0.5 rounded font-semibold ${
                            n.type === "Warning" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" :
                            n.type === "Error" || n.type === "Emergency" ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300" :
                            n.type === "Success" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" :
                            "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }`}>
                            {n.type}
                          </span>
                          {getPriorityBadge(n.priority)}
                        </div>
                        <span className="text-[0.65rem] text-muted-foreground font-mono">
                          {n.module}
                        </span>
                      </div>
                      <p className="text-sm font-semibold mt-1.5">{n.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground leading-normal">{n.message}</p>
                      
                      {n.actions && n.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-border/40">
                          {n.actions.map((act) => (
                            <Button
                              key={act.label}
                              size="sm"
                              variant={act.actionType === "approve" ? "default" : act.actionType === "reject" ? "destructive" : "outline"}
                              className={`text-[0.65rem] h-6 py-0 px-2 ${
                                act.actionType === "approve" ? "bg-emerald-600 text-white hover:bg-emerald-700 border-none shadow-none" : ""
                              }`}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (act.actionType === "link" && act.route) {
                                  navigate({ to: act.route });
                                } else {
                                  toast.success(`Action "${act.label}" succeeded.`);
                                }
                                await notificationService.markNotificationAsRead(n.id, profile.personaName);
                                setNotifs((prev) =>
                                  prev.map((x) => (x.id === n.id ? { ...x, status: "read" } : x))
                                );
                              }}
                            >
                              {act.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/40 text-[0.65rem] text-muted-foreground">
                        <span>By: {n.created_by}</span>
                        <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-1.5 sm:px-2">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {profile.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-32 truncate text-sm font-medium lg:inline">
                  {profile.personaName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-sm font-semibold">{profile.personaName}</p>
                <p className="text-xs font-normal text-muted-foreground">{profile.personaMeta}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={role === "super-admin" || role === "super_admin" ? "/super-admin/profile" : role === "student" ? "/student/profile" : "/faculty/profile"}>
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/login">Sign out</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-4 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {crumbs.map((c) => (
              <span key={c.href} className="flex items-center gap-1.5">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {c.last ? (
                    <BreadcrumbPage>{c.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={c.href as any}>{c.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          {profile.flags.slice(0, 2).map((flag) => {
            const label = RESPONSIBILITY_FLAGS.find((f) => f.id === flag)?.label || flag;
            return (
              <Badge
                key={flag}
                variant="secondary"
                className="hidden text-[0.65rem] sm:inline-flex"
              >
                {label}
              </Badge>
            );
          })}
        </div>
      </div>
    </header>
  );
}
