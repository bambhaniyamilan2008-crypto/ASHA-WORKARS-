// Reference: javascript_database and javascript_auth_all_persistance integrations
import { 
  users, 
  families, 
  familyMembers, 
  healthConditions, 
  pregnancyRecords, 
  vaccinationRecords, 
  medicalCheckups,
  type User, 
  type InsertUser,
  type Family,
  type InsertFamily,
  type FamilyMember,
  type InsertFamilyMember
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, or, like, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Family management
  getFamilies(): Promise<Family[]>;
  getFamilyById(id: string): Promise<Family | undefined>;
  createFamily(family: InsertFamily, userId: string): Promise<Family>;
  searchFamilies(query: string): Promise<Family[]>;
  
  // Family member management
  getFamilyMembers(familyId: string): Promise<FamilyMember[]>;
  createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    totalFamilies: number;
    totalMembers: number;
    pregnantWomen: number;
    childrenUnder5: number;
    tbPatients: number;
    diabetesPatients: number;
    hypertensionPatients: number;
    seniorCitizens: number;
  }>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getFamilies(): Promise<Family[]> {
    return await db.select().from(families).orderBy(desc(families.createdAt));
  }

  async getFamilyById(id: string): Promise<Family | undefined> {
    const [family] = await db.select().from(families).where(eq(families.id, id));
    return family || undefined;
  }

  async createFamily(family: InsertFamily, userId: string): Promise<Family> {
    const [newFamily] = await db
      .insert(families)
      .values({
        ...family,
        createdBy: userId,
      })
      .returning();
    return newFamily;
  }

  async searchFamilies(query: string): Promise<Family[]> {
    return await db
      .select()
      .from(families)
      .where(
        or(
          like(families.headOfFamily, `%${query}%`),
          like(families.householdId, `%${query}%`),
          like(families.wardNumber, `%${query}%`),
          like(families.address, `%${query}%`)
        )
      )
      .orderBy(desc(families.createdAt));
  }

  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    return await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.familyId, familyId))
      .orderBy(familyMembers.age);
  }

  async createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    const [newMember] = await db
      .insert(familyMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async getDashboardStats() {
    // Get total families
    const [familyCount] = await db
      .select({ count: count(families.id) })
      .from(families);

    // Get total members
    const [memberCount] = await db
      .select({ count: count(familyMembers.id) })
      .from(familyMembers);

    // Get pregnant women count
    const [pregnantCount] = await db
      .select({ count: count(pregnancyRecords.id) })
      .from(pregnancyRecords)
      .where(eq(pregnancyRecords.status, 'active'));

    // Get children under 5
    const [childrenCount] = await db
      .select({ count: count(familyMembers.id) })
      .from(familyMembers)
      .where(and(
        sql`${familyMembers.age} < 5`,
        sql`${familyMembers.age} >= 0`
      ));

    // Get disease counts
    const [tbCount] = await db
      .select({ count: count(healthConditions.id) })
      .from(healthConditions)
      .where(and(
        eq(healthConditions.condition, 'tb'),
        eq(healthConditions.status, 'active')
      ));

    const [diabetesCount] = await db
      .select({ count: count(healthConditions.id) })
      .from(healthConditions)
      .where(and(
        eq(healthConditions.condition, 'diabetes'),
        eq(healthConditions.status, 'active')
      ));

    const [hypertensionCount] = await db
      .select({ count: count(healthConditions.id) })
      .from(healthConditions)
      .where(and(
        eq(healthConditions.condition, 'hypertension'),
        eq(healthConditions.status, 'active')
      ));

    // Get senior citizens (65+)
    const [seniorCount] = await db
      .select({ count: count(familyMembers.id) })
      .from(familyMembers)
      .where(sql`${familyMembers.age} >= 65`);

    return {
      totalFamilies: familyCount.count,
      totalMembers: memberCount.count,
      pregnantWomen: pregnantCount.count,
      childrenUnder5: childrenCount.count,
      tbPatients: tbCount.count,
      diabetesPatients: diabetesCount.count,
      hypertensionPatients: hypertensionCount.count,
      seniorCitizens: seniorCount.count,
    };
  }
}

export const storage = new DatabaseStorage();