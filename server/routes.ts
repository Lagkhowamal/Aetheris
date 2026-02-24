import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Authentication removed as requested
  registerChatRoutes(app);
  registerImageRoutes(app);

  const DEFAULT_USER_ID = "default-provider-id";

  // Patients API
  app.get(api.patients.list.path, async (req: any, res) => {
    const patients = await storage.getPatients(DEFAULT_USER_ID);
    res.json(patients);
  });

  app.get(api.patients.get.path, async (req: any, res) => {
    const patient = await storage.getPatient(Number(req.params.id), DEFAULT_USER_ID);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  });

  app.post(api.patients.create.path, async (req: any, res) => {
    try {
      const input = api.patients.create.input.parse(req.body);
      const patient = await storage.createPatient({ ...input, userId: DEFAULT_USER_ID });
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.patch(api.patients.update.path, async (req: any, res) => {
    try {
      const input = api.patients.update.input.parse(req.body);
      const patient = await storage.updatePatient(Number(req.params.id), DEFAULT_USER_ID, input);
      if (!patient) return res.status(404).json({ message: "Patient not found" });
      res.json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.patients.delete.path, async (req: any, res) => {
    await storage.deletePatient(Number(req.params.id), DEFAULT_USER_ID);
    res.status(204).end();
  });

  // Charts API
  app.get(api.charts.listByPatient.path, async (req: any, res) => {
    const charts = await storage.getChartsByPatient(Number(req.params.patientId), DEFAULT_USER_ID);
    res.json(charts);
  });

  app.get(api.charts.get.path, async (req: any, res) => {
    const chart = await storage.getChart(Number(req.params.id), DEFAULT_USER_ID);
    if (!chart) return res.status(404).json({ message: "Chart not found" });
    res.json(chart);
  });

  app.post(api.charts.create.path, async (req: any, res) => {
    try {
      const bodySchema = api.charts.create.input.extend({
        patientId: z.coerce.number()
      });
      const input = bodySchema.parse(req.body);
      const chart = await storage.createChart({ ...input, userId: DEFAULT_USER_ID });
      res.status(201).json(chart);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.patch(api.charts.update.path, async (req: any, res) => {
    try {
      const input = api.charts.update.input.parse(req.body);
      const chart = await storage.updateChart(Number(req.params.id), DEFAULT_USER_ID, input);
      if (!chart) return res.status(404).json({ message: "Chart not found" });
      res.json(chart);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // AI Analysis endpoint
  app.post(api.charts.analyze.path, async (req: any, res) => {
    const userId = DEFAULT_USER_ID;
    const chartId = Number(req.params.id);
    
    const chart = await storage.getChart(chartId, userId);
    if (!chart) return res.status(404).json({ message: "Chart not found" });
    
    const patient = await storage.getPatient(chart.patientId, userId);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const prompt = `
    Analyze the following patient encounter to provide a medical assessment.
    
    Patient Info:
    Age: ${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
    Gender: ${patient.gender}
    Medical History: ${patient.medicalHistory || 'None provided'}
    Current Medications: ${patient.currentMedications || 'None provided'}
    Allergies: ${patient.allergies || 'None provided'}

    Encounter Info:
    Chief Complaint: ${chart.chiefComplaint}
    Symptoms: ${chart.symptoms}
    Vitals: ${JSON.stringify(chart.vitals || {})}

    Provide a JSON response with the following structure:
    {
      "possibleConditions": ["condition1", "condition2"],
      "recommendedTests": ["test1", "test2"],
      "suggestedTreatments": ["treatment1", "treatment2"],
      "redFlags": ["flag1", "flag2"],
      "summary": "A brief clinical summary"
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0]?.message?.content || "{}");
      
      const updatedChart = await storage.updateChartAnalysis(chartId, userId, analysis);
      res.json(updatedChart);
    } catch (error) {
      console.error("AI Analysis error:", error);
      res.status(500).json({ message: "Failed to generate AI analysis" });
    }
  });

  return httpServer;
}
