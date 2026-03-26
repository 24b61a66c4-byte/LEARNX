import Link from "next/link";

import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="space-y-5">
      <AuthForm mode="login" />
      <p className="text-center text-sm text-slate-600">
        New here?{" "}
        <Link className="font-semibold text-teal-700" href="/signup">
          Create an account
        </Link>
      </p>
    </div>
  );
}
