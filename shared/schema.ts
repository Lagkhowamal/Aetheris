import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth and chat models
export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

// Patients table
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id), // The doctor/provider managing this patient
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  medicalHistory: text("medical_history"),
  currentMedications: text("current_medications"),
  allergies: text("allergies"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Charts/Encounters table
export const charts = pgTable("charts", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id), // The doctor/provider
  date: timestamp("date").defaultNow().notNull(),
  chiefComplaint: text("chief_complaint").notNull(),
  symptoms: text("symptoms").notNull(),
  vitals: jsonb("vitals").$type<{
    temperature?: string;
    bloodPressure?: string;
    heartRate?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
    weight?: string;
    height?: string;
  }>(),
  aiAnalysis: jsonb("ai_analysis").$type<{
    possibleConditions?: string[];
    recommendedTests?: string[];
    suggestedTreatments?: string[];
    redFlags?: string[];
    summary?: string;
  }>(),
  doctorNotes: text("doctor_notes"),
  status: text("status").default('draft').notNull(), // 'draft' or 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const patientsRelations = relations(patients, ({ many }) => ({
  charts: many(charts),
}));

export const chartsRelations = relations(charts, ({ one }) => ({
  patient: one(patients, {
    fields: [charts.patientId],
    references: [patients.id],
  }),
}));

export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true });
export const insertChartSchema = createInsertSchema(charts).omit({ id: true, createdAt: true, aiAnalysis: true });

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Chart = typeof charts.$inferSelect;
export type InsertChart = z.infer<typeof insertChartSchema>;

export type CreatePatientRequest = InsertPatient;
export type UpdatePatientRequest = Partial<InsertPatient>;

export type CreateChartRequest = InsertChart;
export type UpdateChartRequest = Partial<InsertChart>;
