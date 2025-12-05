'use client';
import React, { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

function Provider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { sessionId } = useAuth();
  const hasWelcomedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || !sessionId || hasWelcomedRef.current) return;

    const storageKey = `welcome_shown_${sessionId}`;
    const alreadyShown = typeof window !== 'undefined' ? sessionStorage.getItem(storageKey) : '1';
    if (alreadyShown) {
      hasWelcomedRef.current = true;
      return;
    }

    (async () => {
      const name = user.firstName || user.fullName || 'there';

      // call server action / api route for upsert
      await fetch('/api/upsert-user', {
        method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
        body: JSON.stringify({
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          imageUrl: user.imageUrl,
        }),
      });

         hasWelcomedRef.current = true;
      sessionStorage.setItem(storageKey, '1');
    })();
  }, [isLoaded, user, sessionId]);

  return <>{children}</>;
}

export default Provider;
