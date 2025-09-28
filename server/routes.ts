import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertFamilySchema, insertFamilyMemberSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Reference: javascript_auth_all_persistance integration
  setupAuth(app);

  // Dashboard statistics
  app.get("/api/dashboard-stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  // Family management routes
  app.get("/api/families", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { search } = req.query;
      let families;
      if (search && typeof search === 'string') {
        families = await storage.searchFamilies(search);
      } else {
        families = await storage.getFamilies();
      }
      res.json(families);
    } catch (error) {
      console.error("Error fetching families:", error);
      res.status(500).json({ error: "Failed to fetch families" });
    }
  });

  app.get("/api/families/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const family = await storage.getFamilyById(req.params.id);
      if (!family) {
        return res.status(404).json({ error: "Family not found" });
      }
      res.json(family);
    } catch (error) {
      console.error("Error fetching family:", error);
      res.status(500).json({ error: "Failed to fetch family" });
    }
  });

  app.post("/api/families", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const validatedData = insertFamilySchema.parse(req.body);
      const family = await storage.createFamily(validatedData, req.user!.id);
      res.status(201).json(family);
    } catch (error) {
      console.error("Error creating family:", error);
      res.status(400).json({ error: "Failed to create family" });
    }
  });

  // Family member management routes
  app.get("/api/families/:familyId/members", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const members = await storage.getFamilyMembers(req.params.familyId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching family members:", error);
      res.status(500).json({ error: "Failed to fetch family members" });
    }
  });

  app.post("/api/families/:familyId/members", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const memberData = {
        ...req.body,
        familyId: req.params.familyId,
      };
      const validatedData = insertFamilyMemberSchema.parse(memberData);
      const member = await storage.createFamilyMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error creating family member:", error);
      res.status(400).json({ error: "Failed to create family member" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
