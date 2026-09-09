import React, { useState, useEffect } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/context/role-context";
import api from "@/lib/api";

interface HodIdentityScopeCardProps {
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
  dbConnected?: boolean;
  departmentCode?: string;
  departmentName?: string;
}

const DEPARTMENT_FULL_NAMES: Record<string, string> = {
  CSE: "Computer Science & Engineering",
  ECE: "Electronics & Communication Engineering",
  EEE: "Electrical & Electronics Engineering",
  ME: "Mechanical Engineering",
  MECHANICAL: "Mechanical Engineering",
  CIVIL: "Civil Engineering",
  CE: "Civil Engineering",
  IT: "Information Technology",
  "AI&DS": "Artificial Intelligence & Data Science",
  AIDS: "Artificial Intelligence & Data Science",
  "AI&ML": "Artificial Intelligence & Machine Learning",
  AIML: "Artificial Intelligence & Machine Learning",
  MBA: "Master of Business Administration",
};

export function HodIdentityScopeCard({
  onRefresh,
  isRefreshing = false,
  dbConnected = true,
  departmentCode,
  departmentName,
}: HodIdentityScopeCardProps) {
  const { profile, role, flags } = useRole();
  const [healthStatus, setHealthStatus] = useState<boolean>(dbConnected);
  const isHodUser = role === "hod" || flags?.includes("isHod");
  const roleTitle = isHodUser ? "Head of Department (HOD)" : profile.personaRole || "Staff";

  const deptCode = (departmentCode || profile.department || "CSE").toUpperCase();
  const resolvedDeptName =
    departmentName ||
    profile.departmentName ||
    DEPARTMENT_FULL_NAMES[deptCode] ||
    `${deptCode} Department`;

  const activeEmpId =
    (profile as any).rollNumber ||
    (profile as any).employeeId ||
    `HOD-${deptCode}`;

  const rawName = profile.personaName || profile.name || "Dr. S. K. Gupta";
  const cleanUserName = rawName.replace(/\s*\([^)]*\)/g, "").trim();
  const displayName = isHodUser ? `${cleanUserName} (HOD ${deptCode})` : cleanUserName;

  const initials =
    profile.initials ||
    cleanUserName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) ||
    "HD";

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good Morning";
    if (hrs < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const checkHealth = async () => {
    try {
      const res = await api.get("/api/health");
      setHealthStatus(res.status === 200 && res.data?.status === "OK");
    } catch {
      setHealthStatus(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleRefreshClick = async () => {
    await checkHealth();
    if (onRefresh) {
      await onRefresh();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 text-slate-50 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                healthStatus
                  ? "bg-slate-800/80 border border-slate-700 text-slate-300"
                  : "bg-rose-950/80 border border-rose-800 text-rose-300"
              }`}
            >
              <Activity
                className={`size-3.5 ${
                  healthStatus ? "text-emerald-400 animate-pulse" : "text-rose-400"
                }`}
              />
              {healthStatus ? "PostgreSQL Database Connected" : "Database Connection Error"}
            </span>

            {onRefresh && (
              <button
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-700/60 px-3 py-1 text-xs font-medium text-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                title="Refresh real-time data from database"
              >
                <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
            )}
          </div>

          <div>
            <h2 className="font-display text-2xl font-extrabold md:text-3xl tracking-tight text-white">
              {getGreeting()}, {displayName}
            </h2>
            <p className="mt-1 text-sm text-slate-400 font-medium">
              {resolvedDeptName} &middot; ID: {activeEmpId}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Badge className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-1 px-3 rounded-xl font-bold">
              {roleTitle}
            </Badge>
            <Badge className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-1 px-3 rounded-xl font-bold">
              {deptCode} Department
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
          <div className="size-12 rounded-xl bg-indigo-600 text-white font-black text-lg grid place-items-center uppercase">
            {initials}
          </div>
          <div>
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              AUTHENTICATED SCOPE
            </h4>
            <p className="text-sm font-black text-white">{resolvedDeptName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
