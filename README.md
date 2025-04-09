# Crypto Dashboard

A Discord-integrated admin dashboard for managing cryptocurrency payments with automated status updates. This application allows crypto payment monitoring across multiple networks, with network-specific transaction notifications and an intuitive management interface.

![Crypto Dashboard Screenshot](https://i.imgur.com/example.png)

## Features

- **Multi-cryptocurrency Support**: Manage BTC, ETH, LTC, USDT, and USDC transactions
- **Multi-network Support**: Automatically select appropriate networks for each cryptocurrency
- **Discord Integration**: Receive real-time payment notifications through Discord webhooks
- **Automated Status Handling**: Transactions default to "pending" status when created
- **Wallet Management**: Track payments across multiple wallet addresses
- **Visual Analytics**: Monitor transaction volume and growth through interactive charts
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Technical Overview

### Architecture

The application follows a modern web application architecture:

- **Frontend**: React with TypeScript
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Query for server state
- **Design System**: Tailwind CSS with shadcn/ui
- **Authentication**: Discord OAuth (future implementation)

### Key Components

#### 1. Transaction Management System

The transaction system provides a robust way to track cryptocurrency payments:

```typescript
// Transaction schema (simplified)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull(),
  network: text("network"),
  status: text("status").notNull(), // completed, pending, failed
  walletId: integer("wallet_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

Each transaction includes:
- A unique transaction ID
- Amount and currency
- Network (automatically selected based on currency)
- Status (defaults to "pending")
- Associated wallet
- Timestamps

#### 2. Network Auto-Selection

The dashboard intelligently selects the appropriate network based on the chosen cryptocurrency:

```typescript
// Auto-select network based on currency
if (value === "USDT") {
  form.setValue("network", "ethereum");
} else if (value === "USDC") {
  form.setValue("network", "arbitrum_usdc");
} else if (value === "BTC") {
  form.setValue("network", "mainnet");
} else if (value === "ETH") {
  form.setValue("network", "ethereum");
} else if (value === "LTC") {
  form.setValue("network", "mainnet");
}
```

#### 3. Automatic Status Handling

New transactions automatically receive a "pending" status:

```typescript
// In the database layer
async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
  const now = new Date();
  const [transaction] = await db
    .insert(transactions)
    .values({
      ...insertTransaction,
      status: insertTransaction.status || "pending",
      createdAt: now,
      updatedAt: now
    })
    .returning();
  return transaction;
}
```

#### 4. Analytics Dashboard

The dashboard provides real-time analytics on transaction activity:

##### Daily Volume Chart

The daily volume chart shows the actual number of transactions per day, not averages:

```typescript
// Sample implementation for daily volume data
const getActualDailyTransactions = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  // Initialize all days with zero transactions
  const dailyData = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(thirtyDaysAgo.getDate() + i);
    dailyData.push({
      date: format(date, 'MMM dd'),
      transactions: 0  // Default to 0 transactions
    });
  }
  
  // Map actual transactions to days
  transactions.forEach(txn => {
    const txnDate = new Date(txn.createdAt);
    if (txnDate >= thirtyDaysAgo && txnDate <= today) {
      const dayIndex = Math.floor((txnDate.getTime() - thirtyDaysAgo.getTime()) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < 30) {
        dailyData[dayIndex].transactions += 1;
      }
    }
  });
  
  return dailyData;
};
```

This implementation ensures that each day shows the exact number of transactions that occurred, with zero values for days without transactions.

## Installation and Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL database

### Setup Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Aerucodes/Crypto-Dashboard.git
   cd Crypto-Dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your database by setting the `DATABASE_URL` environment variable:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/crypto_dashboard
   ```

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Access the dashboard at `http://localhost:5000`

## Discord Webhook Integration

The dashboard integrates with Discord to send automatic notifications for transaction status changes:

1. Create a webhook in your Discord server
2. Configure the webhook URL in the dashboard settings
3. Customize which transaction states trigger notifications (pending, completed, failed)

## Future Enhancements

- **Discord Authentication**: Allow users to authenticate via Discord
- **Multiple Discord Servers**: Support for sending notifications to different Discord servers
- **Transaction Confirmation Tracking**: Auto-update status based on blockchain confirmations
- **Enhanced Analytics**: More detailed reporting and export capabilities

## License

MIT License