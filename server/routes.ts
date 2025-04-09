import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./storage";
import { z } from "zod";
import { 
  insertWalletSchema, 
  insertTransactionSchema, 
  insertWebhookConfigSchema,
  insertBotSettingsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get the storage instance
  const storage = await getStorage();
  
  // Create an API router
  const apiRouter = express.Router();
  
  // Stats endpoint
  apiRouter.get("/stats", async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });
  
  // Wallet endpoints
  apiRouter.get("/wallets", async (req, res) => {
    const wallets = await storage.getWallets();
    res.json(wallets);
  });
  
  apiRouter.get("/wallets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid wallet ID" });
    }
    
    const wallet = await storage.getWalletById(id);
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    res.json(wallet);
  });
  
  apiRouter.post("/wallets", async (req, res) => {
    try {
      const walletData = insertWalletSchema.parse(req.body);
      
      // Check if wallet address already exists
      const existingWallet = await storage.getWalletByAddress(walletData.address);
      if (existingWallet) {
        return res.status(409).json({ message: "Wallet address already exists" });
      }
      
      const wallet = await storage.createWallet(walletData);
      
      // Update stats
      const stats = await storage.getStats();
      if (stats) {
        const activeWallets = (await storage.getWallets()).filter(w => w.isActive).length;
        await storage.updateStats({ activeWallets });
      }
      
      res.status(201).json(wallet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid wallet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create wallet" });
    }
  });
  
  apiRouter.patch("/wallets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid wallet ID" });
    }
    
    try {
      // Validate only the fields that are passed
      const walletData = insertWalletSchema.partial().parse(req.body);
      
      // Check if the wallet exists
      const existingWallet = await storage.getWalletById(id);
      if (!existingWallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Check for address uniqueness if updating address
      if (walletData.address) {
        const walletWithAddress = await storage.getWalletByAddress(walletData.address);
        if (walletWithAddress && walletWithAddress.id !== id) {
          return res.status(409).json({ message: "Wallet address already exists" });
        }
      }
      
      const updatedWallet = await storage.updateWallet(id, walletData);
      
      // Update stats if isActive changed
      if (walletData.isActive !== undefined) {
        const stats = await storage.getStats();
        if (stats) {
          const activeWallets = (await storage.getWallets()).filter(w => w.isActive).length;
          await storage.updateStats({ activeWallets });
        }
      }
      
      res.json(updatedWallet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid wallet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update wallet" });
    }
  });
  
  apiRouter.delete("/wallets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid wallet ID" });
    }
    
    // Check if the wallet exists
    const existingWallet = await storage.getWalletById(id);
    if (!existingWallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    const result = await storage.deleteWallet(id);
    
    // Update stats
    const stats = await storage.getStats();
    if (stats) {
      const activeWallets = (await storage.getWallets()).filter(w => w.isActive).length;
      await storage.updateStats({ activeWallets });
    }
    
    res.json({ success: result });
  });
  
  // Transaction endpoints
  apiRouter.get("/transactions", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const currency = req.query.currency as string | undefined;
    
    let transactions;
    if (currency) {
      transactions = await storage.getTransactionsByCurrency(currency);
      // Apply limit and offset manually for filtered results
      transactions = transactions.slice(offset, offset + limit);
    } else {
      transactions = await storage.getTransactions(limit, offset);
    }
    
    const count = await storage.countTransactions();
    
    res.json({
      transactions,
      pagination: {
        total: count,
        limit,
        offset
      }
    });
  });
  
  apiRouter.get("/transactions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    
    const transaction = await storage.getTransactionById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    res.json(transaction);
  });
  
  apiRouter.post("/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Check if transaction ID already exists
      const existingTransaction = await storage.getTransactionByTransactionId(transactionData.transactionId);
      if (existingTransaction) {
        return res.status(409).json({ message: "Transaction ID already exists" });
      }
      
      // Check if wallet exists
      const wallet = await storage.getWalletById(transactionData.walletId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      const transaction = await storage.createTransaction(transactionData);
      
      // Update stats
      const stats = await storage.getStats();
      if (stats) {
        await storage.updateStats({ 
          totalTransactions: stats.totalTransactions + 1,
          totalVolume: stats.totalVolume + transactionData.amount
        });
      }
      
      // If webhook notifications are enabled, increment the count
      // In a real app, this would send an actual webhook notification
      await storage.incrementWebhookCalls();
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });
  
  apiRouter.patch("/transactions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    
    try {
      // Validate only the fields that are passed
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      
      // Check if the transaction exists
      const existingTransaction = await storage.getTransactionById(id);
      if (!existingTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Check if walletId exists if it's being updated
      if (transactionData.walletId !== undefined) {
        const wallet = await storage.getWalletById(transactionData.walletId);
        if (!wallet) {
          return res.status(404).json({ message: "Wallet not found" });
        }
      }
      
      const updatedTransaction = await storage.updateTransaction(id, transactionData);
      
      // If status is changing, potentially send a webhook
      if (transactionData.status && transactionData.status !== existingTransaction.status) {
        // In a real app, this would send an actual webhook notification
        await storage.incrementWebhookCalls();
      }
      
      res.json(updatedTransaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });
  
  // Webhook configuration endpoints
  apiRouter.get("/webhook-config", async (req, res) => {
    const config = await storage.getWebhookConfig();
    if (!config) {
      return res.status(404).json({ message: "Webhook configuration not found" });
    }
    res.json(config);
  });
  
  apiRouter.post("/webhook-config", async (req, res) => {
    try {
      const configData = insertWebhookConfigSchema.parse(req.body);
      
      // Check if config already exists - there should be only one
      const existingConfig = await storage.getWebhookConfig();
      if (existingConfig) {
        const updatedConfig = await storage.updateWebhookConfig(existingConfig.id, configData);
        return res.json(updatedConfig);
      }
      
      const config = await storage.createWebhookConfig(configData);
      res.status(201).json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid webhook configuration", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save webhook configuration" });
    }
  });
  
  apiRouter.patch("/webhook-config", async (req, res) => {
    try {
      // Validate only the fields that are passed
      const configData = insertWebhookConfigSchema.partial().parse(req.body);
      
      // Get the current config
      const existingConfig = await storage.getWebhookConfig();
      if (!existingConfig) {
        return res.status(404).json({ message: "Webhook configuration not found" });
      }
      
      const updatedConfig = await storage.updateWebhookConfig(existingConfig.id, configData);
      res.json(updatedConfig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid webhook configuration", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update webhook configuration" });
    }
  });
  
  // Bot settings endpoints
  apiRouter.get("/bot-settings", async (req, res) => {
    const settings = await storage.getBotSettings();
    if (!settings) {
      return res.status(404).json({ message: "Bot settings not found" });
    }
    
    // Don't expose the actual token in the response
    const settingsWithoutToken = {
      ...settings,
      token: settings.token ? "••••••••••••••••••••••••••" : null
    };
    
    res.json(settingsWithoutToken);
  });
  
  apiRouter.post("/bot-settings", async (req, res) => {
    try {
      const settingsData = insertBotSettingsSchema.parse(req.body);
      
      // Check if settings already exist - there should be only one
      const existingSettings = await storage.getBotSettings();
      if (existingSettings) {
        const updatedSettings = await storage.updateBotSettings(existingSettings.id, settingsData);
        
        // Don't expose the actual token in the response
        const settingsWithoutToken = {
          ...updatedSettings,
          token: updatedSettings?.token ? "••••••••••••••••••••••••••" : null
        };
        
        return res.json(settingsWithoutToken);
      }
      
      const settings = await storage.createBotSettings(settingsData);
      
      // Don't expose the actual token in the response
      const settingsWithoutToken = {
        ...settings,
        token: settings.token ? "••••••••••••••••••••••••••" : null
      };
      
      res.status(201).json(settingsWithoutToken);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bot settings", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save bot settings" });
    }
  });
  
  apiRouter.patch("/bot-settings", async (req, res) => {
    try {
      // Validate only the fields that are passed
      const settingsData = insertBotSettingsSchema.partial().parse(req.body);
      
      // Get the current settings
      const existingSettings = await storage.getBotSettings();
      if (!existingSettings) {
        return res.status(404).json({ message: "Bot settings not found" });
      }
      
      const updatedSettings = await storage.updateBotSettings(existingSettings.id, settingsData);
      
      // Don't expose the actual token in the response
      const settingsWithoutToken = {
        ...updatedSettings,
        token: updatedSettings?.token ? "••••••••••••••••••••••••••" : null
      };
      
      res.json(settingsWithoutToken);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bot settings", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update bot settings" });
    }
  });
  
  // Use the API router for all /api routes
  app.use("/api", apiRouter);

  // Create and return the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
