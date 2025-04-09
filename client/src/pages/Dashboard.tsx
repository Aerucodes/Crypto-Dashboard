import { useState } from "react";
import { useStats } from "@/lib/hooks/useStats";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useWallets } from "@/lib/hooks/useWallets";
import { useCreateWallet, useUpdateWallet } from "@/lib/hooks/useWallets";
import { useBotSettings, useUpdateBotSettings } from "@/lib/hooks/useBotSettings";
import { useWebhookConfig, useUpdateWebhookConfig } from "@/lib/hooks/useWebhook";

import StatsCard from "@/components/dashboard/StatsCard";
import TransactionTable from "@/components/dashboard/TransactionTable";
import DiscordPreview from "@/components/dashboard/DiscordPreview";
import WalletManager from "@/components/dashboard/WalletManager";
import BotSettings from "@/components/dashboard/BotSettings";
import GrowthChart from "@/components/dashboard/GrowthChart";
import DailyVolumeChart from "@/components/dashboard/DailyVolumeChart";

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const pageSize = 4;

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(pageSize, (currentPage - 1) * pageSize, selectedCurrency || undefined);
  const { data: wallets, isLoading: walletsLoading } = useWallets();
  const { data: botSettings, isLoading: botSettingsLoading } = useBotSettings();
  const { data: webhookConfig, isLoading: webhookConfigLoading } = useWebhookConfig();

  // Mutations
  const createWalletMutation = useCreateWallet();
  const updateWalletMutation = useUpdateWallet();
  const updateBotSettingsMutation = useUpdateBotSettings();
  const updateWebhookConfigMutation = useUpdateWebhookConfig();

  // Handle wallet actions
  const handleAddWallet = async (data: any) => {
    await createWalletMutation.mutateAsync(data);
  };

  const handleEditWallet = async (id: number, data: any) => {
    await updateWalletMutation.mutateAsync({ id, data });
  };

  // Handle bot settings update
  const handleUpdateBotSettings = async (data: any) => {
    await updateBotSettingsMutation.mutateAsync(data);
  };

  // Handle webhook config update
  const handleUpdateWebhookConfig = async (data: any) => {
    await updateWebhookConfigMutation.mutateAsync(data);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle currency filter
  const handleCurrencyFilter = (currency: string | null) => {
    setSelectedCurrency(currency);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Transactions"
          value={statsLoading ? "Loading..." : stats?.totalTransactions.toString() || "0"}
          change={statsLoading ? "..." : stats?.transactionsGrowth || "0%"}
          icon={
            <svg className="h-6 w-6 text-[#7289DA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          iconBgColor="bg-[#7289DA]"
        />
        
        <StatsCard
          title="Total Volume (USD)"
          value={statsLoading ? "Loading..." : `$${stats?.totalVolume.toString() || "0"}`}
          change={statsLoading ? "..." : stats?.volumeGrowth || "0%"}
          icon={
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBgColor="bg-green-500"
        />
        
        <StatsCard
          title="Active Wallets"
          value={statsLoading ? "Loading..." : stats?.activeWallets.toString() || "0"}
          change={statsLoading ? "..." : `${stats?.walletsGrowth || "0"} new`}
          icon={
            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
          iconBgColor="bg-blue-500"
        />
        
        <StatsCard
          title="Webhook Calls"
          value={statsLoading ? "Loading..." : stats?.webhookCalls.toString() || "0"}
          change={statsLoading ? "..." : stats?.webhooksGrowth || "0%"}
          icon={
            <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          iconBgColor="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GrowthChart />
        <DailyVolumeChart />
      </div>

      {/* Transactions and Discord Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <TransactionTable
            transactions={transactionsData?.transactions || []}
            total={transactionsData?.pagination.total || 0}
            loading={transactionsLoading}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onCurrencyFilter={handleCurrencyFilter}
            selectedCurrency={selectedCurrency}
          />
        </div>
        
        <div className="lg:col-span-1">
          <DiscordPreview />
        </div>
      </div>

      {/* Wallet Management and Bot Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WalletManager
          wallets={wallets || []}
          isLoading={walletsLoading}
          onAddWallet={handleAddWallet}
          onEditWallet={handleEditWallet}
        />
        
        <BotSettings
          botSettings={botSettings}
          webhookConfig={webhookConfig}
          isLoading={botSettingsLoading || webhookConfigLoading}
          onUpdateBotSettings={handleUpdateBotSettings}
          onUpdateWebhookConfig={handleUpdateWebhookConfig}
        />
      </div>
    </>
  );
};

export default Dashboard;
