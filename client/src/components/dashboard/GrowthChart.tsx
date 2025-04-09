import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStats } from "@/lib/hooks/useStats";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Sample data for the demo, this would typically come from the API
const generateLastDaysData = (days: number, initialValue: number, growth: string) => {
  const growthRate = parseFloat(growth) / 100;
  const result = [];
  const now = new Date();
  
  let currentValue = initialValue / (1 + growthRate) * (1 - growthRate * days / 30);
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Add some random fluctuation
    const randomFactor = 0.9 + Math.random() * 0.2;
    const dailyValue = Math.round(currentValue * randomFactor * 100) / 100;
    
    result.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: dailyValue
    });
    
    // Increase value based on growth rate
    currentValue = currentValue * (1 + growthRate / days);
  }
  
  return result;
};

// Generate simulated data for USD volume
const generateUsdVolumeData = (days: number, totalVolume: number, growth: string) => {
  const data = generateLastDaysData(days, totalVolume, growth);
  return data.map(item => ({
    ...item,
    usd: item.value
  }));
};

type GrowthChartProps = {
  className?: string;
};

const GrowthChart = ({ className }: GrowthChartProps) => {
  const [period, setPeriod] = useState<"7d" | "14d" | "30d">("7d");
  const { data: stats, isLoading } = useStats();
  
  const days = period === "7d" ? 7 : period === "14d" ? 14 : 30;
  
  // Generate chart data based on stats
  const transactionData = stats 
    ? generateLastDaysData(days, stats.totalTransactions, stats.transactionsGrowth)
    : [];
  
  const volumeData = stats 
    ? generateUsdVolumeData(days, stats.totalVolume, stats.volumeGrowth)
    : [];

  return (
    <Card className={`bg-[#2C2F33] border-[#36393F] text-white ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle>Growth & Performance</CardTitle>
        <CardDescription className="text-[#99AAB5]">
          View transaction and volume trends over time
        </CardDescription>
        <Tabs defaultValue="transactions" className="mt-2">
          <div className="flex justify-between items-center">
            <TabsList className="bg-[#36393F]">
              <TabsTrigger value="transactions" className="data-[state=active]:bg-[#7289DA]">Transactions</TabsTrigger>
              <TabsTrigger value="volume" className="data-[state=active]:bg-[#7289DA]">Volume (USD)</TabsTrigger>
            </TabsList>
            
            <div className="flex space-x-1 text-xs">
              <button 
                onClick={() => setPeriod("7d")} 
                className={`px-2 py-1 rounded ${period === "7d" ? "bg-[#7289DA]" : "bg-[#36393F]"}`}
              >
                7D
              </button>
              <button 
                onClick={() => setPeriod("14d")} 
                className={`px-2 py-1 rounded ${period === "14d" ? "bg-[#7289DA]" : "bg-[#36393F]"}`}
              >
                14D
              </button>
              <button 
                onClick={() => setPeriod("30d")} 
                className={`px-2 py-1 rounded ${period === "30d" ? "bg-[#7289DA]" : "bg-[#36393F]"}`}
              >
                30D
              </button>
            </div>
          </div>

          <TabsContent value="transactions" className="p-0 border-none">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading chart data...</p>
              </div>
            ) : (
              <CardContent className="p-1">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={transactionData}
                    margin={{
                      top: 20,
                      right: 10,
                      left: 10,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#36393F" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#99AAB5" 
                      tick={{ fill: "#99AAB5" }}
                    />
                    <YAxis 
                      stroke="#99AAB5" 
                      tick={{ fill: "#99AAB5" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#36393F", 
                        borderColor: "#7289DA",
                        color: "#FFFFFF"
                      }}
                      labelStyle={{ color: "#FFFFFF" }}
                    />
                    <Legend />
                    <Line
                      name="Transactions"
                      type="monotone"
                      dataKey="value"
                      stroke="#7289DA"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            )}
          </TabsContent>

          <TabsContent value="volume" className="p-0 border-none">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading chart data...</p>
              </div>
            ) : (
              <CardContent className="p-1">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={volumeData}
                    margin={{
                      top: 20,
                      right: 10,
                      left: 10,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#36393F" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#99AAB5" 
                      tick={{ fill: "#99AAB5" }}
                    />
                    <YAxis 
                      stroke="#99AAB5" 
                      tick={{ fill: "#99AAB5" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#36393F", 
                        borderColor: "#43B581",
                        color: "#FFFFFF"
                      }}
                      labelStyle={{ color: "#FFFFFF" }}
                      formatter={(value: any) => [`$${value}`, 'USD Value']}
                    />
                    <Legend />
                    <Line
                      name="USD Volume"
                      type="monotone"
                      dataKey="usd"
                      stroke="#43B581"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            )}
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default GrowthChart;