import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, User, Calendar, FileText } from "lucide-react";
import { usePatients, useCreatePatient } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  medicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  allergies: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function Dashboard() {
  const { data: patients, isLoading } = usePatients();
  const createPatient = useCreatePatient();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "", lastName: "", dateOfBirth: "", gender: "", medicalHistory: "", currentMedications: "", allergies: ""
    }
  });

  function onSubmit(data: PatientFormValues) {
    createPatient.mutate({
      ...data,
      dateOfBirth: data.dateOfBirth, // Keep as YYYY-MM-DD format
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      }
    });
  }

  const filteredPatients = patients?.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Patients Registry</h1>
          <p className="text-muted-foreground mt-1">Manage your patients and access clinical charts.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-xl px-6">
              <Plus className="w-4 h-4 mr-2" />
              New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add New Patient</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                    <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="allergies" render={({ field }) => (
                  <FormItem><FormLabel>Allergies</FormLabel><FormControl><Input placeholder="E.g., Penicillin, Peanuts" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="currentMedications" render={({ field }) => (
                  <FormItem><FormLabel>Current Medications</FormLabel><FormControl><Textarea placeholder="List current medications..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="medicalHistory" render={({ field }) => (
                  <FormItem><FormLabel>Medical History</FormLabel><FormControl><Textarea placeholder="Past medical conditions, surgeries..." className="resize-none h-24" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createPatient.isPending} className="bg-primary text-primary-foreground">
                    {createPatient.isPending ? "Saving..." : "Save Patient"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Search patients by name..." 
          className="pl-10 h-12 bg-card border-border/50 shadow-sm rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-card animate-pulse shadow-sm border border-border/50"></div>
          ))}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-card rounded-3xl border border-border/50 shadow-sm border-dashed">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No patients found</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">Get started by adding your first patient to the registry.</p>
          <Button variant="outline" className="mt-6 rounded-xl" onClick={() => setIsDialogOpen(true)}>Add Patient</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map(patient => (
            <Link key={patient.id} href={`/patients/${patient.id}`}>
              <Card className="cursor-pointer hover-elevate overflow-hidden border-border/50 shadow-sm bg-card rounded-2xl group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-lg group-hover:scale-110 transition-transform">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {patient.gender}, {Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / 31557600000)} yrs
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg">
                      <Calendar className="w-4 h-4 mr-3 text-primary/70" />
                      <span>DOB: {format(new Date(patient.dateOfBirth), "MMM d, yyyy")}</span>
                    </div>
                    {patient.allergies && (
                      <div className="flex items-start text-sm bg-destructive/5 p-2.5 rounded-lg border border-destructive/10">
                        <Badge variant="destructive" className="mr-2 px-1.5 h-5 text-[10px] uppercase tracking-wider">Allergies</Badge>
                        <span className="text-destructive/80 font-medium leading-tight">{patient.allergies}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
