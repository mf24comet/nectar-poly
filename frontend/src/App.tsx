import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { FleetOverviewPage } from "@/pages/FleetOverview";
import { InventoryPage } from "@/pages/Inventory";
import { AlertsPage } from "@/pages/Alerts";
import { SoftwarePage } from "@/pages/Software";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<FleetOverviewPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="software" element={<SoftwarePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
