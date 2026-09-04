import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password? — EduSuite Pro" },
      {
        name: "description",
        content: "Request a secure password reset link for your EduSuite Pro account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/forgot-password", { email: email.trim() });
      setIsSuccess(true);
      if (response.data?.devResetUrl) {
        setDevResetUrl(response.data.devResetUrl);
      }
      toast.success("Password reset request processed.");
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || "Unable to send reset instructions. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your registered email address and we'll send you instructions to reset your password."
      footer={
        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            <ArrowLeft className="size-3.5" /> Back to Login
          </Link>
        </div>
      }
    >
      {isSuccess ? (
        <div className="space-y-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">Reset Request Submitted</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If an account exists for <span className="font-semibold text-foreground">{email}</span>, a password reset link has been sent. Please check your inbox.
            </p>
          </div>

          {devResetUrl && (
            <div className="pt-2 border-t border-emerald-500/20 space-y-2">
              <span className="text-[0.68rem] font-mono text-emerald-700 dark:text-emerald-300 font-bold block uppercase tracking-wider">
                [DEV RESET URL GENERATED]
              </span>
              <a
                href={devResetUrl}
                className="inline-block text-xs font-bold text-primary underline break-all bg-background px-3 py-2 rounded-xl border border-border"
              >
                Proceed to Reset Password Page &rarr;
              </a>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full text-xs font-semibold h-10 mt-2"
            onClick={() => {
              setIsSuccess(false);
              setEmail("");
              setDevResetUrl(null);
            }}
          >
            Send Another Reset Link
          </Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="text-xs font-semibold">
              Email Address
            </Label>
            <div className="relative">
              <Input
                id="reset-email"
                type="text"
                placeholder="Enter your registered email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="h-11 rounded-xl pl-9 text-xs"
                required
              />
              <Mail className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-xl gap-2 text-xs shadow-glow transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
