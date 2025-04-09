const Footer = () => {
  return (
    <footer className="bg-[#2C2F33] py-4 px-6 border-t border-[#36393F]">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-[#99AAB5] text-sm">© {new Date().getFullYear()} CryptoBot Admin Dashboard</p>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="text-[#99AAB5] hover:text-white text-sm">Documentation</a>
          <a href="#" className="text-[#99AAB5] hover:text-white text-sm">Support</a>
          <a href="#" className="text-[#99AAB5] hover:text-white text-sm">API</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
