import { useWallets, useCreateWallet, useUpdateWallet, useDeleteWallet } from "@/lib/hooks/useWallets";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { z } from "zod";

// Wallet form schema
const walletFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  currency: z.string().min(1, "Currency is required"),
  isActive: z.boolean().default(true),
});

const Wallets = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any>(null);
  const [deletingWallet, setDeletingWallet] = useState<any>(null);
  const { toast } = useToast();

  // Fetch wallets
  const { data: wallets, isLoading } = useWallets();
  
  // Mutations
  const createWalletMutation = useCreateWallet();
  const updateWalletMutation = useUpdateWallet();
  const deleteWalletMutation = useDeleteWallet();

  // Forms
  const addForm = useForm<z.infer<typeof walletFormSchema>>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      name: "",
      address: "",
      currency: "BTC",
      isActive: true,
    },
  });

  const editForm = useForm<z.infer<typeof walletFormSchema>>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      name: "",
      address: "",
      currency: "BTC",
      isActive: true,
    },
  });

  // Handle add wallet submission
  const handleAddWallet = async (data: z.infer<typeof walletFormSchema>) => {
    try {
      await createWalletMutation.mutateAsync(data);
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
      await updateWalletMutation.mutateAsync({ id: editingWallet.id, data });
      editForm.reset();
      setEditingWallet(null);
      setIsEditDialogOpen(false);
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

  // Handle delete wallet
  const handleDeleteWallet = async () => {
    if (!deletingWallet) return;
    
    try {
      await deleteWalletMutation.mutateAsync(deletingWallet.id);
      setDeletingWallet(null);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Wallet Deleted",
        description: "The wallet has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Set up editing wallet form
  const startEdit = (wallet: any) => {
    setEditingWallet(wallet);
    editForm.reset({
      name: wallet.name,
      address: wallet.address,
      currency: wallet.currency,
      isActive: wallet.isActive,
    });
    setIsEditDialogOpen(true);
  };

  // Start delete process
  const startDelete = (wallet: any) => {
    setDeletingWallet(wallet);
    setIsDeleteDialogOpen(true);
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
      default:
        return "";
    }
  };

  // Copy wallet address to clipboard
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Wallet Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7289DA] hover:bg-opacity-90">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#36393F] border-[#2C2F33]">
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#2C2F33] border-[#2C2F33]">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#2C2F33] border-[#2C2F33]">
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
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
                  <Button type="submit" className="bg-[#7289DA] hover:bg-opacity-90">
                    Add Wallet
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-6">
        <Card className="bg-[#2C2F33] border-[#36393F] text-white">
          <CardHeader>
            <CardTitle>Registered Wallets</CardTitle>
            <CardDescription className="text-[#99AAB5]">
              Manage your cryptocurrency wallets for payment processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading wallets...</p>
              </div>
            ) : !wallets || wallets.length === 0 ? (
              <div className="text-center py-8">
                <p>No wallets found. Add your first wallet to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {wallets.map((wallet) => (
                  <div 
                    key={wallet.id} 
                    className="bg-[#36393F] rounded-md p-4 flex flex-col md:flex-row justify-between items-start md:items-center"
                  >
                    <div className="flex items-center mb-3 md:mb-0">
                      <img src={getCurrencyLogo(wallet.currency)} alt={wallet.currency} className="h-10 w-10 mr-3" />
                      <div>
                        <div className="font-medium text-lg">{wallet.name}</div>
                        <div className="text-[#99AAB5] text-sm flex items-center mt-1">
                          <span className="truncate max-w-[180px] sm:max-w-[300px] md:max-w-full">{wallet.address}</span>
                          <button 
                            className="ml-2 text-[#7289DA] hover:text-opacity-80"
                            onClick={() => copyAddress(wallet.address)}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${wallet.isActive ? 'bg-[#43B581] bg-opacity-10 text-[#43B581]' : 'bg-[#F04747] bg-opacity-10 text-[#F04747]'}`}>
                        {wallet.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0" 
                        onClick={() => startEdit(wallet)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-[#F04747]" 
                        onClick={() => startDelete(wallet)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Wallet Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-[#36393F] border-[#2C2F33]">
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#2C2F33] border-[#2C2F33]">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#2C2F33] border-[#2C2F33]">
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
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
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#7289DA] hover:bg-opacity-90">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-[#36393F] border-[#2C2F33]">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Wallet</AlertDialogTitle>
              <AlertDialogDescription className="text-[#99AAB5]">
                Are you sure you want to delete this wallet? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#2C2F33] text-white hover:bg-[#36393F] hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                className="bg-[#F04747] text-white hover:bg-[#F04747] hover:bg-opacity-90"
                onClick={handleDeleteWallet}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Wallets;
