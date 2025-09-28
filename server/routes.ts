import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertFamilySchema, 
  insertFamilyMemberSchema,
  insertGameSchema,
  insertGameProgressSchema,
  insertGameSessionSchema
} from "@shared/schema";

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

  // Game management routes
  app.get("/api/games", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const game = await storage.getGameById(req.params.id);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ error: "Failed to fetch game" });
    }
  });

  app.post("/api/games", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const validatedData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(validatedData);
      res.status(201).json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(400).json({ error: "Failed to create game" });
    }
  });

  // Game progress routes
  app.get("/api/users/:userId/game-progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const progress = await storage.getUserGameProgress(req.params.userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching game progress:", error);
      res.status(500).json({ error: "Failed to fetch game progress" });
    }
  });

  app.get("/api/users/:userId/games/:gameId/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const progress = await storage.getGameProgress(req.params.userId, req.params.gameId);
      if (!progress) {
        return res.status(404).json({ error: "Game progress not found" });
      }
      res.json(progress);
    } catch (error) {
      console.error("Error fetching game progress:", error);
      res.status(500).json({ error: "Failed to fetch game progress" });
    }
  });

  app.post("/api/users/:userId/games/:gameId/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const progressData = {
        ...req.body,
        userId: req.params.userId,
        gameId: req.params.gameId,
      };
      const validatedData = insertGameProgressSchema.parse(progressData);
      const progress = await storage.createGameProgress(validatedData);
      res.status(201).json(progress);
    } catch (error) {
      console.error("Error creating game progress:", error);
      res.status(400).json({ error: "Failed to create game progress" });
    }
  });

  app.patch("/api/users/:userId/games/:gameId/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const updates = req.body;
      const progress = await storage.updateGameProgress(
        req.params.userId, 
        req.params.gameId, 
        updates
      );
      res.json(progress);
    } catch (error) {
      console.error("Error updating game progress:", error);
      res.status(400).json({ error: "Failed to update game progress" });
    }
  });

  // Game session routes
  app.post("/api/users/:userId/games/:gameId/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const sessionData = {
        ...req.body,
        userId: req.params.userId,
        gameId: req.params.gameId,
      };
      const validatedData = insertGameSessionSchema.parse(sessionData);
      const session = await storage.createGameSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating game session:", error);
      res.status(400).json({ error: "Failed to create game session" });
    }
  });

  app.get("/api/users/:userId/game-sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { gameId } = req.query;
      const sessions = await storage.getUserGameSessions(
        req.params.userId, 
        gameId as string | undefined
      );
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching game sessions:", error);
      res.status(500).json({ error: "Failed to fetch game sessions" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
