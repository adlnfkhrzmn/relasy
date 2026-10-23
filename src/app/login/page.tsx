"use client";

import React from "react";
import { SignInCard } from "@/components/ui/travel-connect-signin-1";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#F7F6F1] transition-colors">
      <main className="w-full flex items-center justify-center">
        <SignInCard />
      </main>
    </div>
  );
}
