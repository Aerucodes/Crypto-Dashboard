import { useLocation } from "wouter";

const Header = () => {
  const [location] = useLocation();
  
  // Get the title based on the current location
  const getTitle = () => {
    if (location === "/") return "Dashboard";
    if (location.startsWith("/transactions")) return "Transactions";
    if (location.startsWith("/wallets")) return "Wallets";
    if (location.startsWith("/webhooks")) return "Webhooks";
    if (location.startsWith("/settings")) return "Settings";
    return "CryptoBot Admin";
  };

  return (
    <header className="bg-[#36393F] border-b border-[#2C2F33] shadow-sm sticky top-0 z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{getTitle()}</h1>
        <div className="flex items-center space-x-4">
          <button className="text-[#99AAB5] hover:text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="relative">
            <button className="flex items-center text-sm">
              <img className="h-8 w-8 rounded-full border-2 border-[#7289DA]" src="https://ui-avatars.com/api/?name=Admin+User&background=7289DA&color=fff" alt="Admin User" />
              <span className="ml-2 font-medium hidden sm:block">Admin User</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
