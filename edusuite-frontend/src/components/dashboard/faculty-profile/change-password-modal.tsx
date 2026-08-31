import { useState } from "react";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import api from "@/lib/api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isMatching = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isValidLength = newPassword.length >= 8;
  const canSubmit = oldPassword.length > 0 && isValidLength && isMatching && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all required password fields.");
      toast.error("Please fill in all required password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match. Please verify both fields.");
      toast.error("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/change-password", {
        oldPassword,
        currentPassword: oldPassword,
        newPassword
      });

      if (res.status === 200 && res.data?.success !== false) {
        toast.success("Password changed successfully in Database!", {
          description: "Your new password is now active."
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrorMessage("");
        onOpenChange(false);
      } else {
        const errorText = res.data?.error || "Incorrect current password. Please verify and try again.";
        setErrorMessage(errorText);
        toast.error(errorText);
      }
    } catch (err: any) {
      const errorText = err?.response?.data?.error || "Incorrect current password. Please verify and try again.";
      setErrorMessage(errorText);
      toast.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg font-bold">
            <Lock className="size-5 text-indigo-600" /> Change Password
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update your account password. Secure passwords require at least 8 characters.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="old-pass" className="text-xs font-bold">Current Password</Label>
            <div className="relative">
              <Input
                id="old-pass"
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="••••••••"
                className="rounded-xl pr-10 text-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                title={showOld ? "Hide password" : "Show password"}
              >
                {showOld ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-pass" className="text-xs font-bold">New Password</Label>
              {newPassword.length > 0 && !isValidLength && (
                <span className="text-[0.68rem] text-rose-500 font-medium">Min 8 chars required</span>
              )}
            </div>
            <div className="relative">
              <Input
                id="new-pass"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="••••••••"
                className="rounded-xl pr-10 text-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                title={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pass" className="text-xs font-bold">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-pass"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="••••••••"
                className={`rounded-xl pr-10 text-xs ${
                  isMismatch ? "border-rose-500 focus-visible:ring-rose-500" : isMatching ? "border-emerald-500 focus-visible:ring-emerald-500" : ""
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                title={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {/* Real-time Match Validation Indicator */}
            {isMatching && (
              <p className="text-[0.7rem] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                <CheckCircle2 className="size-3.5" /> New password and confirm password match
              </p>
            )}
            {isMismatch && (
              <p className="text-[0.7rem] font-bold text-rose-600 flex items-center gap-1 mt-1">
                <XCircle className="size-3.5" /> Passwords do not match
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setErrorMessage("");
                onOpenChange(false);
              }}
              className="rounded-xl cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-brand-gradient shadow-glow cursor-pointer text-xs text-white font-bold disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
