import Link from "next/link";

import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="space-y-5">
      <AuthForm mode="signup" />
      <p className="text-center text-sm text-slate-600">
        Already have access?{" "}
        <Link className="font-semibold text-teal-700" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
