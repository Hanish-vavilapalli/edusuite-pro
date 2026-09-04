import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  ShieldAlert,
  Building,
  Key,
  Users,
  Search,
  Download,
  Filter,
  Palette,
  Calendar,
  Bell,
  Clock,
  Eye,
  EyeOff,
  Check,
  ToggleRight,
  GitBranch,
  ArrowRight,
  Plus,
  Trash2,
  Shield,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Laptop,
  Smartphone,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  Mail,
  User,
  UserCog,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRole } from "@/context/role-context";
import {
  roleProfiles,
  ERP_MODULES,
  DEPARTMENTS,
  RESPONSIBILITY_FLAGS,
  getDefaultRouteForUser,
  type LoginRole,
} from "@/config/roles";
import {
  getBasePermissions,
  getFlagOverrideForModule,
  type ModulePermissions,
  type PermissionScope,
} from "@/lib/permissions";
import api from "@/lib/api";

export const Route = createFileRoute("/settings")({
  component: SettingsRedirect,
});

function SettingsRedirect() {
  const { role, flags } = useRole();
  if (role === "super-admin" || role === "super_admin") {
    return <Navigate to="/super-admin/settings" replace />;
  }
  const defaultRoute = getDefaultRouteForUser(role, flags);
  return <Navigate to={defaultRoute} replace />;
}

const scopeLabels: Record<string, string> = {
  own: "Own Records",
  department: "Department",
  school: "School",
  campus: "Campus",
  institution: "Institution",
  global: "Global",
};

export function SettingsPage({ withLayout = true }: { withLayout?: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptScope, setSelectedDeptScope] = useState("all");
  const { role, featureFlags, setFeatureFlags } = useRole();

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSubmitting, setPassSubmitting] = useState(false);

  // Active Sessions & Audit Activity state
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revokingSessions, setRevokingSessions] = useState(false);

  // Theme & Preferences State
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "system">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") return stored;
    }
    return "system";
  });

  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifications: true,
    securityAlerts: true, // Mandatory
    approvalNotifications: true,
    systemAnnouncements: true,
  });

  // Workflows configuration state
  const [workflows, setWorkflows] = useState([
    {
      id: "leave",
      name: "Faculty Leave Approval",
      steps: ["Faculty Advisor", "HOD (Department Head)", "Dean", "Principal"],
    },
    {
      id: "purchase",
      name: "Procurement / Purchase Request",
      steps: ["Inventory Manager", "Finance Officer", "Principal"],
    },
    {
      id: "exam",
      name: "Exam Result Publication",
      steps: ["Exam Controller", "Dean", "Principal"],
    },
    {
      id: "admission",
      name: "Student Scholarship Approval",
      steps: ["Admissions Officer", "Finance Officer", "Principal"],
    },
  ]);

  // Permission Formula Evaluator state
  const [calcRole, setCalcRole] = useState<LoginRole>("staff");
  const [calcPrivilege, setCalcPrivilege] = useState("isExamController");
  const [calcModule, setCalcModule] = useState("examination");
  const [calcAction, setCalcAction] = useState<"read" | "create" | "update" | "delete" | "approve">(
    "approve"
  );
  const [calcScope, setCalcScope] = useState<PermissionScope>("institution");

  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [tempStep, setTempStep] = useState("HOD (Department Head)");

  // Custom permissions matrix state
  const [customMatrix, setCustomMatrix] = useState<
    Record<string, Record<string, Partial<ModulePermissions>>>
  >({});

  // Fetch real settings and security audit logs on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSettingsData() {
      setLoadingSessions(true);
      try {
        const [settingsRes, logsRes] = await Promise.all([
          api.get("/super-admin/settings").catch(() => null),
          api.get("/super-admin/audit-logs").catch(() => null),
        ]);

        if (isMounted) {
          if (settingsRes?.data) {
            if (settingsRes.data.activeSessions) {
              setActiveSessions(settingsRes.data.activeSessions);
            }
            if (settingsRes.data.settings?.notificationPreferences) {
              setNotifPrefs(settingsRes.data.settings.notificationPreferences);
            }
          }

          if (logsRes?.data && Array.isArray(logsRes.data)) {
            setSecurityLogs(logsRes.data.slice(0, 10));
          }
        }
      } finally {
        if (isMounted) setLoadingSessions(false);
      }
    }
    loadSettingsData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Theme switcher handler
  const handleThemeChange = async (themeMode: "light" | "dark" | "system") => {
    setCurrentTheme(themeMode);
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (themeMode === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isSystemDark);
      localStorage.setItem("theme", "system");
    }

    try {
      await api.put("/super-admin/settings", { theme: themeMode });
      toast.success(`Appearance theme set to ${themeMode.toUpperCase()}.`);
    } catch (e) {}
  };

  // Change Password submit handler
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");

    if (!currentPassword) {
      setPassError("Current password is required.");
      return;
    }

    if (!newPassword) {
      setPassError("New password is required.");
      return;
    }

    if (newPassword.length < 8) {
      setPassError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setPassError("New password must be different from your current password.");
      return;
    }

    setPassSubmitting(true);

    try {
      const response = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success(response.data?.message || "Password updated successfully in database.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.error || "Failed to update password. Please verify your current password.";
      setPassError(errMsg);
      toast.error(errMsg);
    } finally {
      setPassSubmitting(false);
    }
  };

  // Revoke active sessions handler
  const handleRevokeOtherSessions = async () => {
    setRevokingSessions(true);
    try {
      await api.post("/super-admin/revoke-other-sessions");
      toast.success("All other active sessions have been signed out successfully.");
    } catch (err: any) {
      toast.error("Failed to revoke active sessions.");
    } finally {
      setRevokingSessions(false);
    }
  };

  // Toggle notification preference handler
  const handleToggleNotification = async (key: keyof typeof notifPrefs) => {
    if (key === "securityAlerts") {
      toast.info("Security Alerts are mandatory for Super Admin accounts and cannot be disabled.");
      return;
    }

    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);

    try {
      await api.put("/super-admin/settings", { notificationPreferences: updated });
      toast.success("Notification preferences updated.");
    } catch (err) {
      toast.error("Failed to save notification preferences.");
    }
  };

  const handleTogglePerm = (
    moduleId: string,
    roleOrFlag: string,
    action: keyof ModulePermissions
  ) => {
    setCustomMatrix((prev) => {
      const modulePrev = prev[moduleId] || {};
      const targetPrev = modulePrev[roleOrFlag] || {};
      const newval = !targetPrev[action];

      const updated = {
        ...prev,
        [moduleId]: {
          ...modulePrev,
          [roleOrFlag]: {
            ...targetPrev,
            [action]: newval,
          },
        },
      };

      toast.success(
        `Updated permission for ${moduleId}: ${roleOrFlag} -> ${action} = ${newval ? "Allowed" : "Denied"}`
      );
      return updated;
    });
  };

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ customMatrix, featureFlags, workflows, notifPrefs }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "edusuite_settings_config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Settings configuration exported successfully!");
  };

  const getCellPerms = (moduleId: string, targetKey: string, isFlag = false) => {
    let base: ModulePermissions;
    if (isFlag) {
      base = {
        read: false,
        create: false,
        update: false,
        delete: false,
        approve: false,
        scope: "global",
      };
      const override = getFlagOverrideForModule([targetKey], moduleId);
      if (override) Object.assign(base, override);
    } else {
      base = { ...getBasePermissions(targetKey as LoginRole, moduleId) };
    }

    const custom = customMatrix[moduleId]?.[targetKey];
    if (custom) {
      base = { ...base, ...custom };
    }
    return base;
  };

  const handleToggleFeature = (key: string) => {
    const nextFeatures = { ...featureFlags, [key]: !featureFlags[key] };
    setFeatureFlags(nextFeatures);
    toast.success(
      `Feature Flag for ${key.toUpperCase()} has been ${nextFeatures[key] ? "ENABLED" : "DISABLED"}!`
    );
  };

  const addWorkflowStep = (wfId: string) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id === wfId) {
          return { ...w, steps: [...w.steps, tempStep] };
        }
        return w;
      })
    );
    toast.success(`Added step "${tempStep}" to workflow.`);
  };

  const removeWorkflowStep = (wfId: string, idx: number) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id === wfId) {
          const nextSteps = [...w.steps];
          nextSteps.splice(idx, 1);
          return { ...w, steps: nextSteps };
        }
        return w;
      })
    );
    toast.success("Removed step from workflow.");
  };

  const createWorkflow = () => {
    if (!newWorkflowName.trim()) {
      toast.error("Please enter a workflow name.");
      return;
    }
    const newWf = {
      id: newWorkflowName.toLowerCase().replace(/\s+/g, "-"),
      name: newWorkflowName,
      steps: ["Faculty", "HOD (Department Head)"],
    };
    setWorkflows([...workflows, newWf]);
    setNewWorkflowName("");
    toast.success("New custom approval workflow created successfully!");
  };

  const filteredModules = ERP_MODULES.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEvaluatorResult = () => {
    if (calcModule in featureFlags && !featureFlags[calcModule]) {
      return { allowed: false, reason: "Module License Disabled (Feature Flag is OFF)" };
    }
    const base = getBasePermissions(calcRole, calcModule);
    let allowed = base[calcAction];
    let finalScope = base.scope;

    if (calcRole === "staff") {
      const override = getFlagOverrideForModule([calcPrivilege], calcModule);
      if (override) {
        if (override[calcAction] !== undefined) allowed = override[calcAction]!;
        if (override.scope) finalScope = override.scope;
      }
    }

    return {
      allowed,
      scope: finalScope,
      reason: allowed
        ? `Access granted under scope "${scopeLabels[finalScope]}".`
        : `Denied: ${calcRole} with privilege flag ${calcPrivilege} does not possess "${calcAction.toUpperCase()}" action permission on the ${calcModule} module.`,
    };
  };

  const calcResult = getEvaluatorResult();

  const mainContent = (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <SettingsIcon className="size-6" />
          </span>
          <div>
            <h1 className="font-display text-xl font-extrabold sm:text-2xl text-foreground">
              Super Admin Settings
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage security, change password, active sessions, preferences, and enterprise RBAC parameters.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 h-9 text-xs">
            <Download className="size-4" /> Export Config
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="security" className="space-y-6">
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="flex flex-nowrap sm:flex-wrap h-auto bg-card border border-border p-1 gap-1 min-w-max">
            <TabsTrigger value="security" className="gap-1.5 py-2 px-3 text-xs">
              <Key className="size-4" /> Security & Account
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-1.5 py-2 px-3 text-xs">
              <Palette className="size-4" /> Appearance & Preferences
            </TabsTrigger>
            <TabsTrigger value="rbac" className="gap-1.5 py-2 px-3 text-xs">
              <ShieldAlert className="size-4" /> Roles & Access Matrix
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-1.5 py-2 px-3 text-xs">
              <ToggleRight className="size-4" /> Licensing & Feature Flags
            </TabsTrigger>
            <TabsTrigger value="workflows" className="gap-1.5 py-2 px-3 text-xs">
              <GitBranch className="size-4" /> Approval Workflows
            </TabsTrigger>
            <TabsTrigger value="institution" className="gap-1.5 py-2 px-3 text-xs">
              <Building className="size-4" /> Institution Settings
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5 py-2 px-3 text-xs">
              <Clock className="size-4" /> System Audit Logs
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: SECURITY & ACCOUNT (Change Password, Sessions, Security Audit) */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* CHANGE PASSWORD PANEL */}
            <Panel
              title="Change Account Password"
              description="Update your password using strict bcrypt database verification."
            >
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 pt-1">
                {passError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="current-pass" className="text-xs font-semibold">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="current-pass"
                      type={showCurrentPass ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (passError) setPassError("");
                      }}
                      className="h-10 text-xs pr-10"
                      disabled={passSubmitting}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-pass" className="text-xs font-semibold">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-pass"
                      type={showNewPass ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passError) setPassError("");
                      }}
                      className="h-10 text-xs pr-10"
                      disabled={passSubmitting}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-pass" className="text-xs font-semibold">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-pass"
                    type={showNewPass ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passError) setPassError("");
                    }}
                    className="h-10 text-xs"
                    disabled={passSubmitting}
                    required
                  />
                </div>

                <div className="rounded-xl bg-muted/40 p-3 text-[0.68rem] text-muted-foreground space-y-1 border border-border/60">
                  <p className="font-semibold text-foreground">Password Policy Requirements:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Requires current password verification</li>
                    <li>Minimum 8 characters long</li>
                    <li>Must differ from current password</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={passSubmitting || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 gap-2 text-xs shadow-glow transition-all"
                >
                  {passSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" /> Update Password
                    </>
                  )}
                </Button>
              </form>
            </Panel>

            {/* ACTIVE SESSIONS PANEL */}
            <div className="space-y-6">
              <Panel
                title="Active Web Sessions"
                description="Manage authenticated sessions associated with your Super Admin account."
              >
                <div className="space-y-4 pt-1">
                  {loadingSessions ? (
                    <div className="py-6 text-center text-xs text-muted-foreground space-y-2">
                      <RefreshCw className="size-5 animate-spin mx-auto text-primary" />
                      <p>Fetching session data...</p>
                    </div>
                  ) : activeSessions.length === 0 ? (
                    <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Laptop className="size-5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">Current Browser Session</p>
                          <p className="text-[0.68rem] text-muted-foreground">Windows Desktop (Vite / Chrome) • IP 127.0.0.1</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.65rem]">
                        Current Session
                      </Badge>
                    </div>
                  ) : (
                    activeSessions.map((sess, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-card border border-border/80 shadow-sm flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <Laptop className="size-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-foreground">{sess.device}</p>
                              {sess.isCurrent && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.6rem]">
                                  Active Now
                                </Badge>
                              )}
                            </div>
                            <p className="text-[0.68rem] text-muted-foreground font-mono mt-0.5">
                              IP: {sess.ipAddress} • Logged in: {new Date(sess.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      disabled={revokingSessions}
                      onClick={handleRevokeOtherSessions}
                      className="w-full text-xs font-semibold h-10 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      {revokingSessions ? <Loader2 className="size-4 animate-spin" /> : <ShieldAlert className="size-4" />}
                      Sign Out Other Active Sessions
                    </Button>
                  </div>
                </div>
              </Panel>

              {/* RECENT SECURITY LOGS */}
              <Panel
                title="Account Security Activity"
                description="Live audit events captured for your Super Admin persona."
              >
                <div className="space-y-2 pt-1 max-h-60 overflow-y-auto">
                  {securityLogs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No security audit events captured yet.
                    </div>
                  ) : (
                    securityLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-foreground text-[0.72rem]">{log.action}</p>
                          <p className="text-[0.65rem] text-muted-foreground font-mono">
                            {log.timestamp || log.time} • IP: {log.ipAddress || "127.0.0.1"}
                          </p>
                        </div>
                        <Badge
                          variant={log.status === "Failed" || (log.status && log.status.includes("Denied")) ? "destructive" : "secondary"}
                          className="text-[0.6rem]"
                        >
                          {log.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: APPEARANCE & PREFERENCES */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* THEME SELECTION PANEL */}
            <Panel
              title="Appearance & Dark Mode"
              description="Customize your display theme and color mode preference."
            >
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => handleThemeChange("light")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center space-y-2 ${
                      currentTheme === "light"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/80 bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="mx-auto grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                      <Sun className="size-5" />
                    </div>
                    <span className="font-bold text-xs block">Light Mode</span>
                  </div>

                  <div
                    onClick={() => handleThemeChange("dark")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center space-y-2 ${
                      currentTheme === "dark"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/80 bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="mx-auto grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
                      <Moon className="size-5" />
                    </div>
                    <span className="font-bold text-xs block">Dark Mode</span>
                  </div>

                  <div
                    onClick={() => handleThemeChange("system")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center space-y-2 ${
                      currentTheme === "system"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/80 bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="mx-auto grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
                      <Monitor className="size-5" />
                    </div>
                    <span className="font-bold text-xs block">System Sync</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border space-y-2">
                  <Label className="text-xs font-semibold block">Accent Color Palette</Label>
                  <div className="flex gap-2.5">
                    {["#1d4ed8", "#4f46e5", "#06b6d4", "#10b981", "#ec4899"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="size-8 rounded-full border border-border flex items-center justify-center transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                        onClick={() => toast.success(`Accent color preference saved.`)}
                      >
                        {color === "#1d4ed8" && <Check className="size-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            {/* NOTIFICATION PREFERENCES PANEL */}
            <Panel
              title="Notification Preferences"
              description="Configure real system and security notification alerts."
            >
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Email Notifications</h4>
                    <p className="text-[0.7rem] text-muted-foreground">Receive daily administrative digest summaries by email.</p>
                  </div>
                  <Checkbox
                    checked={notifPrefs.emailNotifications}
                    onCheckedChange={() => handleToggleNotification("emailNotifications")}
                  />
                </div>

                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-foreground">Security Alerts</h4>
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[0.6rem]">Mandatory</Badge>
                    </div>
                    <p className="text-[0.7rem] text-muted-foreground">Mandatory alerts for password changes & security events.</p>
                  </div>
                  <Checkbox checked={true} disabled />
                </div>

                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Approval Workflow Notifications</h4>
                    <p className="text-[0.7rem] text-muted-foreground">Get notified when pending leave or purchase approvals require sign-off.</p>
                  </div>
                  <Checkbox
                    checked={notifPrefs.approvalNotifications}
                    onCheckedChange={() => handleToggleNotification("approvalNotifications")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">System Announcements</h4>
                    <p className="text-[0.7rem] text-muted-foreground">Receive infrastructure maintenance & deployment updates.</p>
                  </div>
                  <Checkbox
                    checked={notifPrefs.systemAnnouncements}
                    onCheckedChange={() => handleToggleNotification("systemAnnouncements")}
                  />
                </div>
              </div>
            </Panel>
          </div>
        </TabsContent>

        {/* TAB 3: ROLES & ACCESS MATRIX */}
        <TabsContent value="rbac" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Panel
                title="Module Access Matrix"
                description="Review and customize granular permissions across all login roles and responsibility privilege flags. Click cell checkboxes to toggle permissions."
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 border-b border-border/40 pb-4">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search modules..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-9 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Dept. Scope:</span>
                    <select
                      value={selectedDeptScope}
                      onChange={(e) => setSelectedDeptScope(e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                    >
                      <option value="all">All Departments</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto border border-border rounded-xl">
                  <Table className="min-w-[1000px]">
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="w-[180px] font-bold text-xs">MODULES</TableHead>
                        <TableHead className="text-center font-semibold text-xs">SUPER ADMIN</TableHead>
                        <TableHead className="text-center font-semibold text-xs">STAFF (DEFAULT)</TableHead>
                        <TableHead className="text-center font-semibold text-xs">STUDENT</TableHead>
                        <TableHead className="text-center font-semibold text-xs">PARENT</TableHead>
                        <TableHead className="text-center font-semibold text-xs">EXTERNAL USER</TableHead>
                        <TableHead className="text-center font-semibold text-xs">RESPONSIBILITY FLAG OVERRIDES</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredModules.map((mod) => {
                        const staffCell = getCellPerms(mod.id, "staff");
                        const studentCell = getCellPerms(mod.id, "student");
                        const parentCell = getCellPerms(mod.id, "parent");
                        const externalCell = getCellPerms(mod.id, "external-user");

                        const flagOverrides = RESPONSIBILITY_FLAGS.filter(
                          (f) => getFlagOverrideForModule([f.id], mod.id) !== null
                        );

                        return (
                          <TableRow key={mod.id} className="hover:bg-accent/10 transition-colors text-xs">
                            <TableCell className="font-semibold flex items-center gap-2 py-3.5">
                              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                                <mod.icon className="size-4" />
                              </span>
                              <span className="truncate">{mod.name}</span>
                            </TableCell>

                            <TableCell className="text-center">
                              <div className="flex flex-col gap-1 items-center justify-center">
                                <div className="flex gap-0.5 justify-center">
                                  <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200 border-none text-[0.6rem] px-1 font-bold">R</Badge>
                                  <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200 border-none text-[0.6rem] px-1 font-bold">C</Badge>
                                  <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200 border-none text-[0.6rem] px-1 font-bold">U</Badge>
                                  <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200 border-none text-[0.6rem] px-1 font-bold">D</Badge>
                                  <Badge className="bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-200 border-none text-[0.6rem] px-1 font-bold">A</Badge>
                                </div>
                                <span className="text-[0.6rem] text-muted-foreground uppercase font-mono">Scope: Global</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex flex-col gap-1.5 items-center justify-center">
                                <div className="flex gap-0.5 justify-center">
                                  <span onClick={() => handleTogglePerm(mod.id, "staff", "read")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${staffCell.read ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-muted text-muted-foreground border-border"}`}>R</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "staff", "create")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${staffCell.create ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted text-muted-foreground border-border"}`}>C</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "staff", "update")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${staffCell.update ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-muted text-muted-foreground border-border"}`}>U</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "staff", "delete")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${staffCell.delete ? "bg-red-50 border-red-200 text-red-700" : "bg-muted text-muted-foreground border-border"}`}>D</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "staff", "approve")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${staffCell.approve ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-muted text-muted-foreground border-border"}`}>A</span>
                                </div>
                                <span className="text-[0.6rem] text-muted-foreground uppercase font-mono">Scope: {scopeLabels[staffCell.scope]}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex flex-col gap-1.5 items-center justify-center">
                                <div className="flex gap-0.5 justify-center">
                                  <span onClick={() => handleTogglePerm(mod.id, "student", "read")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${studentCell.read ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-muted text-muted-foreground border-border"}`}>R</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "student", "create")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${studentCell.create ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted text-muted-foreground border-border"}`}>C</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "student", "update")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${studentCell.update ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-muted text-muted-foreground border-border"}`}>U</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "student", "delete")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${studentCell.delete ? "bg-red-50 border-red-200 text-red-700" : "bg-muted text-muted-foreground border-border"}`}>D</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "student", "approve")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${studentCell.approve ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-muted text-muted-foreground border-border"}`}>A</span>
                                </div>
                                <span className="text-[0.6rem] text-muted-foreground uppercase font-mono">Scope: {scopeLabels[studentCell.scope]}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex flex-col gap-1.5 items-center justify-center">
                                <div className="flex gap-0.5 justify-center">
                                  <span onClick={() => handleTogglePerm(mod.id, "parent", "read")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${parentCell.read ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-muted text-muted-foreground border-border"}`}>R</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "parent", "create")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${parentCell.create ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted text-muted-foreground border-border"}`}>C</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "parent", "update")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${parentCell.update ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-muted text-muted-foreground border-border"}`}>U</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "parent", "delete")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${parentCell.delete ? "bg-red-50 border-red-200 text-red-700" : "bg-muted text-muted-foreground border-border"}`}>D</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "parent", "approve")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${parentCell.approve ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-muted text-muted-foreground border-border"}`}>A</span>
                                </div>
                                <span className="text-[0.6rem] text-muted-foreground uppercase font-mono">Scope: {scopeLabels[parentCell.scope]}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex flex-col gap-1.5 items-center justify-center">
                                <div className="flex gap-0.5 justify-center">
                                  <span onClick={() => handleTogglePerm(mod.id, "external-user", "read")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${externalCell.read ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-muted text-muted-foreground border-border"}`}>R</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "external-user", "create")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${externalCell.create ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted text-muted-foreground border-border"}`}>C</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "external-user", "update")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${externalCell.update ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-muted text-muted-foreground border-border"}`}>U</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "external-user", "delete")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${externalCell.delete ? "bg-red-50 border-red-200 text-red-700" : "bg-muted text-muted-foreground border-border"}`}>D</span>
                                  <span onClick={() => handleTogglePerm(mod.id, "external-user", "approve")} className={`cursor-pointer border rounded text-[0.65rem] font-bold px-1 select-none ${externalCell.approve ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-muted text-muted-foreground border-border"}`}>A</span>
                                </div>
                                <span className="text-[0.6rem] text-muted-foreground uppercase font-mono">Scope: {scopeLabels[externalCell.scope]}</span>
                              </div>
                            </TableCell>

                            <TableCell className="w-[220px]">
                              {flagOverrides.length > 0 ? (
                                <div className="flex flex-col gap-1 max-w-[200px]">
                                  {flagOverrides.slice(0, 2).map((f) => {
                                    const cell = getCellPerms(mod.id, f.id, true);
                                    return (
                                      <div key={f.id} className="flex justify-between items-center bg-accent/40 rounded px-1.5 py-0.5 text-[0.65rem]">
                                        <span className="font-semibold truncate w-24">{f.label}</span>
                                        <div className="flex gap-0.5">
                                          {cell.read && <span className="text-[0.6rem] text-blue-700 font-bold">R</span>}
                                          {cell.create && <span className="text-[0.6rem] text-emerald-700 font-bold">C</span>}
                                          {cell.update && <span className="text-[0.6rem] text-amber-700 font-bold">U</span>}
                                          {cell.delete && <span className="text-[0.6rem] text-red-700 font-bold">D</span>}
                                          {cell.approve && <span className="text-[0.6rem] text-violet-700 font-bold">A</span>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-[0.65rem] text-muted-foreground font-mono">Default Staff Rules</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Panel>
            </div>

            <div className="space-y-6">
              <Panel
                title="Formula Evaluator"
                description="Interactively calculate permissions based on the enterprise RBAC engine formula."
              >
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-4">
                  <div className="text-center pb-2 border-b border-border">
                    <h4 className="text-xs font-semibold tracking-wider uppercase text-primary mb-1">
                      Permission Engine Formula
                    </h4>
                    <p className="font-mono text-xs font-bold text-foreground">
                      Role + Privilege + Module + Action + Scope
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-muted-foreground block mb-1">1. Login Role</label>
                      <select
                        value={calcRole}
                        onChange={(e) => setCalcRole(e.target.value as LoginRole)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3"
                      >
                        {Object.keys(roleProfiles).map((r) => (
                          <option key={r} value={r}>
                            {roleProfiles[r as LoginRole].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {calcRole === "staff" && (
                      <div>
                        <label className="text-muted-foreground block mb-1">2. Responsibility Privilege Flag</label>
                        <select
                          value={calcPrivilege}
                          onChange={(e) => setCalcPrivilege(e.target.value)}
                          className="w-full h-9 rounded-md border border-input bg-background px-3"
                        >
                          {RESPONSIBILITY_FLAGS.map((f) => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="text-muted-foreground block mb-1">3. Module Target</label>
                      <select
                        value={calcModule}
                        onChange={(e) => setCalcModule(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3"
                      >
                        {ERP_MODULES.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-muted-foreground block mb-1">4. Action Required</label>
                      <select
                        value={calcAction}
                        onChange={(e) => setCalcAction(e.target.value as typeof calcAction)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3"
                      >
                        <option value="read">Read (R)</option>
                        <option value="create">Create (C)</option>
                        <option value="update">Update (U)</option>
                        <option value="delete">Delete (D)</option>
                        <option value="approve">Approve (A)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Evaluation Status:</span>
                      <Badge
                        variant={calcResult.allowed ? "default" : "destructive"}
                        className={calcResult.allowed ? "bg-emerald-600 hover:bg-emerald-600" : ""}
                      >
                        {calcResult.allowed ? "ACCESS GRANTED" : "ACCESS DENIED"}
                      </Badge>
                    </div>
                    <p className="text-[0.7rem] text-muted-foreground bg-background p-2.5 rounded-lg border border-border">
                      {calcResult.reason}
                    </p>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: LICENSING & FEATURE FLAGS */}
        <TabsContent value="features" className="space-y-4">
          <Panel
            title="SaaS Licensing & Feature Flags"
            description="Institutions can dynamically license modules and activate/deactivate enterprise capabilities. Disabling a feature hides corresponding sidebar elements, suppresses AI actions, and revokes granular API access immediately."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
              {[
                { key: "aiAssistant", name: "AI Copilot & Assistant", desc: "Interactive floating assistant, predictive student risk insights, and calendar alerts.", category: "Intelligence" },
                { key: "analytics", name: "Performance Analytics", desc: "Accreditation readiness scorecards, department progression charts, and KPIs.", category: "Intelligence" },
                { key: "finance", name: "Finance ERP Module", desc: "Fee registers, online merchant invoice generation, scholarship allocations, and ledgers.", category: "Operations" },
                { key: "hostel", name: "Hostel Management Module", desc: "Room allocation workflows, Warden control, student mess lists, and occupancy registers.", category: "Operations" },
                { key: "transport", name: "Transport & Routing Module", desc: "Bus passes issuance, route grids, GPS tracking, and fleet drivers profiles.", category: "Operations" },
                { key: "placement", name: "Placement & Recruitment Module", desc: "Student resumes pipeline, recruiters dashboard, drive listings, and job offer statistics.", category: "Career Services" },
                { key: "library", name: "Digital Library Module", desc: "Book cataloging indexing, physical issue & return registers, fines, and pdf libraries.", category: "Academic Support" },
              ].map((item) => {
                const enabled = featureFlags[item.key] !== false;
                return (
                  <div key={item.key} className="border border-border rounded-xl p-4 bg-card shadow-sm flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-foreground">{item.name}</h4>
                        <Badge variant="secondary" className="text-[0.6rem]">{item.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/40 pt-3">
                      <span className="text-xs font-medium font-mono text-muted-foreground">
                        Status: {enabled ? "Active License" : "Disabled"}
                      </span>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`feat-${item.key}`}
                          checked={enabled}
                          onCheckedChange={() => handleToggleFeature(item.key)}
                        />
                        <label htmlFor={`feat-${item.key}`} className="text-xs font-semibold cursor-pointer select-none">
                          Licensed
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </TabsContent>

        {/* TAB 5: APPROVAL WORKFLOWS */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Panel
                title="Configurable Approval Engine Workflows"
                description="Design multi-step sequential approval chains for institutional processes. Define the order of responsibility roles who must sign-off on transactions."
              >
                <div className="space-y-6">
                  {workflows.map((wf) => (
                    <div key={wf.id} className="border border-border rounded-xl p-4 bg-card space-y-4 shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                          <GitBranch className="size-4" /> {wf.name}
                        </h4>
                        <Badge variant="outline" className="font-mono text-[0.65rem]">ID: {wf.id}</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 py-2">
                        {wf.steps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="bg-primary/10 text-primary border border-primary/20 rounded-lg py-1.5 px-3 text-xs font-medium flex items-center gap-1.5">
                              <span className="size-4 rounded-full bg-primary/20 text-primary text-[0.6rem] font-bold grid place-items-center">
                                {idx + 1}
                              </span>
                              {step}
                              <button
                                onClick={() => removeWorkflowStep(wf.id, idx)}
                                className="text-red-500 hover:text-red-700 ml-1.5 transition-colors"
                                title="Remove step"
                                disabled={wf.steps.length <= 1}
                              >
                                &times;
                              </button>
                            </div>
                            {idx < wf.steps.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground" />}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                        <select
                          value={tempStep}
                          onChange={(e) => setTempStep(e.target.value)}
                          className="h-8 rounded-md border border-input bg-background px-3 text-xs"
                        >
                          <option value="Faculty Advisor">Faculty Advisor</option>
                          <option value="HOD (Department Head)">HOD (Department Head)</option>
                          <option value="Dean">Dean</option>
                          <option value="Principal">Principal</option>
                          <option value="Exam Controller">Exam Controller</option>
                          <option value="Finance Officer">Finance Officer</option>
                          <option value="HR Manager">HR Manager</option>
                          <option value="Super Admin">Super Admin</option>
                        </select>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => addWorkflowStep(wf.id)}>
                          <Plus className="size-3.5" /> Add Step
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="space-y-6">
              <Panel title="Create Custom Workflow" description="Register a new transaction type and its approval path.">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold block">Workflow Name</label>
                    <Input
                      placeholder="e.g. Hostels Gatepass Approval"
                      value={newWorkflowName}
                      onChange={(e) => setNewWorkflowName(e.target.value)}
                    />
                  </div>
                  <Button onClick={createWorkflow} className="w-full bg-brand-gradient shadow-glow text-xs">
                    Create Workflow Chain
                  </Button>
                </div>
              </Panel>
            </div>
          </div>
        </TabsContent>

        {/* TAB 6: INSTITUTION SETTINGS */}
        <TabsContent value="institution" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Campus Details" description="Configure campus identities and addresses.">
              <div className="space-y-4">
                {[
                  { name: "Main Campus", city: "Hyderabad, TS", code: "MC-HYD", active: true },
                  { name: "City Campus", city: "Bangalore, KA", code: "CC-BLR", active: true },
                  { name: "Research Park", city: "Visakhapatnam, AP", code: "RP-VSP", active: false },
                ].map((campus, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-semibold">{campus.name}</h4>
                      <p className="text-xs text-muted-foreground">{campus.city} | Code: {campus.code}</p>
                    </div>
                    <Badge variant={campus.active ? "secondary" : "outline"}>
                      {campus.active ? "Active" : "Archived"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Academic Calendar" description="Configure semesters, terms and holidays.">
              <div className="space-y-3">
                <div className="rounded-xl border border-border p-3 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-semibold">Odd Semester 2026-27</h4>
                    <p className="text-muted-foreground mt-0.5">Aug 01, 2026 - Dec 15, 2026</p>
                  </div>
                  <Badge>Ongoing</Badge>
                </div>
                <div className="rounded-xl border border-border p-3 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-semibold">Even Semester 2026-27</h4>
                    <p className="text-muted-foreground mt-0.5">Jan 05, 2027 - May 20, 2027</p>
                  </div>
                  <Badge variant="outline">Scheduled</Badge>
                </div>
              </div>
            </Panel>
          </div>
        </TabsContent>

        {/* TAB 7: AUDIT LOGS */}
        <TabsContent value="audit" className="space-y-4">
          <Panel title="System Audit Logs" description="Traceable actions captured by the access control engine across all modules.">
            <div className="overflow-x-auto border border-border rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Timestamp</TableHead>
                    <TableHead className="text-xs">User / Actor</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Action / Module</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                        Loading live audit log stream...
                      </TableCell>
                    </TableRow>
                  ) : (
                    securityLogs.map((log, idx) => (
                      <TableRow key={idx} className="text-xs">
                        <TableCell className="font-mono text-muted-foreground">
                          {log.timestamp || log.time}
                        </TableCell>
                        <TableCell className="font-semibold">{log.actor || log.user}</TableCell>
                        <TableCell>{log.role}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === "Failed" || (log.status && log.status.includes("Denied")) ? "destructive" : "secondary"}>
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (!withLayout) {
    return mainContent;
  }

  return <DashboardLayout>{mainContent}</DashboardLayout>;
}
