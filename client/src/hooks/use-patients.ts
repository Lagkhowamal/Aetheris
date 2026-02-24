import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Patient, type InsertPatient } from "@shared/schema";

export function usePatients() {
  return useQuery({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      const res = await fetch("/api/patients", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch patients");
      return (await res.json()) as Patient[];
    },
  });
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: ["/api/patients", id],
    queryFn: async () => {
      const res = await fetch(`/api/patients/${id}`, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch patient");
      return (await res.json()) as Patient;
    },
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<InsertPatient, "userId">) => {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create patient");
      }
      return (await res.json()) as Patient;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/patients"] }),
  });
}
