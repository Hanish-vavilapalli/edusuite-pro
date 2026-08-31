import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import api from "@/lib/api";

import {
  roleProfiles,
  type LoginRole,
  type ExternalPersona,
  type DepartmentCode,
} from "@/config/roles";

const ROLE_STORAGE_KEY = "edusuite.demo-role";
const FLAGS_STORAGE_KEY = "edusuite.demo-flags";
const DEPT_STORAGE_KEY = "edusuite.demo-dept";
const PERSONA_STORAGE_KEY = "edusuite.demo-persona";
const FEATURES_STORAGE_KEY = "edusuite.demo-features";

export const defaultFeatureFlags = {
  aiAssistant: true,
  analytics: true,
  finance: true,
  hostel: true,
  transport: true,
  placement: true,
  library: true,
};

import { canAccessModule as checkModuleAccess, canAccessRoute as checkRouteAccess, type PermissionAction } from "@/lib/permissions";

interface RoleContextValue {
  role: LoginRole;
  setRole: (role: LoginRole) => void;
  profile: Omit<(typeof roleProfiles)[LoginRole], "flags"> & {
    flags: string[];
    department: DepartmentCode | undefined;
    externalPersona: ExternalPersona | undefined;
    featureFlags: Record<string, boolean>;
    personaName: string;
    personaMeta: string;
  };
  flags: string[];
  setFlags: (flags: string[]) => void;
  department: DepartmentCode | undefined;
  setDepartment: (dept: DepartmentCode | undefined) => void;
  externalPersona: ExternalPersona | undefined;
  setExternalPersona: (persona: ExternalPersona | undefined) => void;
  featureFlags: Record<string, boolean>;
  setFeatureFlags: (flags: Record<string, boolean>) => void;
  hasFlag: (flag: string) => boolean;
  canAccessModule: (moduleId: string, action?: PermissionAction) => boolean;
  canAccessRoute: (routeUrl: string) => boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<LoginRole>("super-admin");
  const [flags, setFlagsState] = useState<string[]>([]);
  const [department, setDepartmentState] = useState<DepartmentCode | undefined>(undefined);
  const [externalPersona, setExternalPersonaState] = useState<ExternalPersona | undefined>(
    undefined,
  );
  const [featureFlags, setFeatureFlagsState] =
    useState<Record<string, boolean>>(defaultFeatureFlags);

  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    avatarUrl?: string;
    department?: string;
    rollNumber?: string;
  } | null>(() => {
    if (typeof window !== "undefined") {
      const cached = window.localStorage.getItem("cms_user");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }
    return null;
  });

  // Load user details dynamically from backend database
  useEffect(() => {
    async function loadDbProfile() {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("token") || window.localStorage.getItem("cms_token") : null;
      if (token) {
        try {
          const res = await api.get("/api/auth/profile");
          if (res.status === 200 && res.data) {
            setUserProfile(res.data);
            window.localStorage.setItem("cms_user", JSON.stringify(res.data));
          }
        } catch (err) {
          console.error("Failed to fetch database user profile:", err);
        }
      }
    }
    loadDbProfile();
  }, [role]);

  // Initialize from storage or defaults
  useEffect(() => {
    const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY) as LoginRole | null;
    const activeRole = storedRole && storedRole in roleProfiles ? storedRole : "super-admin";
    setRoleState(activeRole);

    const defaultProfile = roleProfiles[activeRole];

    const storedFlags = window.localStorage.getItem(FLAGS_STORAGE_KEY);
    if (storedFlags) {
      try {
        setFlagsState(JSON.parse(storedFlags));
      } catch {
        setFlagsState(defaultProfile.flags);
      }
    } else {
      setFlagsState(defaultProfile.flags);
    }

    const storedDept = window.localStorage.getItem(DEPT_STORAGE_KEY) as DepartmentCode | null;
    setDepartmentState(storedDept || defaultProfile.department);

    const storedPersona = window.localStorage.getItem(
      PERSONA_STORAGE_KEY,
    ) as ExternalPersona | null;
    setExternalPersonaState(storedPersona || defaultProfile.externalPersona);

    const storedFeatures = window.localStorage.getItem(FEATURES_STORAGE_KEY);
    if (storedFeatures) {
      try {
        setFeatureFlagsState({ ...defaultFeatureFlags, ...JSON.parse(storedFeatures) });
      } catch {
        setFeatureFlagsState(defaultFeatureFlags);
      }
    } else {
      setFeatureFlagsState(defaultFeatureFlags);
    }
  }, []);

  const setRole = (nextRole: LoginRole) => {
    setRoleState(nextRole);
    window.localStorage.setItem(ROLE_STORAGE_KEY, nextRole);

    // Reset flags, department, and persona to defaults for the selected role
    const defaultProfile = roleProfiles[nextRole];
    setFlagsState(defaultProfile.flags);
    window.localStorage.setItem(FLAGS_STORAGE_KEY, JSON.stringify(defaultProfile.flags));

    setDepartmentState(defaultProfile.department);
    if (defaultProfile.department) {
      window.localStorage.setItem(DEPT_STORAGE_KEY, defaultProfile.department);
    } else {
      window.localStorage.removeItem(DEPT_STORAGE_KEY);
    }

    setExternalPersonaState(defaultProfile.externalPersona);
    if (defaultProfile.externalPersona) {
      window.localStorage.setItem(PERSONA_STORAGE_KEY, defaultProfile.externalPersona);
    } else {
      window.localStorage.removeItem(PERSONA_STORAGE_KEY);
    }
  };

  const setFlags = (nextFlags: string[]) => {
    setFlagsState(nextFlags);
    window.localStorage.setItem(FLAGS_STORAGE_KEY, JSON.stringify(nextFlags));
  };

  const setDepartment = (nextDept: DepartmentCode | undefined) => {
    setDepartmentState(nextDept);
    if (nextDept) {
      window.localStorage.setItem(DEPT_STORAGE_KEY, nextDept);
    } else {
      window.localStorage.removeItem(DEPT_STORAGE_KEY);
    }
  };

  const setExternalPersona = (nextPersona: ExternalPersona | undefined) => {
    setExternalPersonaState(nextPersona);
    if (nextPersona) {
      window.localStorage.setItem(PERSONA_STORAGE_KEY, nextPersona);
    } else {
      window.localStorage.removeItem(PERSONA_STORAGE_KEY);
    }
  };

  const setFeatureFlags = (nextFeatures: Record<string, boolean>) => {
    setFeatureFlagsState(nextFeatures);
    window.localStorage.setItem(FEATURES_STORAGE_KEY, JSON.stringify(nextFeatures));
  };

  const hasFlag = (flag: string) => {
    return role === "super-admin" || flags.includes(flag);
  };

  const profile = useMemo(() => {
    const baseProfile = roleProfiles[role];
    const initials = userProfile
      ? userProfile.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : baseProfile?.initials || "U";

    return {
      ...baseProfile,
      rollNumber: userProfile?.rollNumber || (role === "student" ? "22CS101" : "FAC-EC-6"),
      role,
      flags,
      department,
      externalPersona,
      featureFlags,
      initials,
      // Dynamic adjustments based on active settings
      personaName: userProfile ? userProfile.name : (
        role === "external-user" && externalPersona
          ? externalPersona === "recruiter"
            ? "David Miller"
            : externalPersona === "applicant"
              ? "John Doe"
              : externalPersona === "alumni"
                ? "Sarah Jenkins"
                : externalPersona === "vendor"
                  ? "Robert Chen"
                  : "Prof. Alan Turing"
          : baseProfile?.personaName || "User"
      ),
      personaMeta: userProfile
        ? (userProfile.rollNumber
            ? `${role.toUpperCase()} - Roll No. ${userProfile.rollNumber}`
            : userProfile.department
            ? `${role.toUpperCase()} - ${userProfile.department} Department`
            : `${role.toUpperCase()} - Control Console`)
        : (
          role === "external-user" && externalPersona
            ? externalPersona === "recruiter"
              ? "Campus Recruiter (Google)"
              : externalPersona === "applicant"
                ? "B.Tech Admissions Applicant"
                : externalPersona === "alumni"
                  ? "Alumni - Batch of 2022"
                  : externalPersona === "vendor"
                    ? "Cafeteria Services Vendor"
                    : "Guest Speaker / Professor"
            : role === "staff" && department
              ? `Faculty - ${department} Department`
              : baseProfile?.personaMeta || "Logged in User"
        ),
    };
  }, [role, flags, department, externalPersona, featureFlags, userProfile]);

  const canAccessModule = (moduleId: string, action: PermissionAction = "read") => {
    return checkModuleAccess({ role, flags, department, externalPersona, featureFlags }, moduleId, action);
  };

  const canAccessRoute = (routeUrl: string) => {
    return checkRouteAccess({ role, flags, department, externalPersona, featureFlags }, routeUrl);
  };

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      setRole,
      profile,
      flags,
      setFlags,
      department,
      setDepartment,
      externalPersona,
      setExternalPersona,
      featureFlags,
      setFeatureFlags,
      hasFlag,
      canAccessModule,
      canAccessRoute,
    }),
    [role, profile, flags, department, externalPersona, featureFlags],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
