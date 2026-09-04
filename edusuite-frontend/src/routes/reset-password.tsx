import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — EduSuite Pro" },
      {
        name: "description",
        content: "Set a new password for your EduSuite Pro account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const search: Record<string, any> = useSearch({ strict: false });
  const navigate = useNavigate();
  const token = (search?.token as string) || "";

  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [targetEmail, setTargetEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setVerifyingToken(false);
      setTokenValid(false);
      setTokenError("Missing password reset token. Please request a new link.");
      return;
    }

    let isMounted = true;
    async function verifyToken() {
      try {
        const response = await api.post("/auth/verify-reset-token", { token });
        if (isMounted) {
          if (response.data?.valid) {
            setTokenValid(true);
            setTargetEmail(response.data.email || "");
          } else {
            setTokenValid(false);
            setTokenError(response.data?.error || "This password reset link is invalid or has expired.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setTokenValid(false);
          setTokenError(err?.response?.data?.error || "This password reset link is invalid or has expired.");
        }
      } finally {
        if (isMounted) setVerifyingToken(false);
      }
    }

    verifyToken();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newPassword) {
      setFormError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });

      setIsSuccess(true);
      toast.success("Your password has been reset successfully.");
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || "Failed to reset password. Please try again.";
      setFormError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle={
        isSuccess
          ? "Your password has been updated."
          : targetEmail
          ? `Create a new password for ${targetEmail}`
          : "Create a new secure password for your EduSuite Pro account."
      }
      footer={
        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            <ArrowLeft className="size-3.5" /> Back to Login
          </Link>
        </div>
      }
    >
      {verifyingToken ? (
        <div className="py-10 text-center space-y-3">
          <Loader2 className="size-7 animate-spin mx-auto text-primary" />
          <p className="text-xs text-muted-foreground font-medium">Validating secure reset token...</p>
        </div>
      ) : !tokenValid && !isSuccess ? (
        <div className="space-y-5 rounded-2xl bg-destructive/10 border border-destructive/20 p-5 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">Invalid or Expired Link</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {tokenError || "This password reset link is invalid or has expired."}
            </p>
          </div>
          <Button
            className="w-full text-xs font-semibold h-10 bg-primary text-primary-foreground gap-2"
            onClick={() => navigate({ to: "/forgot-password" })}
          >
            Request New Reset Link
          </Button>
        </div>
      ) : isSuccess ? (
        <div className="space-y-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">Password Reset Successfully</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
          </div>
          <Button
            className="w-full text-xs font-semibold h-11 bg-primary text-primary-foreground shadow-glow"
            onClick={() => navigate({ to: "/login" })}
          >
            Back to Login &rarr;
          </Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          {formError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* NEW PASSWORD */}
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-xs font-semibold">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (formError) setFormError("");
                }}
                disabled={isSubmitting}
                className="h-11 rounded-xl pl-9 pr-10 text-xs"
                required
              />
              <KeyRound className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* CONFIRM NEW PASSWORD */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-xs font-semibold">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formError) setFormError("");
                }}
                disabled={isSubmitting}
                className="h-11 rounded-xl pl-9 pr-10 text-xs"
                required
              />
              <ShieldCheck className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 p-3 text-[0.68rem] text-muted-foreground space-y-1 border border-border/60">
            <p className="font-semibold text-foreground">Password requirements:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Minimum 6 characters long</li>
              <li>Must match confirm password input</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !newPassword || !confirmPassword}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-xl gap-2 text-xs shadow-glow transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
