import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Patient, Chart } from "@shared/schema";
import { Loader2, Activity, ClipboardList, AlertTriangle, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function DoctorPortal() {
  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  if (isLoadingPatients) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctor's Portal</h1>
        <p className="text-muted-foreground font-medium mt-1">
          AI-powered patient intelligence. Monitor vitals, diagnoses, and critical flags in real-time.
        </p>
      </div>

      <div className="grid gap-6">
        {/* AI Alerts Section */}
        <AIAlertsSection patients={patients || []} />

        {/* Patient List with AI Insights */}
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Patient List with AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="table-auto w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Latest Vitals</TableHead>
                  <TableHead>AI Diagnosis</TableHead>
                  <TableHead>Red Flags</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients?.map((patient) => (
                  <PatientRow key={patient.id} patient={patient} />
                ))}
              </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AIAlertsSection({ patients }: { patients: Patient[] }) {
  const allCharts = useQuery<Chart[]>({
    queryKey: ["all-charts"],
    queryFn: async () => {
      const allChartsData: Chart[] = [];
      for (const patient of patients) {
        const response = await fetch(`/api/patients/${patient.id}/charts`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          allChartsData.push(...data);
        }
      }
      return allChartsData;
    },
  });

  const alertCharts = allCharts.data?.filter(
    (chart) => chart.aiAnalysis?.redFlags && chart.aiAnalysis.redFlags.length > 0
  ) || [];

  if (alertCharts.length === 0) return null;

  return (
    <Card className="border-orange-200/50 bg-orange-50/30 dark:bg-orange-950/10 dark:border-orange-900/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <AlertTriangle className="h-5 w-5" />
          Critical AI Alerts ({alertCharts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertCharts.map((chart) => (
          <div
            key={chart.id}
            className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-orange-200/50 dark:border-orange-900/30 flex items-start justify-between"
          >
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-2">{chart.chiefComplaint}</p>
              <div className="space-y-1">
                {chart.aiAnalysis?.redFlags?.slice(0, 2).map((flag, idx) => (
                  <p key={idx} className="text-sm text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <Zap className="h-3 w-3" /> {flag}
                  </p>
                ))}
              </div>
            </div>
            <Link href={`/charts/${chart.id}`}>
              <Button size="sm" variant="outline" className="ml-4">
                Review <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PatientRow({ patient }: { patient: Patient }) {
  const { data: charts } = useQuery<Chart[]>({
    queryKey: ["/api/patients", patient.id, "charts"],
  });

  const latestChart = charts?.[0];
  const vitals = latestChart?.vitals;
  const analysis = latestChart?.aiAnalysis;

  return (
    <TableRow>
      <TableCell className="font-medium">
        {patient.firstName} {patient.lastName}
      </TableCell>
      <TableCell>
        {vitals ? (
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Activity className="h-3 w-3" /> BP: {vitals.bloodPressure || "N/A"}
            </div>
            <div className="text-muted-foreground">HR: {vitals.heartRate || "N/A"} bpm</div>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs italic">No vitals recorded</span>
        )}
      </TableCell>
      <TableCell className="whitespace-normal break-words max-w-[200px] overflow-hidden min-w-0">
        <div className="">
          {analysis?.possibleConditions && analysis.possibleConditions.length > 0 ? (
            <ul className="space-y-1 text-xs">
              {analysis.possibleConditions.slice(0, 2).map((condition, idx) => (
                <li key={idx} className="">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 break-all w-full">
                    <Sparkles className="w-3 h-3 mr-1" />
                    <span className="break-words break-all inline-block w-full overflow-hidden">{condition}</span>
                  </Badge>
                </li>
              ))}
              {analysis.possibleConditions.length > 2 && (
                <li>
                  <Badge variant="outline" className="text-xs break-all w-full">
                    <span className="inline-block w-full">+{analysis.possibleConditions.length - 2} more</span>
                  </Badge>
                </li>
              )}
            </ul>
          ) : (
            <span className="text-muted-foreground text-xs italic">Pending analysis</span>
          )}
        </div>
      </TableCell>
      <TableCell className="whitespace-normal break-words">
        {analysis?.redFlags && analysis.redFlags.length > 0 ? (
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-xs space-y-1 break-words">
              {analysis.redFlags.slice(0, 1).map((flag, idx) => (
                <div key={idx} className="text-destructive font-medium line-clamp-2 break-words">
                  {flag}
                </div>
              ))}
              {analysis.redFlags.length > 1 && (
                <p className="text-muted-foreground text-xs">+{analysis.redFlags.length - 1} more</p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
      <TableCell>
        {analysis?.recommendedTests && analysis.recommendedTests.length > 0 ? (
          <div className="text-xs space-y-1 max-w-[150px]">
            <p className="font-medium text-foreground line-clamp-2">{analysis.recommendedTests[0]}</p>
            {analysis.recommendedTests.length > 1 && (
              <p className="text-muted-foreground">+{analysis.recommendedTests.length - 1} more</p>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
      <TableCell>
        <Link href={`/patients/${patient.id}`}>
          <Button size="sm" variant="outline" className="h-8">
            View <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}
