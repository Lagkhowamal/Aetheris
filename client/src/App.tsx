import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import PatientDetail from "@/pages/patient-detail";
import ChartDetail from "@/pages/chart-detail";
import ChatList from "@/pages/chat-list";
import ChatDetail from "@/pages/chat-detail";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading Aetheris Systems...</p>
        </div>
      </div>
    );
  }

  // Instead of a direct redirect which can cause loops, 
  // we show a simple "Sign In" button or auto-redirect once.
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-2xl font-bold">Aetheris Medical Systems</h1>
          <p className="text-muted-foreground">Please sign in to access your clinical dashboard.</p>
          <button 
            onClick={() => window.location.href = "/api/login"}
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Sign In with Replit
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/patients/:id" component={PatientDetail} />
        <Route path="/charts/:id" component={ChartDetail} />
        <Route path="/chat" component={ChatList} />
        <Route path="/chat/:id" component={ChatDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
