import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Chart, type InsertChart } from "@shared/schema";

export function usePatientCharts(patientId: number) {
  return useQuery({
    queryKey: ["/api/patients", patientId, "charts"],
    queryFn: async () => {
      const res = await fetch(`/api/patients/${patientId}/charts`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch charts");
      return (await res.json()) as Chart[];
    },
    enabled: !!patientId,
  });
}

export function useChart(id: number) {
  return useQuery({
    queryKey: ["/api/charts", id],
    queryFn: async () => {
      const res = await fetch(`/api/charts/${id}`, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch chart");
      return (await res.json()) as Chart;
    },
    enabled: !!id,
  });
}

export function useCreateChart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<InsertChart, "userId">) => {
      const res = await fetch("/api/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create chart");
      }
      return (await res.json()) as Chart;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients", variables.patientId, "charts"] });
    },
  });
}

export function useAnalyzeChart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/charts/${id}/analyze`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to analyze chart");
      }
      return (await res.json()) as Chart;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/charts", data.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients", data.patientId, "charts"] });
    },
  });
}
