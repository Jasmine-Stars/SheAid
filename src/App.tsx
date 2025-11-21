import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Donate from "./pages/Donate";
import Apply from "./pages/Apply";
import Auth from "./pages/Auth";
import BecomeOrganizer from "./pages/BecomeOrganizer";
import NGO from "./pages/NGO";
import Merchant from "./pages/Merchant";
import Auditor from "./pages/Auditor";
import { AdminLayout } from "./components/AdminLayout";
import ReviewOrganizers from "./pages/admin/ReviewOrganizers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/ngo" element={<NGO />} />
          <Route path="/merchant" element={<Merchant />} />
          <Route path="/auditor" element={<Auditor />} />
          <Route path="/become-organizer" element={<BecomeOrganizer />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="organizers" element={<ReviewOrganizers />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
