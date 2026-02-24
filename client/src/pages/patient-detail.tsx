import { useState } from "react";
import { useRoute, Link } from "wouter";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, FileText, Activity, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { usePatient } from "@/hooks/use-patients";
import { usePatientCharts, useCreateChart } from "@/hooks/use-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const chartSchema = z.object({
  chiefComplaint: z.string().min(1, "Required"),
  symptoms: z.string().min(1, "Required"),
  vitals: z.object({
    temperature: z.string().optional(),
    bloodPressure: z.string().optional(),
    heartRate: z.string().optional(),
    respiratoryRate: z.string().optional(),
    oxygenSaturation: z.string().optional(),
    weight: z.string().optional(),
  }).optional(),
  doctorNotes: z.string().optional()
});

type ChartFormValues = z.infer<typeof chartSchema>;

export default function PatientDetail() {
  const [, params] = useRoute("/patients/:id");
  const patientId = parseInt(params?.id || "0");
  
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: charts, isLoading: chartsLoading } = usePatientCharts(patientId);
  const createChart = useCreateChart();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<ChartFormValues>({
    resolver: zodResolver(chartSchema),
    defaultValues: {
      chiefComplaint: "", symptoms: "", doctorNotes: "",
      vitals: { temperature: "", bloodPressure: "", heartRate: "", respiratoryRate: "", oxygenSaturation: "", weight: "" }
    }
  });

  function onSubmit(data: ChartFormValues) {
    createChart.mutate({
      patientId,
      ...data,
      status: "draft"
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      }
    });
  }

  if (patientLoading) return <div className="animate-pulse p-8"><div className="h-8 bg-border/50 rounded w-1/3 mb-8"></div><div className="h-64 bg-border/50 rounded-2xl"></div></div>;
  if (!patient) return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Patient not found</h2></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <Link href="/">
        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary transition-colors -ml-2 mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Registry
        </Button>
      </Link>

      {/* Patient Header Card */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-card to-slate-50 dark:to-slate-900/50 rounded-3xl overflow-hidden relative z-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-lg shadow-primary/20">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-display">
                  {patient.firstName} {patient.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground font-medium">
                  <Badge variant="secondary" className="bg-secondary/50 hover:bg-secondary/50 text-secondary-foreground rounded-lg px-2.5 py-1">
                    {patient.gender}
                  </Badge>
                  <span className="flex items-center"><Activity className="w-3.5 h-3.5 mr-1.5"/> DOB: {format(new Date(patient.dateOfBirth), "MMMM d, yyyy")}</span>
                  <span>ID: PT-{patient.id.toString().padStart(5, '0')}</span>
                </div>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl">
                  <Plus className="w-5 h-5 mr-2" />
                  New Encounter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-display">Create Clinical Encounter</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="chiefComplaint" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Chief Complaint</FormLabel>
                        <FormControl><Input placeholder="E.g., Persistent cough and fever..." className="h-12 bg-slate-50 dark:bg-slate-900/50" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="symptoms" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Reported Symptoms</FormLabel>
                        <FormControl><Textarea placeholder="Detailed description of symptoms..." className="resize-none h-24 bg-slate-50 dark:bg-slate-900/50" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="p-5 rounded-xl border border-border/50 bg-slate-50/50 dark:bg-slate-900/20 space-y-4">
                      <h4 className="font-semibold text-sm flex items-center text-foreground"><Activity className="w-4 h-4 mr-2 text-primary"/> Vital Signs</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <FormField control={form.control} name="vitals.bloodPressure" render={({ field }) => (
                          <FormItem><FormLabel className="text-xs text-muted-foreground">Blood Pressure</FormLabel><FormControl><Input placeholder="120/80" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="vitals.heartRate" render={({ field }) => (
                          <FormItem><FormLabel className="text-xs text-muted-foreground">Heart Rate (bpm)</FormLabel><FormControl><Input placeholder="72" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="vitals.temperature" render={({ field }) => (
                          <FormItem><FormLabel className="text-xs text-muted-foreground">Temp (°F/°C)</FormLabel><FormControl><Input placeholder="98.6" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="vitals.oxygenSaturation" render={({ field }) => (
                          <FormItem><FormLabel className="text-xs text-muted-foreground">SpO2 (%)</FormLabel><FormControl><Input placeholder="99" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="vitals.respiratoryRate" render={({ field }) => (
                          <FormItem><FormLabel className="text-xs text-muted-foreground">Resp Rate</FormLabel><FormControl><Input placeholder="16" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="vitals.weight" render={({ field }) => (
                          <FormItem><FormLabel className="text-xs text-muted-foreground">Weight (lbs/kg)</FormLabel><FormControl><Input placeholder="165 lbs" {...field} /></FormControl></FormItem>
                        )} />
                      </div>
                    </div>

                    <FormField control={form.control} name="doctorNotes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Initial Notes</FormLabel>
                        <FormControl><Textarea placeholder="Preliminary observations..." className="resize-none h-20" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <DialogFooter className="pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
                      <Button type="submit" disabled={createChart.isPending} className="bg-primary hover:bg-primary/90 rounded-xl px-6">
                        {createChart.isPending ? "Creating..." : "Create Encounter"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="encounters" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 p-1 bg-card border border-border/50 rounded-xl mb-6 shadow-sm">
          <TabsTrigger value="encounters" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">Encounters</TabsTrigger>
          <TabsTrigger value="info" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">Patient Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="encounters" className="mt-0">
          <div className="space-y-4">
            {chartsLoading ? (
               <div className="space-y-4">
                 {[1,2,3].map(i => <div key={i} className="h-24 bg-card border border-border/50 rounded-2xl animate-pulse"></div>)}
               </div>
            ) : charts?.length === 0 ? (
              <Card className="border-dashed border-2 bg-transparent shadow-none">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">No Encounters Yet</h3>
                  <p className="text-muted-foreground mt-1 mb-4 text-sm">Create the first clinical encounter to start charting.</p>
                  <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="rounded-xl">Create Encounter</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {charts?.map(chart => (
                  <Link key={chart.id} href={`/charts/${chart.id}`}>
                    <Card className="cursor-pointer hover-elevate overflow-hidden border-border/50 shadow-sm bg-card rounded-2xl group transition-all">
                      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{chart.chiefComplaint}</h4>
                            <div className="flex items-center text-sm text-muted-foreground mt-1 gap-4">
                              <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5"/> {format(new Date(chart.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                              {chart.status === 'completed' ? (
                                <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium"><CheckCircle2 className="w-3.5 h-3.5 mr-1"/> Completed</span>
                              ) : (
                                <span className="flex items-center text-amber-600 dark:text-amber-400 font-medium"><Activity className="w-3.5 h-3.5 mr-1"/> Draft</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {chart.aiAnalysis ? (
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none shrink-0">AI Analyzed</Badge>
                        ) : null}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="info" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 shadow-sm rounded-2xl">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg flex items-center"><AlertCircle className="w-5 h-5 mr-2 text-primary" /> Allergies & Meds</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Known Allergies</h4>
                  {patient.allergies ? (
                    <div className="bg-destructive/10 text-destructive/90 px-4 py-3 rounded-xl border border-destructive/20 font-medium">
                      {patient.allergies}
                    </div>
                  ) : (
                    <p className="text-foreground">No known allergies</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Medications</h4>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{patient.currentMedications || "None listed"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm rounded-2xl">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg flex items-center"><Activity className="w-5 h-5 mr-2 text-primary" /> Medical History</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {patient.medicalHistory || "No significant medical history recorded."}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
