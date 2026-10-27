import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { PASSWORD_RESET_PATH } from "@/lib/passwordReset";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Join from "./pages/Join";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

/** Sends a recovery link to the reset page, including when Supabase falls back to the site root. */
const PasswordRecoveryGate = () => {
  const { passwordRecovery, recoveryPending, recoveryError } = useAuth();
  const location = useLocation();
  const holdForReset = passwordRecovery || recoveryPending || Boolean(recoveryError);
  if (holdForReset && location.pathname !== PASSWORD_RESET_PATH) {
    return <Navigate to={PASSWORD_RESET_PATH} replace />;
  }
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <PasswordRecoveryGate />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/join/:code" element={<Join />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
