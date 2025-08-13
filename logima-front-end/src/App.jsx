import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { authApi } from "@/lib/api";
import MainLayout from "@/layouts/MainLayout"; 

function RequireAuth({ children }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking"); // 'checking' | 'ok'

  useEffect(() => {
    // Ask backend if the cookie JWT is valid
    authApi.me()
      .then(() => setStatus("ok"))
      .catch(() => navigate("/login", { replace: true }));
  }, [navigate]);

  if (status === "checking") {
    return <div className="text-gray-300 p-8">Checking session…</div>;
  }
  return children;
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Private, wrapped by MainLayout */}
        <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route index element={<HomePage />} />           {/* "/" */}
          {/* add more authenticated pages here */}
          {/* <Route path="projects" element={<ProjectsPage />} /> */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}