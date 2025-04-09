type StatCardProps = {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  iconBgColor: string;
};

const StatsCard = ({ title, value, change, icon, iconBgColor }: StatCardProps) => {
  return (
    <div className="bg-[#2C2F33] rounded-lg p-4 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#99AAB5] text-sm">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        </div>
        <div className={`${iconBgColor} bg-opacity-20 p-3 rounded-full`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 text-xs flex items-center text-[#43B581]">
        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span>{change}</span>
      </div>
    </div>
  );
};

export default StatsCard;
