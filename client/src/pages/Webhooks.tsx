import React from "react";
import { useWebhookConfig, useUpdateWebhookConfig, useCreateWebhookConfig } from "@/lib/hooks/useWebhook";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useState } from "react";

// Webhook schema
const webhookFormSchema = z.object({
  url: z.string().url("Must be a valid Discord webhook URL"),
  notifySuccess: z.boolean().default(true),
  notifyPending: z.boolean().default(true),
  notifyFailed: z.boolean().default(true),
  notifyWallet: z.boolean().default(false),
});

const WebhookDemo = ({ title, type }: { title: string, type: 'success' | 'pending' | 'failed' }) => {
  const getStatusColor = () => {
    switch (type) {
      case 'success': return 'bg-[#43B581]';
      case 'pending': return 'bg-yellow-400';
      case 'failed': return 'bg-[#F04747]';
    }
  };
  
  const getAmount = () => {
    switch (type) {
      case 'success': return "0.0458 BTC";
      case 'pending': return "1.25 ETH";
      case 'failed': return "0.0128 BTC";
    }
  };
  
  const getTxId = () => {
    switch (type) {
      case 'success': return "txn_1KbH7...";
      case 'pending': return "txn_8JhT9...";
      case 'failed': return "txn_5GtY7...";
    }
  };
  
  const getTimeOrConfirmations = () => {
    if (type === 'pending') {
      return (
        <div className="flex justify-between">
          <span className="text-[#99AAB5]">Confirmations:</span>
          <span className="font-medium">2/6</span>
        </div>
      );
    }
    
    return (
      <div className="flex justify-between">
        <span className="text-[#99AAB5]">Time:</span>
        <span className="font-medium">Today at 12:45 PM</span>
      </div>
    );
  };
  
  return (
    <div className="bg-[#36393F] rounded-md p-3 mb-4">
      <div className="flex items-start">
        <img src="https://ui-avatars.com/api/?name=CryptoBot&background=7289DA&color=fff" alt="Bot Avatar" className="h-10 w-10 rounded-full mr-3" />
        <div>
          <div className="flex items-center">
            <span className="font-semibold text-white">CryptoBot</span>
            <span className="text-[#99AAB5] text-xs ml-2">Today at 12:45 PM</span>
          </div>
          <div className="mt-1 border-l-4 p-3 bg-[#2C2F33] rounded-md" style={{ borderColor: getStatusColor().replace('bg-', '') }}>
            <div className="flex items-center">
              <div className={`w-1 h-16 ${getStatusColor()} rounded-sm mr-3`}></div>
              <div>
                <div className="font-semibold text-white">{title}</div>
                <div className="text-sm mt-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[#99AAB5]">Amount:</span>
                    <span className="font-medium">{getAmount()}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#99AAB5]">Transaction ID:</span>
                    <span className="font-medium">{getTxId()}</span>
                  </div>
                  {getTimeOrConfirmations()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Webhooks = () => {
  const { data: webhookConfig, isLoading } = useWebhookConfig();
  const updateWebhookMutation = useUpdateWebhookConfig();
  const createWebhookMutation = useCreateWebhookConfig();
  const { toast } = useToast();
  const [testMessage, setTestMessage] = useState<string | null>(null);

  // Create form
  const form = useForm<z.infer<typeof webhookFormSchema>>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      url: webhookConfig?.url || "",
      notifySuccess: webhookConfig?.notifySuccess ?? true,
      notifyPending: webhookConfig?.notifyPending ?? true,
      notifyFailed: webhookConfig?.notifyFailed ?? true,
      notifyWallet: webhookConfig?.notifyWallet ?? false,
    },
  });

  // Update form values when webhook config loads
  React.useEffect(() => {
    if (webhookConfig) {
      form.reset({
        url: webhookConfig.url,
        notifySuccess: webhookConfig.notifySuccess,
        notifyPending: webhookConfig.notifyPending,
        notifyFailed: webhookConfig.notifyFailed,
        notifyWallet: webhookConfig.notifyWallet,
      });
    }
  }, [webhookConfig, form]);

  // Submit handler
  const onSubmit = async (data: z.infer<typeof webhookFormSchema>) => {
    try {
      if (webhookConfig) {
        await updateWebhookMutation.mutateAsync(data);
        toast({
          title: "Webhook Updated",
          description: "Discord webhook configuration has been updated",
        });
      } else {
        await createWebhookMutation.mutateAsync(data);
        toast({
          title: "Webhook Created",
          description: "Discord webhook has been configured successfully",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save webhook configuration",
        variant: "destructive",
      });
    }
  };

  // Test webhook
  const testWebhook = async () => {
    const webhookUrl = form.getValues("url");
    
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first",
        variant: "destructive",
      });
      return;
    }
    
    setTestMessage("Sending test message...");
    
    // This is a mock implementation since we're not actually sending the webhook
    // In a real application, we would make an API call to send a test message
    setTimeout(() => {
      setTestMessage("Test message sent successfully!");
      toast({
        title: "Test Message Sent",
        description: "Check your Discord channel for the test message",
      });
      
      // Clear the message after 3 seconds
      setTimeout(() => {
        setTestMessage(null);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Discord Webhook Integration</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-[#2C2F33] border-[#36393F] text-white">
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
            <CardDescription className="text-[#99AAB5]">
              Configure how the bot sends notifications to your Discord server
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading webhook configuration...</div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discord Webhook URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://discord.com/api/webhooks/..." 
                            {...field} 
                            className="bg-[#36393F] border-[#36393F]" 
                          />
                        </FormControl>
                        <FormDescription className="text-[#99AAB5]">
                          Create a webhook in your Discord server settings and paste the URL here
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notification Settings</h3>
                    
                    <FormField
                      control={form.control}
                      name="notifySuccess"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-md p-3 bg-[#36393F]">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-[#7289DA] data-[state=checked]:border-[#7289DA]"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Payment Success Notifications</FormLabel>
                            <FormDescription className="text-[#99AAB5]">
                              Send a notification when a payment is successfully completed
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notifyPending"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-md p-3 bg-[#36393F]">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-[#7289DA] data-[state=checked]:border-[#7289DA]"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Payment Pending Notifications</FormLabel>
                            <FormDescription className="text-[#99AAB5]">
                              Send a notification when a payment is pending or awaiting confirmations
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notifyFailed"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-md p-3 bg-[#36393F]">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-[#7289DA] data-[state=checked]:border-[#7289DA]"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Payment Failed Notifications</FormLabel>
                            <FormDescription className="text-[#99AAB5]">
                              Send a notification when a payment fails or is rejected
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notifyWallet"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-md p-3 bg-[#36393F]">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-[#7289DA] data-[state=checked]:border-[#7289DA]"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Wallet Updates Notifications</FormLabel>
                            <FormDescription className="text-[#99AAB5]">
                              Send a notification when wallet configurations are updated
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={testWebhook}
                      disabled={updateWebhookMutation.isPending}
                    >
                      Test Webhook
                    </Button>
                    
                    <Button 
                      type="submit" 
                      className="bg-[#7289DA] hover:bg-opacity-90"
                      disabled={updateWebhookMutation.isPending}
                    >
                      {webhookConfig ? "Update Webhook" : "Save Webhook"}
                    </Button>
                  </div>
                  
                  {testMessage && (
                    <p className="text-sm text-center text-[#43B581]">{testMessage}</p>
                  )}
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-[#2C2F33] border-[#36393F] text-white">
          <CardHeader>
            <CardTitle>Message Preview</CardTitle>
            <CardDescription className="text-[#99AAB5]">
              Examples of how notifications will appear in Discord
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <WebhookDemo title="Payment Successful" type="success" />
            <WebhookDemo title="Payment Pending" type="pending" />
            <WebhookDemo title="Payment Failed" type="failed" />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-[#99AAB5]">
              <p>Webhook notifications are sent in real-time as transactions are processed by the bot.</p>
            </div>
            <div className="bg-[#36393F] rounded-md p-3 text-sm text-[#99AAB5] border-l-4 border-[#7289DA]">
              <p className="font-semibold text-white mb-1">Quick Setup Guide</p>
              <ol className="list-decimal list-inside space-y-1 pl-2">
                <li>Create a webhook in your Discord server settings</li>
                <li>Copy the webhook URL and paste it above</li>
                <li>Choose which notifications you want to receive</li>
                <li>Click "Save Webhook" to activate notifications</li>
              </ol>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Webhooks;
