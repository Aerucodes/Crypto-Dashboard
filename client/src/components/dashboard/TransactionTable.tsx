import { useState } from 'react';
import { Link } from 'wouter';
import { Transaction } from '@shared/schema';

type TransactionTableProps = {
  transactions: Transaction[];
  total: number;
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onCurrencyFilter: (currency: string | null) => void;
  selectedCurrency: string | null;
};

const TransactionTable = ({ 
  transactions, 
  total, 
  loading, 
  currentPage, 
  onPageChange, 
  onCurrencyFilter,
  selectedCurrency
}: TransactionTableProps) => {
  const pageSize = 4; // Same as shown in the mockup
  const totalPages = Math.ceil(total / pageSize);
  
  // Get currency logo
  const getCurrencyLogo = (currency: string) => {
    switch (currency) {
      case 'BTC':
        return "https://cryptologos.cc/logos/bitcoin-btc-logo.svg";
      case 'ETH':
        return "https://cryptologos.cc/logos/ethereum-eth-logo.svg";
      case 'LTC':
        return "https://cryptologos.cc/logos/litecoin-ltc-logo.svg";
      default:
        return "";
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return "bg-[#43B581] bg-opacity-10 text-[#43B581]";
      case 'pending':
        return "bg-yellow-400 bg-opacity-10 text-yellow-400";
      case 'failed':
        return "bg-[#F04747] bg-opacity-10 text-[#F04747]";
      default:
        return "bg-gray-400 bg-opacity-10 text-gray-400";
    }
  };
  
  return (
    <div className="bg-[#2C2F33] rounded-lg shadow">
      <div className="p-4 border-b border-[#36393F] flex flex-wrap justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <div className="flex items-center mt-2 sm:mt-0">
          <div className="relative mr-2">
            <select 
              className="bg-[#36393F] rounded-md py-1 pl-3 pr-8 text-sm border border-[#36393F] appearance-none focus:ring-2 focus:ring-[#7289DA] focus:outline-none"
              value={selectedCurrency || ""}
              onChange={(e) => onCurrencyFilter(e.target.value || null)}
            >
              <option value="">All Currencies</option>
              <option value="BTC">Bitcoin</option>
              <option value="ETH">Ethereum</option>
              <option value="LTC">Litecoin</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="h-4 w-4 text-[#99AAB5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <Link href="/transactions">
            <a className="text-[#7289DA] text-sm hover:underline">View All</a>
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[#99AAB5] text-xs uppercase">
              <th className="px-4 py-3 font-medium">Transaction ID</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Currency</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#36393F]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center">Loading transactions...</td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center">No transactions found</td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="text-sm hover:bg-[#36393F] transition duration-150">
                  <td className="px-4 py-3 font-medium">{transaction.transactionId.substring(0, 10)}...</td>
                  <td className="px-4 py-3">{transaction.amount}</td>
                  <td className="px-4 py-3 flex items-center">
                    <img src={getCurrencyLogo(transaction.currency)} alt={transaction.currency} className="h-4 w-4 mr-1" />
                    <span>{transaction.currency}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#99AAB5]">
                    {new Date(transaction.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-[#36393F] flex items-center justify-between text-sm">
        <span className="text-[#99AAB5]">Showing {transactions.length} of {total} transactions</span>
        <div className="flex items-center space-x-2">
          <button 
            className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-[#36393F] text-[#99AAB5] cursor-not-allowed' : 'bg-[#36393F] text-white hover:bg-opacity-90'}`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button 
            className={`px-3 py-1 rounded ${currentPage >= totalPages ? 'bg-[#36393F] text-[#99AAB5] cursor-not-allowed' : 'bg-[#7289DA] text-white hover:bg-opacity-90'}`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
