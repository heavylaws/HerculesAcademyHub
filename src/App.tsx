import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "./components/auth/protected-route.tsx";
import Academies from "./pages/admin/academies/page.tsx";
import Staff from "./pages/staff/page.tsx";
import Athletes from "./pages/athletes/page.tsx";
import AthleteDetail from "./pages/athletes/detail-page.tsx";
import Teams from "./pages/teams/page.tsx";
import TeamDetail from "./pages/teams/detail-page.tsx";
import SessionDetail from "./pages/sessions/detail-page.tsx";
import PlanDetail from "./pages/athletes/plan-detail-page.tsx";
import FinancePage from "./pages/finance/page.tsx";
import MyFeesPage from "./pages/finance/my-fees-page.tsx";
import InvoicesPage from "./pages/invoices/page.tsx";
import AdminBillingPage from "./pages/admin/billing/page.tsx";

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/admin/academies"
            element={
              <ProtectedRoute allow={["platform_admin"]}>
                <Academies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute allow={["academy_admin", "coach"]}>
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athletes"
            element={
              <ProtectedRoute allow={["academy_admin", "coach", "athlete"]}>
                <Athletes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athletes/:athleteId"
            element={
              <ProtectedRoute allow={["academy_admin", "coach", "athlete"]}>
                <AthleteDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute allow={["academy_admin", "coach", "athlete"]}>
                <Teams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/:teamId"
            element={
              <ProtectedRoute allow={["academy_admin", "coach", "athlete"]}>
                <TeamDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/:sessionId"
            element={
              <ProtectedRoute allow={["academy_admin", "coach", "athlete"]}>
                <SessionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plans/:planId"
            element={
              <ProtectedRoute allow={["academy_admin", "coach", "athlete"]}>
                <PlanDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute allow={["academy_admin", "accounting"]}>
                <FinancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/my-fees"
            element={
              <ProtectedRoute allow={["athlete"]}>
                <MyFeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute allow={["academy_admin", "accounting"]}>
                <InvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/billing"
            element={
              <ProtectedRoute allow={["platform_admin"]}>
                <AdminBillingPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}
