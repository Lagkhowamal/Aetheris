import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Patient, Chart } from "@shared/schema";
import { Loader2, Activity, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
          Review assigned patients, vitals, and AI-generated diagnostic insights.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Patient List & Presumed Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Latest Vitals</TableHead>
                  <TableHead>Presumed Diagnosis (AI)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients?.map((patient) => (
                  <PatientRow key={patient.id} patient={patient} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
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
      <TableCell>
        <div className="max-w-[200px]">
          {analysis?.possibleConditions?.[0] ? (
            <span className="text-sm font-medium">{analysis.possibleConditions[0]}</span>
          ) : (
            <span className="text-muted-foreground text-xs italic">Pending analysis</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={latestChart?.status === "completed" ? "default" : "secondary"} className="capitalize">
          {latestChart?.status || "No Encounter"}
        </Badge>
      </TableCell>
      <TableCell>
        {patient.isApprovedByDoctor ? (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200/50">Approved</Badge>
        ) : (
          <Badge variant="outline" className="text-amber-600 border-amber-200/50">Pending Review</Badge>
        )}
      </TableCell>
    </TableRow>
  );
}
