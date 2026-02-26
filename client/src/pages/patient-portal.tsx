import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Patient, Chart } from "@shared/schema";
import { Loader2, FileText, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PatientPortal() {
  // Using patient ID 1 as a default for the "current patient" view in this demo
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Patient Portal</h1>
        <p className="text-muted-foreground font-medium mt-1">
          Welcome back, {patient?.firstName}. Access your medical reports and clinical updates.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-panel border-border/50 col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Your Medical Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {charts?.map((chart) => (
                <div key={chart.id} className="p-4 rounded-lg border border-border/50 bg-background/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">
                      {chart.chiefComplaint}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Visit Date: {new Date(chart.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {patient?.isApprovedByDoctor ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200/50 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Approved by Doctor
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Pending Approval
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {(!charts || charts.length === 0) && (
                <div className="text-center py-8 text-muted-foreground italic">
                  No medical reports found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
