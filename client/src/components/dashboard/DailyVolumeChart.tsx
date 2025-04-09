import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStats } from "@/lib/hooks/useStats";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Generate simulated daily volume data
const generateDailyVolumeData = (days: number, averageVolume: number) => {
  const result = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Add fluctuation based on day of week (weekend lower, midweek higher)
    const dayFactor = date.getDay() === 0 || date.getDay() === 6 
      ? 0.7 + Math.random() * 0.4  // weekend
      : 0.9 + Math.random() * 0.8;  // weekday
    
    const value = Math.round(averageVolume * dayFactor);
    
    result.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: value
    });
  }
  
  return result;
};

type DailyVolumeChartProps = {
  className?: string;
};

const DailyVolumeChart = ({ className }: DailyVolumeChartProps) => {
  const { data: stats, isLoading } = useStats();
  const [period, setPeriod] = useState<"7d" | "14d" | "30d">("7d");
  
  const days = period === "7d" ? 7 : period === "14d" ? 14 : 30;
  
  // Calculate average daily volume
  const avgDailyVolume = stats && stats.totalVolume 
    ? Math.round(stats.totalVolume / 30) 
    : 100;
  
  // Generate chart data
  const volumeData = generateDailyVolumeData(days, avgDailyVolume);

  return (
    <Card className={`bg-[#2C2F33] border-[#36393F] text-white ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Daily Volume</CardTitle>
            <CardDescription className="text-[#99AAB5]">
              Transaction volume by day
            </CardDescription>
          </div>
          
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
      </CardHeader>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading chart data...</p>
        </div>
      ) : (
        <CardContent className="p-1">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
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
                  borderColor: "#7289DA",
                  color: "#FFFFFF"
                }}
                labelStyle={{ color: "#FFFFFF" }}
                formatter={(value: any) => [`$${value}`, 'Volume']}
              />
              <Legend />
              <Bar
                name="USD Volume"
                dataKey="volume"
                fill="#7289DA"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      )}
    </Card>
  );
};

export default DailyVolumeChart;