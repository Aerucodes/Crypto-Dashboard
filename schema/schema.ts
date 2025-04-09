import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Wallet schema
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull().unique(),
  currency: text("currency").notNull(),
  network: text("network"), // ERC20, TRC20, BEP20, etc.
  discordUserId: text("discord_user_id"), // Discord user ID for authorization
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  name: true,
  address: true,
  currency: true,
  network: true,
  discordUserId: true,
  isActive: true,
});

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull(),
  network: text("network"), // ERC20, TRC20, BEP20, etc.
  confirmations: integer("confirmations"), // Current confirmations
  requiredConfirmations: integer("required_confirmations"), // Confirmations needed based on network
  status: text("status").notNull(), // completed, pending, failed
  walletId: integer("wallet_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  transactionId: true,
  amount: true,
  currency: true,
  network: true,
  confirmations: true,
  requiredConfirmations: true,
  walletId: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// WebhookConfig schema
export const webhookConfigs = pgTable("webhook_configs", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  notifySuccess: boolean("notify_success").notNull().default(true),
  notifyPending: boolean("notify_pending").notNull().default(true),
  notifyFailed: boolean("notify_failed").notNull().default(true),
  notifyWallet: boolean("notify_wallet").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWebhookConfigSchema = createInsertSchema(webhookConfigs).pick({
  url: true,
  notifySuccess: true,
  notifyPending: true,
  notifyFailed: true,
  notifyWallet: true,
});

export type InsertWebhookConfig = z.infer<typeof insertWebhookConfigSchema>;
export type WebhookConfig = typeof webhookConfigs.$inferSelect;

// BotSettings schema
export const botSettings = pgTable("bot_settings", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  bitcoinConfirmations: integer("bitcoin_confirmations").notNull().default(3),
  ethereumConfirmations: integer("ethereum_confirmations").notNull().default(15),
  litecoinConfirmations: integer("litecoin_confirmations").notNull().default(6),
  
  // Stablecoin network confirmations
  erc20Confirmations: integer("erc20_confirmations").notNull().default(12),
  trc20Confirmations: integer("trc20_confirmations").notNull().default(15),
  bep20Confirmations: integer("bep20_confirmations").notNull().default(10),
  polygonConfirmations: integer("polygon_confirmations").notNull().default(15),
  solanaConfirmations: integer("solana_confirmations").notNull().default(32),
  
  // Discord integration
  discordClientId: text("discord_client_id"),
  discordClientSecret: text("discord_client_secret"),
  discordRedirectUri: text("discord_redirect_uri"),
  discordGuildId: text("discord_guild_id"),
  
  // Documentation settings
  gitbookApiKey: text("gitbook_api_key"),
  gitbookSpaceId: text("gitbook_space_id"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).pick({
  token: true,
  bitcoinConfirmations: true,
  ethereumConfirmations: true,
  litecoinConfirmations: true,
  erc20Confirmations: true,
  trc20Confirmations: true,
  bep20Confirmations: true,
  polygonConfirmations: true,
  solanaConfirmations: true,
  discordClientId: true,
  discordClientSecret: true,
  discordRedirectUri: true,
  discordGuildId: true,
  gitbookApiKey: true,
  gitbookSpaceId: true,
});

export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;
export type BotSettings = typeof botSettings.$inferSelect;

// Stats schema
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  totalTransactions: integer("total_transactions").notNull().default(0),
  totalVolume: doublePrecision("total_volume").notNull().default(0),
  activeWallets: integer("active_wallets").notNull().default(0),
  webhookCalls: integer("webhook_calls").notNull().default(0),
  transactionsGrowth: text("transactions_growth").notNull().default("0%"),
  volumeGrowth: text("volume_growth").notNull().default("0%"),
  walletsGrowth: text("wallets_growth").notNull().default("0"),
  webhooksGrowth: text("webhooks_growth").notNull().default("0%"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStatsSchema = createInsertSchema(stats).pick({
  totalTransactions: true,
  totalVolume: true,
  activeWallets: true,
  webhookCalls: true,
  transactionsGrowth: true,
  volumeGrowth: true,
  walletsGrowth: true,
  webhooksGrowth: true,
});

export type InsertStats = z.infer<typeof insertStatsSchema>;
export type Stats = typeof stats.$inferSelect;
