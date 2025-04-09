import React from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { BotSettings, WebhookConfig } from '@shared/schema';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

type BotSettingsProps = {
  botSettings?: BotSettings;
  webhookConfig?: WebhookConfig;
  isLoading: boolean;
  onUpdateBotSettings: (data: any) => Promise<void>;
  onUpdateWebhookConfig: (data: any) => Promise<void>;
};

// Bot settings form schema
const botSettingsFormSchema = z.object({
  bitcoinConfirmations: z.preprocess(
    (val) => parseInt(val as string, 10),
    z.number().min(1, "Min 1 confirmation").max(10, "Max 10 confirmations")
  ),
  ethereumConfirmations: z.preprocess(
    (val) => parseInt(val as string, 10),
    z.number().min(1, "Min 1 confirmation").max(50, "Max 50 confirmations")
  ),
  litecoinConfirmations: z.preprocess(
    (val) => parseInt(val as string, 10),
    z.number().min(1, "Min 1 confirmation").max(20, "Max 20 confirmations")
  ),
});

// Webhook settings form schema
const webhookFormSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  notifySuccess: z.boolean().default(true),
  notifyPending: z.boolean().default(true),
  notifyFailed: z.boolean().default(true),
  notifyWallet: z.boolean().default(false),
});

// Bot token form schema
const botTokenFormSchema = z.object({
  token: z.string().min(20, "Token must be at least 20 characters"),
});

const BotSettingsComponent = ({ botSettings, webhookConfig, isLoading, onUpdateBotSettings, onUpdateWebhookConfig }: BotSettingsProps) => {
  const { toast } = useToast();
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  
  // Create form for bot settings
  const botSettingsForm = useForm<z.infer<typeof botSettingsFormSchema>>({
    resolver: zodResolver(botSettingsFormSchema),
    defaultValues: {
      bitcoinConfirmations: botSettings?.bitcoinConfirmations || 3,
      ethereumConfirmations: botSettings?.ethereumConfirmations || 15,
      litecoinConfirmations: botSettings?.litecoinConfirmations || 6,
    },
  });
  
  // Create form for webhook settings
  const webhookForm = useForm<z.infer<typeof webhookFormSchema>>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      url: webhookConfig?.url || "",
      notifySuccess: webhookConfig?.notifySuccess ?? true,
      notifyPending: webhookConfig?.notifyPending ?? true,
      notifyFailed: webhookConfig?.notifyFailed ?? true,
      notifyWallet: webhookConfig?.notifyWallet ?? false,
    },
  });
  
  // Create form for bot token
  const tokenForm = useForm<z.infer<typeof botTokenFormSchema>>({
    resolver: zodResolver(botTokenFormSchema),
    defaultValues: {
      token: "",
    },
  });
  
  // Update form defaults when data loads
  React.useEffect(() => {
    if (botSettings) {
      botSettingsForm.reset({
        bitcoinConfirmations: botSettings.bitcoinConfirmations,
        ethereumConfirmations: botSettings.ethereumConfirmations,
        litecoinConfirmations: botSettings.litecoinConfirmations,
      });
    }
    
    if (webhookConfig) {
      webhookForm.reset({
        url: webhookConfig.url,
        notifySuccess: webhookConfig.notifySuccess,
        notifyPending: webhookConfig.notifyPending,
        notifyFailed: webhookConfig.notifyFailed,
        notifyWallet: webhookConfig.notifyWallet,
      });
    }
  }, [botSettings, webhookConfig]);
  
  // Handle bot settings submission
  const handleBotSettingsSubmit = async (data: z.infer<typeof botSettingsFormSchema>) => {
    try {
      await onUpdateBotSettings(data);
      toast({
        title: "Settings Saved",
        description: "Bot settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bot settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle webhook settings submission
  const handleWebhookSubmit = async (data: z.infer<typeof webhookFormSchema>) => {
    try {
      await onUpdateWebhookConfig(data);
      toast({
        title: "Webhook Updated",
        description: "Webhook configuration has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update webhook configuration. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle token update
  const handleTokenUpdate = async (data: z.infer<typeof botTokenFormSchema>) => {
    try {
      await onUpdateBotSettings({ token: data.token });
      tokenForm.reset();
      setIsTokenDialogOpen(false);
      toast({
        title: "Token Updated",
        description: "Bot token has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bot token. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-[#2C2F33] rounded-lg shadow">
        <div className="p-4 border-b border-[#36393F]">
          <h2 className="text-lg font-semibold">Bot Settings</h2>
          <p className="text-[#99AAB5] text-sm mt-1">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#2C2F33] rounded-lg shadow">
      <div className="p-4 border-b border-[#36393F]">
        <h2 className="text-lg font-semibold">Bot Settings</h2>
        <p className="text-[#99AAB5] text-sm mt-1">Configure your Discord bot integration</p>
      </div>
      <div className="p-4">
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Bot Token</label>
            <div className="flex">
              <input 
                type="password" 
                value="••••••••••••••••••••••••••" 
                className="flex-1 bg-[#36393F] border-none text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-[#7289DA] focus:outline-none" 
                readOnly
              />
              <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    type="button" 
                    className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#7289DA] hover:bg-opacity-90 focus:outline-none"
                  >
                    Update
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#36393F] text-white border-[#2C2F33]">
                  <DialogHeader>
                    <DialogTitle>Update Bot Token</DialogTitle>
                  </DialogHeader>
                  <Form {...tokenForm}>
                    <form onSubmit={tokenForm.handleSubmit(handleTokenUpdate)} className="space-y-4">
                      <FormField
                        control={tokenForm.control}
                        name="token"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discord Bot Token</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter bot token" 
                                {...field} 
                                type="password"
                                className="bg-[#2C2F33] border-[#2C2F33]" 
                              />
                            </FormControl>
                            <FormDescription className="text-[#99AAB5]">
                              This token is used to authenticate with the Discord API
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsTokenDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-[#7289DA] text-white hover:bg-opacity-90">
                          Update Token
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="mb-4">
            <Form {...webhookForm}>
              <form onSubmit={webhookForm.handleSubmit(handleWebhookSubmit)}>
                <FormField
                  control={webhookForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="block text-sm font-medium mb-2">Discord Webhook URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://discord.com/api/webhooks/..." 
                          {...field} 
                          className="w-full bg-[#36393F] border-none text-white rounded-md py-2 px-3 focus:ring-2 focus:ring-[#7289DA] focus:outline-none" 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Notification Settings</label>
                  <div className="space-y-2">
                    <FormField
                      control={webhookForm.control}
                      name="notifySuccess"
                      render={({ field }) => (
                        <FormItem className="flex items-center">
                          <FormControl>
                            <Checkbox 
                              id="notify-success" 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              className="h-4 w-4 text-[#7289DA] focus:ring-[#7289DA] border-[#36393F] rounded"
                            />
                          </FormControl>
                          <label htmlFor="notify-success" className="ml-2 block text-sm">
                            Payment Success
                          </label>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={webhookForm.control}
                      name="notifyPending"
                      render={({ field }) => (
                        <FormItem className="flex items-center">
                          <FormControl>
                            <Checkbox 
                              id="notify-pending" 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              className="h-4 w-4 text-[#7289DA] focus:ring-[#7289DA] border-[#36393F] rounded"
                            />
                          </FormControl>
                          <label htmlFor="notify-pending" className="ml-2 block text-sm">
                            Payment Pending
                          </label>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={webhookForm.control}
                      name="notifyFailed"
                      render={({ field }) => (
                        <FormItem className="flex items-center">
                          <FormControl>
                            <Checkbox 
                              id="notify-failed" 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              className="h-4 w-4 text-[#7289DA] focus:ring-[#7289DA] border-[#36393F] rounded"
                            />
                          </FormControl>
                          <label htmlFor="notify-failed" className="ml-2 block text-sm">
                            Payment Failed
                          </label>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={webhookForm.control}
                      name="notifyWallet"
                      render={({ field }) => (
                        <FormItem className="flex items-center">
                          <FormControl>
                            <Checkbox 
                              id="notify-wallet" 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              className="h-4 w-4 text-[#7289DA] focus:ring-[#7289DA] border-[#36393F] rounded"
                            />
                          </FormControl>
                          <label htmlFor="notify-wallet" className="ml-2 block text-sm">
                            Wallet Updates
                          </label>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#7289DA] hover:bg-opacity-90 focus:outline-none"
                >
                  Save Webhook Settings
                </Button>
              </form>
            </Form>
          </div>
          
          <Form {...botSettingsForm}>
            <form onSubmit={botSettingsForm.handleSubmit(handleBotSettingsSubmit)}>
              <div className="mb-4 mt-6">
                <label className="block text-sm font-medium mb-2">Confirmation Threshold</label>
                <div className="flex items-center">
                  <span className="text-sm mr-3 w-20">Bitcoin</span>
                  <FormField
                    control={botSettingsForm.control}
                    name="bitcoinConfirmations"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="10" 
                            className="w-16 bg-[#36393F] border-none text-white rounded-md py-1 px-2 focus:ring-2 focus:ring-[#7289DA] focus:outline-none" 
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="text-sm text-[#99AAB5] ml-2">confirmations</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-3 w-20">Ethereum</span>
                  <FormField
                    control={botSettingsForm.control}
                    name="ethereumConfirmations"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="50" 
                            className="w-16 bg-[#36393F] border-none text-white rounded-md py-1 px-2 focus:ring-2 focus:ring-[#7289DA] focus:outline-none" 
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="text-sm text-[#99AAB5] ml-2">confirmations</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-3 w-20">Litecoin</span>
                  <FormField
                    control={botSettingsForm.control}
                    name="litecoinConfirmations"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="20" 
                            className="w-16 bg-[#36393F] border-none text-white rounded-md py-1 px-2 focus:ring-2 focus:ring-[#7289DA] focus:outline-none" 
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="text-sm text-[#99AAB5] ml-2">confirmations</span>
                </div>
              </div>
              
              <Button 
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#7289DA] hover:bg-opacity-90 focus:outline-none"
              >
                Save Confirmation Settings
              </Button>
            </form>
          </Form>
        </form>
      </div>
    </div>
  );
};

export default BotSettingsComponent;
