import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Patient, Chart } from "@shared/schema";
import { Loader2, Activity, Microscope, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useApprovePatient } from "@/hooks/use-patients";

export default function PatientDiagnostics() {
  // fetch list and use first patient for demo
  const { data: patients, isLoading: loadingPatients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      const res = await fetch("/api/patients", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch patients");
      return (await res.json()) as Patient[];
    },
  });
  const patientId = patients && patients[0]?.id ? patients[0].id : 0;
  const { data: patient, isLoading: isLoadingPatient } = useQuery<Patient>({
    queryKey: ["/api/patients", patientId],
    queryFn: async () => {
      const res = await fetch(`/api/patients/${patientId}`, { credentials: "include" });
      if (res.status === 404) return null as any;
      if (!res.ok) throw new Error("Failed to fetch patient");
      return (await res.json()) as Patient;
    },
    enabled: !!patientId,
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery<Chart[]>({
    queryKey: ["/api/patients", patientId, "charts"],
    queryFn: async () => {
      if (!patientId) return [];
      const res = await fetch(`/api/patients/${patientId}/charts`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch charts");
      return (await res.json()) as Chart[];
    },
    enabled: !!patientId,
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

      <div className="space-y-6">
        {latestChart && (
          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Patient Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm"><strong>Chief complaint:</strong> {latestChart.chiefComplaint}</p>
              <p className="text-sm"><strong>Symptoms:</strong> {latestChart.symptoms}</p>
              {latestChart.vitals && (
                <div className="text-sm">
                  <strong>Vitals:</strong>
                  <ul className="ml-4 list-disc">
                    {Object.entries(latestChart.vitals).map(([k,v]) => v && (<li key={k}>{k}: {v}</li>))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
        {/* approval section */}
        {analysis && !patient?.isApprovedByDoctor && (
          <div className="flex justify-end mt-4">
            <ApproveButton patientId={patient!.id} />
          </div>
        )}
      </div>
    </div>
  );
}

// approval button component
function ApproveButton({ patientId }: { patientId: number }) {
  const approve = useApprovePatient(patientId);
  return (
    <button
      onClick={() => approve.mutate()}
      disabled={approve.isPending}
      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
    >
      {approve.isPending ? "Approving..." : "Mark as Reviewed by Doctor"}
    </button>
  );
}