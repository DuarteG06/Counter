"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * A round icon button that links to /auth
 */
export default function AuthIcon() {
  return (
    <Link href="/auth" passHref>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full p-2 hover:bg-gray-100 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
        aria-label="Sign in"
      >
        <User className="w-6 h-6 text-indigo-600" />
      </Button>
    </Link>
  );
}