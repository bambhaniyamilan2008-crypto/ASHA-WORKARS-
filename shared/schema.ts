import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table for ASHA workers
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  village: text("village"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Families table
export const families = pgTable("families", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  householdId: text("household_id").notNull().unique(), // QR code ID
  headOfFamily: text("head_of_family").notNull(),
  address: text("address").notNull(),
  wardNumber: text("ward_number"),
  phoneNumber: text("phone_number"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Family members table
export const familyMembers = pgTable("family_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: varchar("family_id").references(() => families.id).notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // 'male', 'female', 'other'
  relationship: text("relationship").notNull(), // 'head', 'spouse', 'child', 'parent', 'other'
  idProofType: text("id_proof_type"), // 'aadhar', 'voter_id', 'ration_card', 'other'
  idProofNumber: text("id_proof_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Health conditions table
export const healthConditions = pgTable("health_conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").references(() => familyMembers.id).notNull(),
  condition: text("condition").notNull(), // 'pregnancy', 'tb', 'diabetes', 'hypertension', 'other'
  status: text("status").notNull(), // 'active', 'resolved', 'monitoring'
  diagnosedDate: date("diagnosed_date"),
  notes: text("notes"),
  severity: text("severity"), // 'low', 'medium', 'high'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Pregnancy records
export const pregnancyRecords = pgTable("pregnancy_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").references(() => familyMembers.id).notNull(),
  lmp: date("lmp"), // Last menstrual period
  edd: date("edd"), // Expected delivery date
  gravida: integer("gravida"), // Number of pregnancies
  para: integer("para"), // Number of deliveries
  isHighRisk: boolean("is_high_risk").default(false),
  riskFactors: jsonb("risk_factors"), // Array of risk factors
  ancVisits: integer("anc_visits").default(0),
  deliveryDate: date("delivery_date"),
  status: text("status").notNull().default('active'), // 'active', 'delivered', 'terminated'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vaccination records
export const vaccinationRecords = pgTable("vaccination_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").references(() => familyMembers.id).notNull(),
  vaccineName: text("vaccine_name").notNull(),
  doseNumber: integer("dose_number").notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  administeredDate: date("administered_date"),
  status: text("status").notNull().default('scheduled'), // 'scheduled', 'administered', 'missed', 'contraindicated'
  administeredBy: text("administered_by"),
  batchNumber: text("batch_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Medical checkups
export const medicalCheckups = pgTable("medical_checkups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").references(() => familyMembers.id).notNull(),
  checkupType: text("checkup_type").notNull(), // 'anc', 'pnc', 'child_growth', 'general', 'disease_followup'
  checkupDate: date("checkup_date").notNull(),
  height: integer("height"), // in cm
  weight: integer("weight"), // in grams for infants, kg for others
  bloodPressure: text("blood_pressure"),
  temperature: text("temperature"),
  findings: text("findings"),
  recommendations: text("recommendations"),
  nextVisitDate: date("next_visit_date"),
  performedBy: varchar("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reports
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  reportType: text("report_type").notNull(), // 'monthly', 'weekly', 'quarterly', 'custom'
  dateFrom: date("date_from").notNull(),
  dateTo: date("date_to").notNull(),
  data: jsonb("data").notNull(), // Report data in JSON format
  generatedBy: varchar("generated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Games for skill building and education
export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // 'math', 'muldwarka', 'panadar', 'chara', 'damli'
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'educational', 'health', 'cultural'
  difficulty: text("difficulty").notNull().default('beginner'), // 'beginner', 'intermediate', 'advanced'
  instructions: text("instructions").notNull(),
  gameData: jsonb("game_data"), // Game-specific configuration
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User game progress tracking
export const gameProgress = pgTable("game_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameId: varchar("game_id").references(() => games.id).notNull(),
  level: integer("level").default(1),
  score: integer("score").default(0),
  highScore: integer("high_score").default(0),
  timesPlayed: integer("times_played").default(0),
  totalTimeSpent: integer("total_time_spent").default(0), // in seconds
  lastPlayedAt: timestamp("last_played_at"),
  achievements: jsonb("achievements"), // Array of achievement IDs
  progressData: jsonb("progress_data"), // Game-specific progress
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Game sessions for detailed tracking
export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameId: varchar("game_id").references(() => games.id).notNull(),
  score: integer("score").notNull(),
  level: integer("level").notNull(),
  duration: integer("duration").notNull(), // in seconds
  completed: boolean("completed").default(false),
  sessionData: jsonb("session_data"), // Game-specific session data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const familiesRelations = relations(families, ({ many, one }) => ({
  members: many(familyMembers),
  createdBy: one(users, {
    fields: [families.createdBy],
    references: [users.id],
  }),
}));

export const familyMembersRelations = relations(familyMembers, ({ one, many }) => ({
  family: one(families, {
    fields: [familyMembers.familyId],
    references: [families.id],
  }),
  healthConditions: many(healthConditions),
  pregnancyRecords: many(pregnancyRecords),
  vaccinationRecords: many(vaccinationRecords),
  medicalCheckups: many(medicalCheckups),
}));

export const healthConditionsRelations = relations(healthConditions, ({ one }) => ({
  member: one(familyMembers, {
    fields: [healthConditions.memberId],
    references: [familyMembers.id],
  }),
}));

export const pregnancyRecordsRelations = relations(pregnancyRecords, ({ one }) => ({
  member: one(familyMembers, {
    fields: [pregnancyRecords.memberId],
    references: [familyMembers.id],
  }),
}));

export const vaccinationRecordsRelations = relations(vaccinationRecords, ({ one }) => ({
  member: one(familyMembers, {
    fields: [vaccinationRecords.memberId],
    references: [familyMembers.id],
  }),
}));

export const medicalCheckupsRelations = relations(medicalCheckups, ({ one }) => ({
  member: one(familyMembers, {
    fields: [medicalCheckups.memberId],
    references: [familyMembers.id],
  }),
  performedBy: one(users, {
    fields: [medicalCheckups.performedBy],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  generatedBy: one(users, {
    fields: [reports.generatedBy],
    references: [users.id],
  }),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  gameProgress: many(gameProgress),
  gameSessions: many(gameSessions),
}));

export const gameProgressRelations = relations(gameProgress, ({ one }) => ({
  user: one(users, {
    fields: [gameProgress.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [gameProgress.gameId],
    references: [games.id],
  }),
}));

export const gameSessionsRelations = relations(gameSessions, ({ one }) => ({
  user: one(users, {
    fields: [gameSessions.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [gameSessions.gameId],
    references: [games.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  phone: true,
  village: true,
});

export const insertFamilySchema = createInsertSchema(families).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHealthConditionSchema = createInsertSchema(healthConditions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPregnancyRecordSchema = createInsertSchema(pregnancyRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVaccinationRecordSchema = createInsertSchema(vaccinationRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicalCheckupSchema = createInsertSchema(medicalCheckups).omit({
  id: true,
  createdAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertGameProgressSchema = createInsertSchema(gameProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFamily = z.infer<typeof insertFamilySchema>;
export type Family = typeof families.$inferSelect;
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertHealthCondition = z.infer<typeof insertHealthConditionSchema>;
export type HealthCondition = typeof healthConditions.$inferSelect;
export type InsertPregnancyRecord = z.infer<typeof insertPregnancyRecordSchema>;
export type PregnancyRecord = typeof pregnancyRecords.$inferSelect;
export type InsertVaccinationRecord = z.infer<typeof insertVaccinationRecordSchema>;
export type VaccinationRecord = typeof vaccinationRecords.$inferSelect;
export type InsertMedicalCheckup = z.infer<typeof insertMedicalCheckupSchema>;
export type MedicalCheckup = typeof medicalCheckups.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGameProgress = z.infer<typeof insertGameProgressSchema>;
export type GameProgress = typeof gameProgress.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;