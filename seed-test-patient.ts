import "dotenv/config";
import { db } from "./server/db";
import { patients } from "./shared/schema";
import { users } from "./shared/models/auth";
import { sql } from "drizzle-orm";

async function seedTestPatient() {
  try {
    console.log("Creating test user...");
    
    // Create test user
    const testUser = await db.insert(users).values({
      id: "default-provider-id",
      email: "doctor@test.com",
    }).returning().catch(async () => {
      // If user already exists, just fetch it
      const existing = await db.select().from(users).where(sql`id = 'default-provider-id'`);
      return existing;
    });

    console.log("✅ Test user ready!");
    console.log("User ID:", testUser[0].id);

    console.log("\nAdding test patient...");
    
    const testPatient = await db.insert(patients).values({
      userId: "default-provider-id",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1990-01-15",
      gender: "Male",
      medicalHistory: "No significant medical history",
      currentMedications: "None",
      allergies: "Penicillin",
      isApprovedByDoctor: true,
    }).returning();

    console.log("✅ Test patient added successfully!");
    console.log("Patient ID:", testPatient[0].id);
    console.log("Name:", `${testPatient[0].firstName} ${testPatient[0].lastName}`);
    console.log("DOB:", testPatient[0].dateOfBirth);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedTestPatient();
