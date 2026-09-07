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
import SchedulePage from "./pages/schedule/page.tsx";
import VideoHubPage from "./pages/athletes/video-hub-page.tsx";
import AnnouncementsPage from "./pages/announcements/page.tsx";
import MessagesPage from "./pages/messages/page.tsx";
import KioskPage from "./pages/kiosk/page.tsx";
import { DevPersonaSwitcher } from "./components/ui/dev-persona-switcher.tsx";

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
            path="/schedule"
            element={
              <ProtectedRoute allow={["academy_admin", "coach", "athlete"]}>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/video-hub"
            element={
              <ProtectedRoute allow={["academy_admin", "coach", "athlete"]}>
                <VideoHubPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute allow={["academy_admin", "coach", "athlete"]}>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:conversationId"
            element={
              <ProtectedRoute allow={["academy_admin", "coach", "athlete"]}>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute
                allow={["academy_admin", "coach", "athlete", "accounting"]}
              >
                <AnnouncementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kiosk"
            element={
              <ProtectedRoute allow={["academy_admin", "coach", "athlete"]}>
                <KioskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kiosk/:sessionId"
            element={
              <ProtectedRoute allow={["academy_admin", "coach", "athlete"]}>
                <KioskPage />
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
        <DevPersonaSwitcher />
      </BrowserRouter>
    </DefaultProviders>
  );
}
