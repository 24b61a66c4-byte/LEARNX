import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="mx-auto min-h-[calc(100vh-77px)] max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex justify-center">
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </main>
  );
}
