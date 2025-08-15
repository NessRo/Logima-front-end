import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // or your router
import { useAuthStore } from "@/stores/auth";
import { authApi } from "@/lib/api";

export default function AuthCallback() {
  const navigate = useNavigate();
  const loginSuccess = useAuthStore((s) => s.loginSuccess);

  useEffect(() => {
    (async () => {
      try {
        const me = await authApi.me();           // { email }
        if (me?.email) loginSuccess(me.email);   // push into Zustand
      } finally {
        navigate("/", { replace: true });
      }
    })();
  }, [loginSuccess, navigate]);

  return <div className="min-h-screen grid place-items-center text-white">Finishing sign-in…</div>;
}