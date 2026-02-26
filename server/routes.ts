import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Authentication removed as requested

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

  // mark patient analysis as approved by doctor
  app.patch(`${api.patients.get.path}/approve`, async (req: any, res) => {
    const patientId = Number(req.params.id);
    const updated = await storage.updatePatientApproval(patientId, DEFAULT_USER_ID);
    if (!updated) return res.status(404).json({ message: "Patient not found" });
    res.json(updated);
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

    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

    const prompt = `You are an experienced clinical AI assistant helping doctors with patient diagnosis and treatment planning. Provide a comprehensive medical analysis based on the patient information below.

IMPORTANT: Always format your response as valid JSON with the exact structure specified, with no additional text before or after the JSON.

Patient Information:
- Name: ${patient.firstName} ${patient.lastName}
- Age: ${age} years old
- Gender: ${patient.gender}
- Medical History: ${patient.medicalHistory || 'Not provided'}
- Current Medications: ${patient.currentMedications || 'None reported'}
- Allergies: ${patient.allergies || 'None reported'}

Current Encounter:
- Chief Complaint: ${chart.chiefComplaint}
- Symptoms: ${chart.symptoms}
- Vitals: ${chart.vitals ? JSON.stringify(chart.vitals) : 'Not recorded'}

Please analyze this patient encounter and provide your assessment in the following JSON format only:
{
  "possibleConditions": ["condition1 (likelihood assessment)", "condition2 (likelihood assessment)"],
  "recommendedTests": ["specific test 1 with rationale", "specific test 2 with rationale"],
  "suggestedTreatments": ["treatment option 1", "treatment option 2", "treatment option 3"],
  "redFlags": ["warning sign 1 requiring immediate attention", "warning sign 2"],
  "summary": "A comprehensive clinical summary including differential diagnosis, key findings, and next steps for the doctor to consider"
}`;

    try {
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      
      // Clean up the response if it has markdown code blocks
      let jsonText = text;
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0].trim();
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0].trim();
      }
      
      const analysis = JSON.parse(jsonText);
      
      const updatedChart = await storage.updateChartAnalysis(chartId, userId, analysis);
      res.json(updatedChart);
    } catch (error) {
      console.error("AI Analysis error:", error);
      res.status(500).json({ message: "Failed to generate AI analysis" });
    }
  });

  return httpServer;
}
