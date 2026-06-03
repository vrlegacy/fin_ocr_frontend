import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/login";
import { SignupPage } from "./pages/signup";
import { DashboardPage } from "./pages/dashboard";
import { ResultPage } from "./pages/result";
import { HistoryPage } from "./pages/history";
import { SettingsPage } from "./pages/settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "/",
        Component: LoginPage,
      },
      {
        path: "/signup",
        Component: SignupPage,
      },
      {
        path: "/dashboard",
        Component: DashboardPage,
      },
      {
        path: "/history",
        Component: HistoryPage,
      },
      {
        path: "/result/:id",
        Component: ResultPage,
      },
      {
        path: "/settings",
        Component: SettingsPage,
      },
    ],
  },
]);