import { useState } from "react";
import { useTransactions, useCreateTransaction, useUpdateTransaction } from "@/lib/hooks/useTransactions";
import { useWallets } from "@/lib/hooks/useWallets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

// Transaction form schema
const transactionFormSchema = z.object({
  transactionId: z.string().min(5, "Transaction ID must be at least 5 characters"),
  amount: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().positive("Amount must be positive")
  ),
  currency: z.string().min(1, "Currency is required"),
  walletId: z.preprocess(
    (val) => parseInt(val as string, 10),
    z.number().positive("Wallet ID is required")
  ),
  network: z.string().optional(),
  status: z.string().default("pending"),
});

const Transactions = () => {
  const [page, setPage] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const pageSize = 10;

  // Fetch transactions and wallets
  const { data: transactionsData, isLoading } = useTransactions(pageSize, (page - 1) * pageSize, selectedCurrency || undefined);
  const { data: wallets, isLoading: walletsLoading } = useWallets();
  
  // Mutations
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  // Forms
  const addForm = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      transactionId: "TX_",
      amount: 0,
      currency: "BTC",
      walletId: 1,
      network: "mainnet",
      status: "pending"
    },
  });

  const editForm = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      transactionId: "TX_",
      amount: 0,
      currency: "BTC",
      walletId: 1,
      network: "mainnet",
      status: "pending"
    },
  });

  // Get currency logo
  const getCurrencyLogo = (currency: string) => {
    switch (currency) {
      case 'BTC':
        return "https://cryptologos.cc/logos/bitcoin-btc-logo.svg";
      case 'ETH':
        return "https://cryptologos.cc/logos/ethereum-eth-logo.svg";
      case 'LTC':
        return "https://cryptologos.cc/logos/litecoin-ltc-logo.svg";
      case 'USDT':
        return "https://cryptologos.cc/logos/tether-usdt-logo.svg";
      case 'USDC':
        return "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg";
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

  // Handle new transaction submission
  const handleAddTransaction = async (data: z.infer<typeof transactionFormSchema>) => {
    try {
      await createTransactionMutation.mutateAsync(data);
      addForm.reset();
      setIsAddDialogOpen(false);
      toast({
        title: "Transaction Added",
        description: "The transaction has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle edit transaction
  const handleEditTransaction = async (data: z.infer<typeof transactionFormSchema>) => {
    if (!editingTransaction) return;
    
    try {
      await updateTransactionMutation.mutateAsync({ id: editingTransaction.id, data });
      editForm.reset();
      setEditingTransaction(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Transaction Updated",
        description: "The transaction has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Set up editing transaction form
  const startEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    editForm.reset({
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      currency: transaction.currency,
      walletId: transaction.walletId,
      network: transaction.network || "mainnet",
      status: transaction.status || "pending"
    });
    setIsEditDialogOpen(true);
  };

  // Pagination
  const totalPages = Math.ceil((transactionsData?.pagination.total || 0) / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <div className="flex items-center gap-2">
          <Select value={selectedCurrency || "all"} onValueChange={(value) => setSelectedCurrency(value === "all" ? null : value)}>
            <SelectTrigger className="w-40 bg-[#36393F] border-[#2C2F33]">
              <SelectValue placeholder="All Currencies" />
            </SelectTrigger>
            <SelectContent className="bg-[#2C2F33] border-[#36393F]">
              <SelectItem value="all">All Currencies</SelectItem>
              <SelectItem value="BTC">Bitcoin</SelectItem>
              <SelectItem value="ETH">Ethereum</SelectItem>
              <SelectItem value="LTC">Litecoin</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#7289DA] hover:bg-opacity-90">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#36393F] border-[#2C2F33]">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription className="text-[#99AAB5]">Create a new transaction record</DialogDescription>
              </DialogHeader>
              
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddTransaction)} className="space-y-4">
                  <FormField
                    control={addForm.control}
                    name="transactionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction ID</FormLabel>
                        <FormControl>
                          <Input placeholder="txn_123456" {...field} className="bg-[#2C2F33] border-[#2C2F33]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.0001" 
                              placeholder="0.00" 
                              {...field} 
                              className="bg-[#2C2F33] border-[#2C2F33]" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Auto-select network based on currency
                              if (value === "USDT") {
                                addForm.setValue("network", "ethereum");
                              } else if (value === "USDC") {
                                addForm.setValue("network", "arbitrum_usdc");
                              } else if (value === "BTC") {
                                addForm.setValue("network", "mainnet");
                              } else if (value === "ETH") {
                                addForm.setValue("network", "ethereum");
                              } else if (value === "LTC") {
                                addForm.setValue("network", "mainnet");
                              }
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#2C2F33] border-[#2C2F33]">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#2C2F33] border-[#2C2F33]">
                              <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                              <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                              <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                              <SelectItem value="USDT">USDT</SelectItem>
                              <SelectItem value="USDC">USDC</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  

                  <FormField
                    control={addForm.control}
                    name="walletId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger className="bg-[#2C2F33] border-[#2C2F33]">
                              <SelectValue placeholder="Select wallet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#2C2F33] border-[#2C2F33]">
                            {walletsLoading ? (
                              <SelectItem value="loading">Loading wallets...</SelectItem>
                            ) : wallets && wallets.length > 0 ? (
                              wallets.map((wallet) => (
                                <SelectItem key={wallet.id} value={wallet.id.toString()}>
                                  {wallet.name} ({wallet.currency})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-wallets">No wallets available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                      control={addForm.control}
                      name="network"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Network</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-[#2C2F33] border-[#2C2F33]">
                                <SelectValue placeholder="Select network" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#2C2F33] border-[#2C2F33]">
                              <SelectItem value="mainnet">Mainnet</SelectItem>
                              <SelectItem value="ethereum">Ethereum</SelectItem>
                              <SelectItem value="bsc">BSC</SelectItem>
                              <SelectItem value="polygon">Polygon</SelectItem>
                              <SelectItem value="arbitrum">Arbitrum</SelectItem>
                              <SelectItem value="arbitrum_usdc">Arbitrum USDC</SelectItem>
                              <SelectItem value="bsc_usdc">BSC USDC</SelectItem>
                              <SelectItem value="solana">Solana</SelectItem>
                              <SelectItem value="tron">TRON</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-[#7289DA] hover:bg-opacity-90">Add Transaction</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card className="bg-[#2C2F33] border-[#36393F] text-white">
        <CardHeader>
          <CardTitle>Transaction List</CardTitle>
          <CardDescription className="text-[#99AAB5]">
            View and manage all cryptocurrency transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading transactions...</p>
            </div>
          ) : transactionsData?.transactions.length === 0 ? (
            <div className="text-center py-8">
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#99AAB5] text-xs uppercase">
                    <th className="px-4 py-3 font-medium">Transaction ID</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Currency</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#36393F]">
                  {transactionsData?.transactions.map((transaction) => (
                    <tr key={transaction.id} className="text-sm hover:bg-[#36393F] transition duration-150">
                      <td className="px-4 py-3 font-medium">{transaction.transactionId}</td>
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
                      <td className="px-4 py-3">
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0" 
                          onClick={() => startEdit(transaction)}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <span className="text-sm text-[#99AAB5]">
            Showing {transactionsData?.transactions.length || 0} of {transactionsData?.pagination.total || 0} transactions
          </span>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              className="h-8 px-3"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-[#99AAB5]">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              className="h-8 px-3"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#36393F] border-[#2C2F33]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription className="text-[#99AAB5]">Update transaction details</DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditTransaction)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction ID</FormLabel>
                    <FormControl>
                      <Input placeholder="txn_123456" {...field} className="bg-[#2C2F33] border-[#2C2F33]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.0001" 
                          placeholder="0.00" 
                          {...field} 
                          className="bg-[#2C2F33] border-[#2C2F33]" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Auto-select network based on currency
                          if (value === "USDT") {
                            editForm.setValue("network", "ethereum");
                          } else if (value === "USDC") {
                            editForm.setValue("network", "arbitrum_usdc");
                          } else if (value === "BTC") {
                            editForm.setValue("network", "mainnet");
                          } else if (value === "ETH") {
                            editForm.setValue("network", "ethereum");
                          } else if (value === "LTC") {
                            editForm.setValue("network", "mainnet");
                          }
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#2C2F33] border-[#2C2F33]">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#2C2F33] border-[#2C2F33]">
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              

              
              <FormField
                control={editForm.control}
                name="walletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-[#2C2F33] border-[#2C2F33]">
                          <SelectValue placeholder="Select wallet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#2C2F33] border-[#2C2F33]">
                        {walletsLoading ? (
                          <SelectItem value="loading">Loading wallets...</SelectItem>
                        ) : wallets && wallets.length > 0 ? (
                          wallets.map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.id.toString()}>
                              {wallet.name} ({wallet.currency})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-wallets">No wallets available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                  control={editForm.control}
                  name="network"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Network</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#2C2F33] border-[#2C2F33]">
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#2C2F33] border-[#2C2F33]">
                          <SelectItem value="mainnet">Mainnet</SelectItem>
                          <SelectItem value="ethereum">Ethereum</SelectItem>
                          <SelectItem value="bsc">BSC</SelectItem>
                          <SelectItem value="polygon">Polygon</SelectItem>
                          <SelectItem value="arbitrum">Arbitrum</SelectItem>
                          <SelectItem value="arbitrum_usdc">Arbitrum USDC</SelectItem>
                          <SelectItem value="bsc_usdc">BSC USDC</SelectItem>
                          <SelectItem value="solana">Solana</SelectItem>
                          <SelectItem value="tron">TRON</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#7289DA] hover:bg-opacity-90">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
