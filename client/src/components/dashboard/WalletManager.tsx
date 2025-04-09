import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from '@shared/schema';
import { z } from 'zod';
import { queryClient } from '@/lib/queryClient';

type WalletManagerProps = {
  wallets: Wallet[];
  isLoading: boolean;
  onAddWallet: (data: any) => Promise<void>;
  onEditWallet: (id: number, data: any) => Promise<void>;
};

// Wallet form schema
const walletFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  currency: z.string().min(1, "Currency is required"),
  network: z.string().min(1, "Network is required"),
  discordUserId: z.string().optional(),
  isActive: z.boolean().default(true),
});

const WalletManager = ({ wallets, isLoading, onAddWallet, onEditWallet }: WalletManagerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const { toast } = useToast();
  
  // Create form for adding wallet
  const addForm = useForm<z.infer<typeof walletFormSchema>>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      name: "",
      address: "",
      currency: "BTC",
      network: "BTC",
      discordUserId: "",
      isActive: true,
    },
  });
  
  // Create form for editing wallet
  const editForm = useForm<z.infer<typeof walletFormSchema>>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      name: "",
      address: "",
      currency: "BTC",
      network: "BTC",
      discordUserId: "",
      isActive: true,
    },
  });
  
  // Handle add wallet submission
  const handleAddWallet = async (data: z.infer<typeof walletFormSchema>) => {
    try {
      await onAddWallet(data);
      addForm.reset();
      setIsAddDialogOpen(false);
      toast({
        title: "Wallet Added",
        description: "The wallet has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add wallet. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle edit wallet submission
  const handleEditWallet = async (data: z.infer<typeof walletFormSchema>) => {
    if (!editingWallet) return;
    
    try {
      await onEditWallet(editingWallet.id, data);
      editForm.reset();
      setEditingWallet(null);
      toast({
        title: "Wallet Updated",
        description: "The wallet has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wallet. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Set up editing wallet form
  const startEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    editForm.reset({
      name: wallet.name,
      address: wallet.address,
      currency: wallet.currency,
      network: wallet.network || wallet.currency, // Default to currency if network not available
      discordUserId: wallet.discordUserId || "",
      isActive: wallet.isActive,
    });
  };
  
  // Function to blur wallet address for display
  const getBlurredAddress = (address: string) => {
    if (!address) return "";
    if (address.length <= 12) return address;
    
    const firstPart = address.substring(0, 6);
    const lastPart = address.substring(address.length - 4);
    return `${firstPart}...${lastPart}`;
  };
  
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
  
  // Get network options based on currency
  const getNetworkOptions = (currency: string) => {
    switch (currency) {
      case 'BTC':
        return [{ value: 'BTC', label: 'Bitcoin' }];
      case 'ETH':
        return [{ value: 'ETH', label: 'Ethereum' }];
      case 'LTC':
        return [{ value: 'LTC', label: 'Litecoin' }];
      case 'USDT':
        return [
          { value: 'ERC20', label: 'Ethereum (ERC20)' },
          { value: 'TRC20', label: 'Tron (TRC20)' },
          { value: 'BEP20', label: 'Binance Smart Chain (BEP20)' },
          { value: 'Polygon', label: 'Polygon' },
        ];
      case 'USDC':
        return [
          { value: 'ERC20', label: 'Ethereum (ERC20)' },
          { value: 'Solana', label: 'Solana' },
          { value: 'Polygon', label: 'Polygon' },
        ];
      default:
        return [];
    }
  };
  
  // Update network options when currency changes
  const handleCurrencyChange = (currency: string, formType: 'add' | 'edit') => {
    const networkOptions = getNetworkOptions(currency);
    if (networkOptions.length > 0) {
      if (formType === 'add') {
        addForm.setValue('network', networkOptions[0].value);
      } else {
        editForm.setValue('network', networkOptions[0].value);
      }
    }
  };
  
  // Handle copy wallet address
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };
  
  return (
    <div className="bg-[#2C2F33] rounded-lg shadow">
      <div className="p-4 border-b border-[#36393F] flex justify-between items-center">
        <h2 className="text-lg font-semibold">Wallet Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#7289DA] hover:bg-opacity-90 focus:outline-none">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#36393F] text-white border-[#2C2F33]">
            <DialogHeader>
              <DialogTitle>Add New Wallet</DialogTitle>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleAddWallet)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Bitcoin Wallet" {...field} className="bg-[#2C2F33] border-[#2C2F33]" />
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
                          handleCurrencyChange(value, 'add');
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
                          <SelectItem value="USDT">Tether (USDT)</SelectItem>
                          <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
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
                          {getNetworkOptions(addForm.getValues('currency')).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter wallet address" {...field} className="bg-[#2C2F33] border-[#2C2F33]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#2C2F33] p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#7289DA] text-white hover:bg-opacity-90">
                    Add Wallet
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-4">Loading wallets...</div>
        ) : wallets.length === 0 ? (
          <div className="text-center py-4">No wallets found. Add your first wallet!</div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="bg-[#36393F] rounded-md p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex items-center mb-2 sm:mb-0">
                  <img src={getCurrencyLogo(wallet.currency)} alt={wallet.currency} className="h-8 w-8 mr-3" />
                  <div>
                    <div className="font-medium">{wallet.name}</div>
                    <div className="flex flex-col">
                      <div className="text-[#99AAB5] text-xs flex items-center mt-1">
                        <span>{getBlurredAddress(wallet.address)}</span>
                        <button 
                          className="ml-2 text-[#7289DA] hover:text-opacity-80"
                          onClick={() => copyAddress(wallet.address)}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      {wallet.network && wallet.network !== wallet.currency && (
                        <div className="text-[#99AAB5] text-xs mt-1">
                          Network: {wallet.network}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${wallet.isActive ? 'bg-[#43B581] bg-opacity-10 text-[#43B581]' : 'bg-[#F04747] bg-opacity-10 text-[#F04747]'}`}>
                    {wallet.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button 
                    className="text-[#99AAB5] hover:text-white rounded-full p-1"
                    onClick={() => startEdit(wallet)}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Edit Wallet Dialog */}
      <Dialog open={!!editingWallet} onOpenChange={(open) => !open && setEditingWallet(null)}>
        <DialogContent className="bg-[#36393F] text-white border-[#2C2F33]">
          <DialogHeader>
            <DialogTitle>Edit Wallet</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditWallet)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Bitcoin Wallet" {...field} className="bg-[#2C2F33] border-[#2C2F33]" />
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
                        handleCurrencyChange(value, 'edit');
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
                        <SelectItem value="USDT">Tether (USDT)</SelectItem>
                        <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
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
                        {getNetworkOptions(editForm.getValues('currency')).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter wallet address" {...field} className="bg-[#2C2F33] border-[#2C2F33]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#2C2F33] p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingWallet(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#7289DA] text-white hover:bg-opacity-90">
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletManager;
