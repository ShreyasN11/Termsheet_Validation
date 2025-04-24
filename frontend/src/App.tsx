
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Documents from "./pages/Documents";
import Analytics from "./pages/Analytics";
import Validations from "./pages/Validations";
import Compliance from "./pages/Compliance";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";

const queryClient = new QueryClient();

// Configure external links to open in new tabs
if (typeof window !== 'undefined') {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor && anchor.getAttribute('href')?.startsWith('http') && !anchor.hasAttribute('target')) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/" element={<Index />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/validations" element={<Validations />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/settings" element={<Index />} />
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
