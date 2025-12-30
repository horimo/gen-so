"use client";

import { LoginGate } from "@/components/ui/LoginGate";
import { TerrariumLoader } from "@/components/ui/TerrariumLoader";
import { DepthCanvas } from "@/components/canvas/DepthCanvas";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function HomeContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setAuthError(decodeURIComponent(error));
      // URLからエラーパラメータを削除
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  if (loading) {
    return <TerrariumLoader />;
  }

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {user ? (
        <DepthCanvas />
      ) : (
        <LoginGate initialError={authError} />
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<TerrariumLoader />}>
      <HomeContent />
    </Suspense>
  );
}

