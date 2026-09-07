import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/student/login")({
  head: () => ({
    meta: [
      { title: "Student Portal Login — CampusStay Hostel" },
      {
        name: "description",
        content: "Secure student authentication for CampusStay Hostel ERP and academic workspace.",
      },
    ],
  }),
  component: StudentLoginPage,
});

function StudentLoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("23341A4219");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast.error("Please enter both Student ID and Password.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Authenticating student session...");

    try {
      const res = await fetch("http://localhost:5000/api/student/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok && data.token) {
        localStorage.setItem("student_token", data.token);
        localStorage.setItem("token", data.token);
        toast.success(`Welcome, ${data.student?.name || "Student"}!`);

        // Try opening in new tab per specification
        try {
          const newTab = window.open("/student/dashboard", "_blank");
          if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
            // Popup blocked: fallback to in-app navigation
            navigate({ to: "/student/dashboard" });
          } else {
            // Also navigate current tab or show success state
            navigate({ to: "/student/dashboard" });
          }
        } catch {
          navigate({ to: "/student/dashboard" });
        }
      } else {
        toast.error(data.error || "Authentication failed. Please verify credentials.");
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Failed to connect to backend server. Is it running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (roll: string, pass: string, name: string) => {
    setIdentifier(roll);
    setPassword(pass);
    toast.info(`Filled credentials for ${name}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100 font-sans">
      {/* Background Glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-xl shadow-emerald-900/40 text-white mb-2">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Student Portal Login
          </h1>
          <p className="text-xs text-slate-400">
            Sign in with your College ID or JNTU Roll Number to access your personalized hostel dashboard.
          </p>
        </div>

        {/* Login Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl space-y-5">
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">
                Student Email / First Name / Roll No
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. vishnu@vignan_student.edu.in, Vishnu, or 23341A4219"
                  required
                  className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 pl-10 text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-emerald-400 font-semibold cursor-pointer hover:underline">
                  Default: password123
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (default: password123)"
                  required
                  className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 pl-10 text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Student Portal"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 text-center tracking-wider">
              Quick One-Click Demo Exam Students (878 Total Available)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials("23NM1A4301", "password123", "Student 23NM1A4301 (Room A01 - CAI)")}
                className="p-2 rounded-xl border border-slate-800 bg-slate-800/50 hover:border-emerald-500/40 hover:bg-slate-800 text-left transition-all text-[11px]"
              >
                <p className="font-bold text-white truncate">Room A01 (CAI)</p>
                <p className="font-mono text-[10px] text-emerald-400 truncate">23NM1A4301</p>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("23NM1A0401", "password123", "Student 23NM1A0401 (Room A01 - ECE)")}
                className="p-2 rounded-xl border border-slate-800 bg-slate-800/50 hover:border-purple-500/40 hover:bg-slate-800 text-left transition-all text-[11px]"
              >
                <p className="font-bold text-white truncate">Room A01 (ECE)</p>
                <p className="font-mono text-[10px] text-purple-400 truncate">23NM1A0401</p>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("23NM1A0501", "password123", "Student 23NM1A0501 (Room A21 - CSE)")}
                className="p-2 rounded-xl border border-slate-800 bg-slate-800/50 hover:border-sky-500/40 hover:bg-slate-800 text-left transition-all text-[11px]"
              >
                <p className="font-bold text-white truncate">Room A21 (CSE)</p>
                <p className="font-mono text-[10px] text-sky-400 truncate">23NM1A0501</p>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("23NM1A1201", "password123", "Student 23NM1A1201 (Room B25 - IT)")}
                className="p-2 rounded-xl border border-slate-800 bg-slate-800/50 hover:border-amber-500/40 hover:bg-slate-800 text-left transition-all text-[11px]"
              >
                <p className="font-bold text-white truncate">Room B25 (IT)</p>
                <p className="font-mono text-[10px] text-amber-400 truncate">23NM1A1201</p>
              </button>
            </div>
          </div>
        </div>

        {/* Back to main portal link */}
        <div className="text-center text-xs text-slate-400">
          Staff or Warden?{" "}
          <Link to="/login" className="text-emerald-400 font-bold hover:underline">
            College Role Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
