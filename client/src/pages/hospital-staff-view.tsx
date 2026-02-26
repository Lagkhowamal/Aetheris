import { Link } from "wouter";
import { format } from "date-fns";
import { AlertTriangle, Activity, TrendingUp, Clock, ChevronRight, AlertCircle, Heart } from "lucide-react";
import { useHospitalStaffView } from "@/hooks/use-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TriageLevel = "red" | "yellow" | "green";

interface PatientTriage {
  level: TriageLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const triageLevels: Record<TriageLevel, PatientTriage> = {
  red: {
    level: "red",
    label: "IMMEDIATE",
    description: "Critical condition - requires immediate intervention",
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  yellow: {
    level: "yellow",
    label: "URGENT",
    description: "Urgent attention needed - non-critical but serious",
    icon: <AlertCircle className="w-5 h-5" />,
  },
  green: {
    level: "green",
    label: "STABLE",
    description: "Stable condition - routine care",
    icon: <Heart className="w-5 h-5" />,
  },
};

function assessTriageLevel(chart: any): TriageLevel {
  if (!chart.aiAnalysis) return "green";

  const analysis = chart.aiAnalysis;
  const redFlagCount = analysis.redFlags?.length || 0;
  const hasMultipleRedFlags = redFlagCount >= 2;
  const hasCriticalRedFlag = analysis.redFlags?.some((flag: string) =>
    /critical|severe|emergency|shock|sepsis|respiratory failure|cardiac arrest|hemorrhage|unconscious/i.test(flag)
  ) || false;

  // Check for critical vital signs
  let hasAbnormalVitals = false;
  if (chart.vitals) {
    const vitals = chart.vitals;
    // Heart rate > 120 or < 60
    const hr = parseInt(vitals.heartRate?.toString() || "0");
    if (hr > 120 || (hr > 0 && hr < 60)) hasAbnormalVitals = true;
    // Systolic BP > 180 or < 90
    if (vitals.bloodPressure) {
      const bp = vitals.bloodPressure.toString();
      const systolic = parseInt(bp.split("/")[0] || "0");
      if (systolic > 180 || (systolic > 0 && systolic < 90)) hasAbnormalVitals = true;
    }
    // Resp Rate > 25 or < 12
    const rr = parseInt(vitals.respiratoryRate?.toString() || "0");
    if (rr > 25 || (rr > 0 && rr < 12)) hasAbnormalVitals = true;
    // Temp > 39°C or < 36°C
    const temp = parseFloat(vitals.temperature?.toString() || "0");
    if (temp > 39 || (temp > 0 && temp < 36)) hasAbnormalVitals = true;
    // SpO2 < 94%
    const spo2 = parseInt(vitals.oxygenSaturation?.toString() || "100");
    if (spo2 < 94) hasAbnormalVitals = true;
  }

  // RED: Critical condition
  if (hasCriticalRedFlag || (hasAbnormalVitals && hasMultipleRedFlags)) {
    return "red";
  }

  // YELLOW: Urgent but stable
  if (hasMultipleRedFlags || hasAbnormalVitals || redFlagCount > 0) {
    return "yellow";
  }

  // GREEN: Stable
  return "green";
}

const triageStyles: Record<TriageLevel, string> = {
  red: "border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20",
  yellow: "border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
  green: "border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20",
};

const badgeStyles: Record<TriageLevel, string> = {
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 border border-red-300 dark:border-red-700",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-700",
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border border-green-300 dark:border-green-700",
};

export default function HospitalStaffView() {
  const { data: chartsWithPatients, isLoading } = useHospitalStaffView();

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-border/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!chartsWithPatients || chartsWithPatients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Activity className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-foreground">No Patient Charts</h2>
        <p className="text-muted-foreground max-w-md text-center">
          There are currently no patient charts in the system. Create your first patient and chart to get started.
        </p>
      </div>
    );
  }

  // Sort by triage level (red first, then yellow, then green) and then by date
  const sortedCharts = [...chartsWithPatients].sort((a, b) => {
    const aLevel = assessTriageLevel(a);
    const bLevel = assessTriageLevel(b);
    const levelOrder = { red: 0, yellow: 1, green: 2 };
    if (levelOrder[aLevel] !== levelOrder[bLevel]) {
      return levelOrder[aLevel] - levelOrder[bLevel];
    }
    // Same level, sort by newest first
    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bDate - aDate;
  });

  // Count by triage level
  const triageCounts = sortedCharts.reduce(
    (acc, chart) => {
      const level = assessTriageLevel(chart);
      acc[level]++;
      return acc;
    },
    { red: 0, yellow: 0, green: 0 }
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="border-b border-border/50 pb-6">
        <h1 className="text-4xl font-bold text-foreground mb-2">Hospital Staff Dashboard</h1>
        <p className="text-muted-foreground">WHO Triage Color-Coded Patient List</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-red-500 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-red-900 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{triageCounts.red}</div>
            <p className="text-xs text-red-700/70 dark:text-red-400/70 mt-1">Immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Urgent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{triageCounts.yellow}</div>
            <p className="text-xs text-yellow-700/70 dark:text-yellow-400/70 mt-1">Requires soon</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-green-900 dark:text-green-200 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Stable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{triageCounts.green}</div>
            <p className="text-xs text-green-700/70 dark:text-green-400/70 mt-1">Routine care</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{sortedCharts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active charts</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">Active Patients</h2>
        <div className="space-y-2">
          {sortedCharts.length > 0 ? (
            sortedCharts.map((chartWithPatient) => {
              const triageLevel = assessTriageLevel(chartWithPatient);
              const triage = triageLevels[triageLevel];
              const patient = chartWithPatient.patient;
              const analysis = chartWithPatient.aiAnalysis;

              return (
                <Link
                  key={chartWithPatient.id}
                  href={`/charts/${chartWithPatient.id}`}
                  className={`block transition-all hover:shadow-md ${triageStyles[triageLevel]}`}
                >
                  <Card className="border-0 bg-transparent shadow-none cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        {/* Triage Badge & Patient Info */}
                        <div className="md:col-span-1 space-y-2">
                          <Badge className={badgeStyles[triageLevel]}>
                            <span className="flex items-center gap-1">
                              {triage.icon}
                              {triage.label}
                            </span>
                          </Badge>
                          <p className="text-xs text-muted-foreground font-semibold">{triage.description}</p>
                        </div>

                        {/* Patient Details */}
                        <div className="md:col-span-1 space-y-1">
                          <p className="font-bold text-foreground">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient.gender}, Age {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                          </p>
                        </div>

                        {/* Chief Complaint */}
                        <div className="md:col-span-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Chief Complaint</p>
                          <p className="text-sm font-medium text-foreground truncate">{chartWithPatient.chiefComplaint}</p>
                        </div>

                        {/* Red Flags Count */}
                        <div className="md:col-span-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Red Flags</p>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <p className="text-sm font-bold text-foreground">{analysis?.redFlags?.length || 0}</p>
                          </div>
                        </div>

                        {/* Critical Vitals */}
                        <div className="md:col-span-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Vitals</p>
                          <div className="space-y-0.5 text-xs text-foreground">
                            {chartWithPatient.vitals?.heartRate && (
                              <p>HR: {chartWithPatient.vitals.heartRate}</p>
                            )}
                            {chartWithPatient.vitals?.bloodPressure && (
                              <p>BP: {chartWithPatient.vitals.bloodPressure}</p>
                            )}
                            {chartWithPatient.vitals?.oxygenSaturation && (
                              <p>SpO₂: {chartWithPatient.vitals.oxygenSaturation}</p>
                            )}
                          </div>
                        </div>

                        {/* Timestamp & Action */}
                        <div className="md:col-span-1 text-right space-y-2">
                          <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            {chartWithPatient.createdAt &&
                              format(new Date(chartWithPatient.createdAt), "MMM d, h:mm a")}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                          >
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No patient charts available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* WHO Triage Legend */}
      <Card className="bg-slate-50 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">WHO Triage Color Code Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(triageLevels).map((triage) => (
              <div key={triage.level} className={`p-3 rounded-lg ${triageStyles[triage.level as TriageLevel]}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{triage.icon}</span>
                  <span className="font-bold text-sm">{triage.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{triage.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
