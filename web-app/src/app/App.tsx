import { Toaster } from "@/src/components/ui/toaster";
import { Toaster as Sonner } from "@/src/components/ui/sonner";
import { TooltipProvider } from "@/src/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/src/pages/Index";
import Production from "@/src/pages/Production";
import Materials from "@/src/pages/Materials";
import Quality from "@/src/pages/Quality";
import Logistics from "@/src/pages/Logistics";
import Suppliers from "@/src/pages/Suppliers";
import Alerts from "@/src/pages/Alerts";
import Performance from "@/src/pages/Performance";
import Settings from "@/src/pages/Settings";
import NotFound from "@/src/pages/NotFound";
import Auth from "@/src/pages/Auth";
import Admin from "@/src/pages/Admin";
import SupplierPortal from "@/src/pages/SupplierPortal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/production" element={<Production />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/quality" element={<Quality />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/supplier-portal" element={<SupplierPortal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
