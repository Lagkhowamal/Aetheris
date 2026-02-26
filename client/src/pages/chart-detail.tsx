import { useRoute, Link } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Sparkles, Activity, FileText, CheckCircle2, AlertTriangle, Stethoscope, ArrowRight } from "lucide-react";
import { useChart, useAnalyzeChart } from "@/hooks/use-charts";
import { usePatient } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ChartDetail() {
  const [, params] = useRoute("/charts/:id");
  const chartId = parseInt(params?.id || "0");
  
  const { data: chart, isLoading: chartLoading } = useChart(chartId);
  const { data: patient, isLoading: patientLoading } = usePatient(chart?.patientId || 0);
  const analyzeChart = useAnalyzeChart();

  if (chartLoading || patientLoading) return <div className="animate-pulse p-8"><div className="h-8 bg-border/50 rounded w-1/3 mb-8"></div><div className="h-64 bg-border/50 rounded-2xl"></div></div>;
  if (!chart || !patient) return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Chart not found</h2></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <Link href={`/patients/${patient.id}`}>
        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary transition-colors -ml-2 mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Patient Profile
        </Button>
      </Link>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Clinical Data */}
        <div className="w-full lg:w-[45%] space-y-6">
          <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-950 p-6 border-b border-border/50">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1">Encounter Record</Badge>
                <span className="text-sm text-muted-foreground font-medium">{format(new Date(chart.createdAt), "MMMM d, yyyy")}</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mt-2 mb-1">{chart.chiefComplaint}</h1>
              <p className="text-muted-foreground text-sm font-medium">Patient: {patient.firstName} {patient.lastName}</p>
            </div>
            
            <CardContent className="p-6 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" /> Reported Symptoms
                </h3>
                <p className="text-foreground leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border/50">
                  {chart.symptoms}
                </p>
              </div>

              {chart.vitals && Object.keys(chart.vitals).length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                    <Activity className="w-4 h-4 mr-2" /> Vital Signs
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(chart.vitals).map(([key, value]) => {
                      if (!value) return null;
                      const labels: Record<string, string> = {
                        bloodPressure: "BP", heartRate: "HR", temperature: "Temp", 
                        respiratoryRate: "Resp", oxygenSaturation: "SpO2", weight: "Weight"
                      };
                      return (
                        <div key={key} className="flex flex-col p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                          <span className="text-xs text-muted-foreground font-medium">{labels[key] || key}</span>
                          <span className="font-bold text-foreground mt-1">{value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {chart.doctorNotes && (
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                    <Stethoscope className="w-4 h-4 mr-2" /> Provider Notes
                  </h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{chart.doctorNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="w-full lg:w-[55%]">
          <Card className="border-border/50 shadow-lg bg-card rounded-3xl h-full flex flex-col overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none" />
            
            <CardHeader className="border-b border-border/50 pb-4 bg-slate-50/50 dark:bg-slate-900/50 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl text-purple-600 dark:text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-display">Aetheris Intelligence</CardTitle>
                </div>
                {chart.aiAnalysis && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5"/> Analysis Complete</Badge>}
              </div>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 flex flex-col relative z-10">
              {!chart.aiAnalysis ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                  <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-6 shadow-inner border border-purple-100 dark:border-purple-800">
                    <Sparkles className="w-10 h-10 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground font-display">Generate Clinical Assessment</h3>
                  <p className="text-muted-foreground mt-3 mb-8 max-w-sm leading-relaxed text-sm">
                    Utilize advanced AI to analyze symptoms, vitals, and history to generate a comprehensive differential diagnosis and treatment plan.
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 rounded-xl px-8 h-14 text-base font-semibold transition-all hover:scale-[1.02]"
                    onClick={() => analyzeChart.mutate(chart.id)}
                    disabled={analyzeChart.isPending}
                  >
                    {analyzeChart.isPending ? (
                      <span className="flex items-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"/> Analyzing Chart...</span>
                    ) : (
                      <span className="flex items-center"><Sparkles className="w-5 h-5 mr-2" /> Run AI Assessment</span>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-[70vh]">
                  
                  {chart.aiAnalysis.summary && (
                    <div className="bg-purple-50/50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-100/50 dark:border-purple-900/30 break-words">
                      <p className="text-foreground leading-relaxed font-medium break-words whitespace-pre-wrap">
                        {chart.aiAnalysis.summary}
                      </p>
                    </div>
                  )}

                  {chart.aiAnalysis.redFlags && chart.aiAnalysis.redFlags.length > 0 && (
                    <div>
                      <h4 className="flex items-center text-sm font-bold text-destructive uppercase tracking-wider mb-4">
                        <AlertTriangle className="w-4 h-4 mr-2" /> Critical Red Flags
                      </h4>
                      <div className="space-y-2">
                        {chart.aiAnalysis.redFlags.map((flag, i) => (
                          <div key={i} className="flex items-start bg-destructive/10 text-destructive-foreground dark:text-red-400 p-3 rounded-xl border border-destructive/20">
                            <AlertTriangle className="w-4 h-4 mr-3 mt-0.5 shrink-0 text-destructive" />
                            <span className="text-sm font-medium">{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {chart.aiAnalysis.possibleConditions && chart.aiAnalysis.possibleConditions.length > 0 && (
                    <div>
                      <h4 className="flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">
                        <Activity className="w-4 h-4 mr-2" /> Differential Diagnosis
                      </h4>
                      <ul className="space-y-3">
                        {chart.aiAnalysis.possibleConditions.map((condition, i) => (
                          <li key={i} className="flex items-start p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border/50">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold mr-3 shrink-0">{i+1}</span>
                            <span className="text-foreground font-medium mt-0.5">{condition}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {chart.aiAnalysis.recommendedTests && chart.aiAnalysis.recommendedTests.length > 0 && (
                      <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3">Recommended Tests</h4>
                        <ul className="space-y-2">
                          {chart.aiAnalysis.recommendedTests.map((test, i) => (
                            <li key={i} className="flex items-center text-sm text-foreground">
                              <ArrowRight className="w-3.5 h-3.5 mr-2 text-blue-500" /> {test}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {chart.aiAnalysis.suggestedTreatments && chart.aiAnalysis.suggestedTreatments.length > 0 && (
                      <div className="p-5 bg-teal-50/50 dark:bg-teal-900/10 rounded-2xl border border-teal-100 dark:border-teal-900/30">
                        <h4 className="text-sm font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-3">Treatment Plan</h4>
                        <ul className="space-y-2">
                          {chart.aiAnalysis.suggestedTreatments.map((treatment, i) => (
                            <li key={i} className="flex items-center text-sm text-foreground">
                              <ArrowRight className="w-3.5 h-3.5 mr-2 text-teal-500" /> {treatment}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
