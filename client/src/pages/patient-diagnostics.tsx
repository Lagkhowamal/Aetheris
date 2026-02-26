import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Patient, Chart } from "@shared/schema";
import { Loader2, Activity, Microscope, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PatientDiagnostics() {
  // Using patient ID 1 as a default for demo
  const { data: patient, isLoading: isLoadingPatient } = useQuery<Patient>({
    queryKey: ["/api/patients", 1],
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery<Chart[]>({
    queryKey: ["/api/patients", 1, "charts"],
  });

  if (isLoadingPatient || isLoadingCharts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const latestChart = charts?.[0];
  const analysis = latestChart?.aiAnalysis;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Diagnostics & AI Insights</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Review detailed clinical findings and AI-powered assessments.
          </p>
        </div>
        {patient?.isApprovedByDoctor ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-200/50 rounded-full font-semibold text-sm">
            <CheckCircle2 className="h-4 w-4" /> Doctor Verified
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 border border-amber-200/50 rounded-full font-semibold text-sm">
            <Activity className="h-4 w-4 animate-pulse" /> Pending Doctor Review
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Microscope className="h-5 w-5 text-primary" />
              AI Diagnostic Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" /> Potential Conditions
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis?.possibleConditions?.map((cond, i) => (
                  <Badge key={i} variant="outline" className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50">
                    {cond}
                  </Badge>
                ))}
                {!analysis?.possibleConditions && <span className="text-muted-foreground text-sm italic">No data available</span>}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" /> Key Red Flags
              </h4>
              <ul className="space-y-2">
                {analysis?.redFlags?.map((flag, i) => (
                  <li key={i} className="text-sm flex items-start gap-2 text-rose-600 dark:text-rose-400">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    {flag}
                  </li>
                ))}
                {!analysis?.redFlags && <span className="text-muted-foreground text-sm italic">No red flags identified</span>}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Clinical Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {analysis?.summary || "The clinical summary for your latest encounter is being prepared by the AI and will be available once reviewed by your healthcare provider."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
