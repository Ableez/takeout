"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";

export function UserSync() {
  const { user, isLoaded } = useUser();
  const getOrCreateUser = useMutation(api.users.getOrCreate);

  useEffect(() => {
    if (isLoaded && user) {
      void getOrCreateUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? undefined,
      });
    }
  }, [isLoaded, user, getOrCreateUser]);

  return null;
}
