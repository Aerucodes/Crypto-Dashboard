import { Button } from "@/components/ui/button";
import { Link } from "wouter";

type DiscordMessageProps = {
  time: string;
  type: 'success' | 'pending' | 'failed';
  amount: string;
  currency: string;
  transactionId: string;
  confirmations?: string;
};

const DiscordMessage = ({ time, type, amount, currency, transactionId, confirmations }: DiscordMessageProps) => {
  const getStatusColor = () => {
    switch (type) {
      case 'success': return 'bg-[#43B581]';
      case 'pending': return 'bg-yellow-400';
      case 'failed': return 'bg-[#F04747]';
    }
  };
  
  const getStatusTitle = () => {
    switch (type) {
      case 'success': return 'Payment Successful';
      case 'pending': return 'Payment Pending';
      case 'failed': return 'Payment Failed';
    }
  };
  
  return (
    <div className="bg-[#36393F] rounded-md p-3 mb-4">
      <div className="flex items-start">
        <img src="https://ui-avatars.com/api/?name=CryptoBot&background=7289DA&color=fff" alt="Bot Avatar" className="h-10 w-10 rounded-full mr-3" />
        <div>
          <div className="flex items-center">
            <span className="font-semibold text-white">CryptoBot</span>
            <span className="text-[#99AAB5] text-xs ml-2">{time}</span>
          </div>
          <div className="mt-1 border-l-4 p-3 bg-[#2C2F33] rounded-md" style={{ borderColor: getStatusColor().replace('bg-', '') }}>
            <div className="flex items-center">
              <div className={`w-1 h-16 ${getStatusColor()} rounded-sm mr-3`}></div>
              <div>
                <div className="font-semibold text-white">{getStatusTitle()}</div>
                <div className="text-sm mt-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[#99AAB5]">Amount:</span>
                    <span className="font-medium">{amount} {currency}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#99AAB5]">Transaction ID:</span>
                    <span className="font-medium">{transactionId}</span>
                  </div>
                  {type === 'pending' && confirmations ? (
                    <div className="flex justify-between">
                      <span className="text-[#99AAB5]">Confirmations:</span>
                      <span className="font-medium">{confirmations}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-[#99AAB5]">Time:</span>
                      <span className="font-medium">{time}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DiscordPreview = () => {
  return (
    <div className="bg-[#2C2F33] rounded-lg shadow">
      <div className="p-4 border-b border-[#36393F]">
        <h2 className="text-lg font-semibold">Discord Preview</h2>
        <p className="text-[#99AAB5] text-sm mt-1">How notifications appear in Discord</p>
      </div>
      <div className="p-4">
        <DiscordMessage 
          time="Today at 12:45 PM"
          type="success"
          amount="0.0458"
          currency="BTC"
          transactionId="txn_1KbH7..."
        />
        
        <DiscordMessage 
          time="Today at 11:32 AM"
          type="pending"
          amount="1.25"
          currency="ETH"
          transactionId="txn_8JhT9..."
          confirmations="2/6"
        />
      </div>
      <div className="p-4 border-t border-[#36393F]">
        <Link href="/webhooks">
          <Button className="w-full py-2 bg-[#7289DA] text-white rounded-md hover:bg-opacity-90 transition duration-150 flex items-center justify-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configure Webhooks
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DiscordPreview;
