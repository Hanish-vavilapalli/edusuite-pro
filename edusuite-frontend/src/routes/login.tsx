import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, AlertCircle, ArrowRight, Loader2, ShieldCheck, LayoutDashboard, Building2 } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { brand } from "@/config/branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRole } from "@/context/role-context";
import api from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Universal Login — EduSuite Pro" },
      {
        name: "description",
        content: "Universal role-based login for EduSuite Pro CMS ERP.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { setRole, setFlags, setDepartment, setExternalPersona } = useRole();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setAuthError("");
    setIsSubmitting(true);
    const loadingToast = toast.loading("Authenticating credentials...");

    try {
      if (step1CoreRole === "student") {
        const studentRes = await fetch("http://localhost:5000/api/student/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: email, password: password }),
        });
        const studentData = await studentRes.json();

        if (studentRes.ok && studentData.token) {
          localStorage.setItem("token", studentData.token);
          localStorage.setItem("cms_token", studentData.token);
          localStorage.setItem("student_token", studentData.token);

          setRole("student");
          setFlags(["student_portal", "hostel_student"]);
          if (studentData.student?.department) {
            setDepartment(studentData.student.department as any);
          }

          toast.dismiss(loadingToast);
          toast.success(`Welcome to Student Portal, ${studentData.student?.name || "Student"}!`);

          // Open Student Portal in new tab per specification
          try {
            const newTab = window.open("/student/dashboard", "_blank");
            if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
              navigate({ to: "/student/dashboard" });
            } else {
              navigate({ to: "/student/dashboard" });
            }
          } catch {
            navigate({ to: "/student/dashboard" });
          }
          return;
        } else {
          toast.dismiss(loadingToast);
          toast.error(studentData.error || "Student authentication failed.");
          return;
        }
      }

      const response = await api.post("/api/auth/login", {
        email: email.trim(),
        password: password,
      });

      if (response.status !== 200 || !response.data) {
        toast.dismiss(loadingToast);
        const errMsg = response.data?.error || "Invalid email or password.";
        setAuthError(errMsg);
        toast.error(errMsg);
        setIsSubmitting(false);
        return;
      }

      const { token, user } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("cms_token", token);
      }
      if (user) {
        localStorage.setItem("cms_user", JSON.stringify(user));
      }

      // Backend resolves role, flags, department, persona & target dashboard
      if (user.role) setRole(user.role);
      if (user.flags) setFlags(user.flags);
      if (user.department) setDepartment(user.department as any);

      toast.dismiss(loadingToast);
      toast.success(`Welcome back, ${user.name || "User"}!`);

      const targetDashboard = user.dashboard || "/dashboard";
      navigate({ to: targetDashboard as any });
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errMsg = err?.response?.data?.error || err?.message || "Unable to sign in right now. Please try again.";
      setAuthError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      {/* LEFT SIDE HERO PANEL */}
      <aside className="relative hidden overflow-hidden bg-brand-deep px-12 py-14 text-brand-deep-foreground lg:flex lg:flex-col lg:justify-between border-r border-border/20">
        <div>
          <Link to="/">
            <Logo tone="mono" showName nameClassName="text-brand-deep-foreground" />
          </Link>
          <div className="mt-16">
            <h2 className="max-w-md font-display text-4xl font-extrabold leading-tight">
              One Login.<br />Every Role.
            </h2>
            <p className="mt-4 max-w-md text-sm text-brand-deep-foreground/75 leading-relaxed">
              Secure access to your EduSuite Pro dashboard.
            </p>

            <ul className="mt-8 space-y-4 text-sm text-brand-deep-foreground/90">
              <li className="flex items-center gap-3 font-medium">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <ShieldCheck className="size-4" />
                </div>
                <span>Secure role-based access</span>
              </li>
              <li className="flex items-center gap-3 font-medium">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <LayoutDashboard className="size-4" />
                </div>
                <span>Personalized dashboards</span>
              </li>
              <li className="flex items-center gap-3 font-medium">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Building2 className="size-4" />
                </div>
                <span>Department-aware access</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-xs text-brand-deep-foreground/50">
          &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
        </div>
      </aside>

      {/* RIGHT SIDE UNIVERSAL LOGIN FORM */}
      <main className="flex items-center justify-center px-4 py-12 md:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Link to="/">
              <Logo showName />
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-extrabold tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your EduSuite Pro account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            {/* AUTH ERROR ALERT */}
            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="size-4 text-rose-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* EMAIL / USERNAME FIELD */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email Address or Username
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (authError) setAuthError("");
                }}
                disabled={isSubmitting}
                className="h-11 rounded-xl"
                required
              />
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-primary rounded-sm"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError("");
                  }}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-brand-gradient shadow-glow font-bold gap-2 cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          {/* HELP FOOTER */}
          <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/60">
            Need assistance?{" "}
            <Link to="/" className="font-semibold text-primary hover:underline">
              Contact IT Helpdesk
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
