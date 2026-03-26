import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-77px)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {children}
    </main>
  );
}
