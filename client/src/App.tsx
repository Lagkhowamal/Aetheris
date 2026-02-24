import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import PatientDetail from "@/pages/patient-detail";
import ChartDetail from "@/pages/chart-detail";
import ChatList from "@/pages/chat-list";
import ChatDetail from "@/pages/chat-detail";
import NotFound from "@/pages/not-found";

function Router() {
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
