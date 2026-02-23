import { db } from "./db";
import {
  patients,
  charts,
  type Patient,
  type InsertPatient,
  type UpdatePatientRequest,
  type Chart,
  type InsertChart,
  type UpdateChartRequest
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Patients
  getPatients(userId: string): Promise<Patient[]>;
  getPatient(id: number, userId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, userId: string, updates: UpdatePatientRequest): Promise<Patient | undefined>;
  deletePatient(id: number, userId: string): Promise<void>;

  // Charts
  getChartsByPatient(patientId: number, userId: string): Promise<Chart[]>;
  getChart(id: number, userId: string): Promise<Chart | undefined>;
  createChart(chart: InsertChart): Promise<Chart>;
  updateChart(id: number, userId: string, updates: UpdateChartRequest): Promise<Chart | undefined>;
  updateChartAnalysis(id: number, userId: string, analysis: any): Promise<Chart | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getPatients(userId: string): Promise<Patient[]> {
    return await db.select().from(patients).where(eq(patients.userId, userId));
  }

  async getPatient(id: number, userId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(and(eq(patients.id, id), eq(patients.userId, userId)));
    return patient;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  async updatePatient(id: number, userId: string, updates: UpdatePatientRequest): Promise<Patient | undefined> {
    const [updated] = await db.update(patients)
      .set(updates)
      .where(and(eq(patients.id, id), eq(patients.userId, userId)))
      .returning();
    return updated;
  }

  async deletePatient(id: number, userId: string): Promise<void> {
    await db.delete(patients).where(and(eq(patients.id, id), eq(patients.userId, userId)));
  }

  async getChartsByPatient(patientId: number, userId: string): Promise<Chart[]> {
    return await db.select().from(charts).where(and(eq(charts.patientId, patientId), eq(charts.userId, userId)));
  }

  async getChart(id: number, userId: string): Promise<Chart | undefined> {
    const [chart] = await db.select().from(charts).where(and(eq(charts.id, id), eq(charts.userId, userId)));
    return chart;
  }

  async createChart(chart: InsertChart): Promise<Chart> {
    const [newChart] = await db.insert(charts).values(chart).returning();
    return newChart;
  }

  async updateChart(id: number, userId: string, updates: UpdateChartRequest): Promise<Chart | undefined> {
    const [updated] = await db.update(charts)
      .set(updates)
      .where(and(eq(charts.id, id), eq(charts.userId, userId)))
      .returning();
    return updated;
  }

  async updateChartAnalysis(id: number, userId: string, analysis: any): Promise<Chart | undefined> {
    const [updated] = await db.update(charts)
      .set({ aiAnalysis: analysis })
      .where(and(eq(charts.id, id), eq(charts.userId, userId)))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
