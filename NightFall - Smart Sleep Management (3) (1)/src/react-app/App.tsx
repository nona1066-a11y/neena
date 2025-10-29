import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import { LanguageProvider } from "@/react-app/hooks/useLanguage";
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import DashboardPage from "@/react-app/pages/Dashboard";
import SoundsPage from "@/react-app/pages/Sounds";
import AnalysisPage from "@/react-app/pages/Analysis";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/sounds" element={<SoundsPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
