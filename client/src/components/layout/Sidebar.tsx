import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Logo from "@/components/ui/logo";

const Sidebar = () => {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu on window resize if screen becomes larger
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(true);
      }
    };
    
    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Determine if a link is active
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div id="sidebar" className="bg-[#2C2F33] w-full md:w-64 md:fixed md:h-full flex-shrink-0 z-10 transition-all duration-300">
      <div className="px-4 py-5 flex items-center justify-between md:justify-center">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-[#7289DA]" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <path
                d="M40 20c0 11.046-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0s20 8.954 20 20"
                fill="#7289DA"
              />
              <path
                d="M25.5 27.5L20 32l-5.5-4.5m11-15L20 8l-5.5 4.5"
                stroke="#FFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 8v24"
                stroke="#FFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.5 14L20 20l5.5-6M14.5 26L20 20l5.5 6"
                stroke="#FFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
          <span className="ml-2 text-white font-title text-lg">Crypt Dashboard</span>
        </div>
        <button id="menuToggle" onClick={toggleMenu} className="md:hidden text-white focus:outline-none">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <div id="menu" className={`${isMenuOpen ? "" : "hidden"} md:block px-2 py-2`}>
        <nav>
          <Link href="/">
            <a className={`flex items-center p-3 rounded-md ${isActive("/") ? "bg-[#7289DA] text-white" : "text-[#99AAB5] hover:bg-[#36393F] hover:text-white"} mb-1 transition duration-200`}>
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </a>
          </Link>
          <Link href="/transactions">
            <a className={`flex items-center p-3 rounded-md ${isActive("/transactions") ? "bg-[#7289DA] text-white" : "text-[#99AAB5] hover:bg-[#36393F] hover:text-white"} mb-1 transition duration-200`}>
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Transactions
            </a>
          </Link>
          <Link href="/wallets">
            <a className={`flex items-center p-3 rounded-md ${isActive("/wallets") ? "bg-[#7289DA] text-white" : "text-[#99AAB5] hover:bg-[#36393F] hover:text-white"} mb-1 transition duration-200`}>
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Wallets
            </a>
          </Link>
          <Link href="/webhooks">
            <a className={`flex items-center p-3 rounded-md ${isActive("/webhooks") ? "bg-[#7289DA] text-white" : "text-[#99AAB5] hover:bg-[#36393F] hover:text-white"} mb-1 transition duration-200`}>
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Webhooks
            </a>
          </Link>
          <Link href="/settings">
            <a className={`flex items-center p-3 rounded-md ${isActive("/settings") ? "bg-[#7289DA] text-white" : "text-[#99AAB5] hover:bg-[#36393F] hover:text-white"} mb-1 transition duration-200`}>
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </a>
          </Link>
        </nav>
        <div className="mt-8 border-t border-[#36393F] pt-4 px-3">
          <div className="text-xs uppercase font-semibold text-[#99AAB5] mb-2">Status</div>
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-[#43B581] rounded-full mr-2"></div>
            <span className="text-sm">Bot Online</span>
          </div>
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-[#43B581] rounded-full mr-2"></div>
            <span className="text-sm">API Connected</span>
          </div>
          <a href="#logout" className="flex items-center p-2 text-[#99AAB5] hover:text-white text-sm">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
