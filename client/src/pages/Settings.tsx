import React from "react";
import { useBotSettings, useUpdateBotSettings, useCreateBotSettings } from "@/lib/hooks/useBotSettings";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { z } from "zod";

// Bot token schema
const botTokenSchema = z.object({
  token: z.string().min(20, "Token must be at least 20 characters long"),
});

// Confirmation thresholds schema
const confirmationThresholdsSchema = z.object({
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

const Settings = () => {
  const { data: botSettings, isLoading } = useBotSettings();
  const updateBotSettingsMutation = useUpdateBotSettings();
  const createBotSettingsMutation = useCreateBotSettings();
  const { toast } = useToast();
  const [isTokenVisible, setIsTokenVisible] = useState(false);

  // Create forms
  const tokenForm = useForm<z.infer<typeof botTokenSchema>>({
    resolver: zodResolver(botTokenSchema),
    defaultValues: {
      token: "",
    },
  });
  
  const thresholdsForm = useForm<z.infer<typeof confirmationThresholdsSchema>>({
    resolver: zodResolver(confirmationThresholdsSchema),
    defaultValues: {
      bitcoinConfirmations: botSettings?.bitcoinConfirmations || 3,
      ethereumConfirmations: botSettings?.ethereumConfirmations || 15,
      litecoinConfirmations: botSettings?.litecoinConfirmations || 6,
    },
  });

  // Update form values when bot settings loads
  React.useEffect(() => {
    if (botSettings) {
      thresholdsForm.reset({
        bitcoinConfirmations: botSettings.bitcoinConfirmations,
        ethereumConfirmations: botSettings.ethereumConfirmations,
        litecoinConfirmations: botSettings.litecoinConfirmations,
      });
    }
  }, [botSettings, thresholdsForm]);

  // Submit token
  const onSubmitToken = async (data: z.infer<typeof botTokenSchema>) => {
    try {
      if (botSettings) {
        await updateBotSettingsMutation.mutateAsync({ token: data.token });
        toast({
          title: "Token Updated",
          description: "Discord bot token has been updated successfully",
        });
      } else {
        await createBotSettingsMutation.mutateAsync({ 
          token: data.token,
          bitcoinConfirmations: 3,
          ethereumConfirmations: 15,
          litecoinConfirmations: 6
        });
        toast({
          title: "Token Saved",
          description: "Discord bot token has been saved successfully",
        });
      }
      tokenForm.reset({ token: "" });
      setIsTokenVisible(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bot token",
        variant: "destructive",
      });
    }
  };

  // Submit thresholds
  const onSubmitThresholds = async (data: z.infer<typeof confirmationThresholdsSchema>) => {
    try {
      if (botSettings) {
        await updateBotSettingsMutation.mutateAsync(data);
        toast({
          title: "Settings Updated",
          description: "Confirmation thresholds have been updated successfully",
        });
      } else {
        await createBotSettingsMutation.mutateAsync({
          token: "placeholder_token_required",
          ...data
        });
        toast({
          title: "Settings Saved",
          description: "Confirmation thresholds have been saved successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update confirmation thresholds",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Bot Settings</h1>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-[#2C2F33]">
          <TabsTrigger value="general" className="data-[state=active]:bg-[#7289DA]">General</TabsTrigger>
          <TabsTrigger value="confirmations" className="data-[state=active]:bg-[#7289DA]">Confirmations</TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-[#7289DA]">Advanced</TabsTrigger>
        </TabsList>
        
        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card className="bg-[#2C2F33] border-[#36393F] text-white">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription className="text-[#99AAB5]">
                Manage your Discord bot authentication and basic configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="text-center py-4">Loading settings...</div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Bot Token</h3>
                    <div className="flex">
                      <Input 
                        type={isTokenVisible ? "text" : "password"} 
                        value={isTokenVisible ? (botSettings?.token || "") : "••••••••••••••••••••••••••"} 
                        readOnly
                        className="flex-1 bg-[#36393F] border-[#36393F]" 
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="ml-2"
                        onClick={() => setIsTokenVisible(!isTokenVisible)}
                      >
                        {isTokenVisible ? "Hide" : "Show"}
                      </Button>
                    </div>
                    <p className="text-sm text-[#99AAB5]">
                      Your Discord bot token is used to authenticate with the Discord API
                    </p>
                  </div>
                  
                  <Form {...tokenForm}>
                    <form onSubmit={tokenForm.handleSubmit(onSubmitToken)} className="space-y-4">
                      <FormField
                        control={tokenForm.control}
                        name="token"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Bot Token</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter new Discord bot token" 
                                {...field} 
                                className="bg-[#36393F] border-[#36393F]" 
                              />
                            </FormControl>
                            <FormDescription className="text-[#99AAB5]">
                              Enter a new token to update your bot's authentication
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="bg-[#7289DA] hover:bg-opacity-90"
                      >
                        Update Token
                      </Button>
                    </form>
                  </Form>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Confirmations Tab */}
        <TabsContent value="confirmations">
          <Card className="bg-[#2C2F33] border-[#36393F] text-white">
            <CardHeader>
              <CardTitle>Confirmation Thresholds</CardTitle>
              <CardDescription className="text-[#99AAB5]">
                Configure the number of blockchain confirmations required for each cryptocurrency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading settings...</div>
              ) : (
                <Form {...thresholdsForm}>
                  <form onSubmit={thresholdsForm.handleSubmit(onSubmitThresholds)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={thresholdsForm.control}
                        name="bitcoinConfirmations"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Bitcoin (BTC) Confirmations</FormLabel>
                            <div className="flex items-center">
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="10" 
                                  className="w-20 bg-[#36393F] border-[#36393F]" 
                                  {...field}
                                />
                              </FormControl>
                              <span className="ml-2 text-sm text-[#99AAB5]">confirmations</span>
                            </div>
                            <FormDescription className="text-[#99AAB5]">
                              Recommended: 3 confirmations for Bitcoin transactions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={thresholdsForm.control}
                        name="ethereumConfirmations"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Ethereum (ETH) Confirmations</FormLabel>
                            <div className="flex items-center">
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="50" 
                                  className="w-20 bg-[#36393F] border-[#36393F]" 
                                  {...field}
                                />
                              </FormControl>
                              <span className="ml-2 text-sm text-[#99AAB5]">confirmations</span>
                            </div>
                            <FormDescription className="text-[#99AAB5]">
                              Recommended: 15 confirmations for Ethereum transactions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={thresholdsForm.control}
                        name="litecoinConfirmations"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Litecoin (LTC) Confirmations</FormLabel>
                            <div className="flex items-center">
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="20" 
                                  className="w-20 bg-[#36393F] border-[#36393F]" 
                                  {...field}
                                />
                              </FormControl>
                              <span className="ml-2 text-sm text-[#99AAB5]">confirmations</span>
                            </div>
                            <FormDescription className="text-[#99AAB5]">
                              Recommended: 6 confirmations for Litecoin transactions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="bg-[#36393F] rounded-md p-4 text-sm border-l-4 border-yellow-400">
                      <p className="font-medium">Important:</p>
                      <p className="text-[#99AAB5] mt-1">
                        Higher confirmation counts increase security but may delay transaction processing.
                        Lower counts process faster but may be more vulnerable to blockchain reorganizations.
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-[#7289DA] hover:bg-opacity-90"
                    >
                      Save Confirmation Settings
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <Card className="bg-[#2C2F33] border-[#36393F] text-white">
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription className="text-[#99AAB5]">
                Configure additional bot features and technical settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-[#36393F] rounded-md p-4 border-l-4 border-[#7289DA]">
                <h3 className="font-medium mb-2">Monitoring Frequency</h3>
                <p className="text-sm text-[#99AAB5]">
                  The bot checks for new transactions every 60 seconds by default.
                </p>
              </div>
              
              <div className="bg-[#36393F] rounded-md p-4 border-l-4 border-[#7289DA]">
                <h3 className="font-medium mb-2">Transaction Timeout</h3>
                <p className="text-sm text-[#99AAB5]">
                  Pending transactions will time out after 24 hours if not confirmed.
                </p>
              </div>
              
              <div className="bg-[#36393F] rounded-md p-4 border-l-4 border-[#7289DA]">
                <h3 className="font-medium mb-2">Transaction Recheck</h3>
                <p className="text-sm text-[#99AAB5]">
                  Failed transactions are rechecked up to 3 times before being marked as permanently failed.
                </p>
              </div>
              
              <div className="bg-[#F04747] bg-opacity-10 rounded-md p-4 border-l-4 border-[#F04747]">
                <h3 className="font-medium mb-2">Reset Bot</h3>
                <p className="text-sm text-[#99AAB5] mb-3">
                  This will reset all bot settings and clear all transaction history. This action cannot be undone.
                </p>
                <Button variant="destructive">
                  Reset Bot
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-[#99AAB5]">
                Advanced settings are configured with sensible defaults and should only be changed by experienced users.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
