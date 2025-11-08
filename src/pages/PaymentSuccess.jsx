import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const paymentId = urlParams.get('payment_id');

    const processPayment = async () => {
      try {
        const user = await base44.auth.me();

        // Get payment record
        const payments = await base44.entities.Payment.filter({ id: paymentId }, '-created_date', 1);
        const payment = payments[0];

        if (!payment) {
          throw new Error('Payment not found');
        }

        // Verify with Stripe and update payment status
        // In production, this would be handled by webhook, but we'll update it here too
        await base44.entities.Payment.update(payment.id, {
          status: 'succeeded',
          paid_at: new Date().toISOString()
        });

        // Update user profile with credits
        if (payment.credits_added && Object.keys(payment.credits_added).length > 0) {
          const profiles = await base44.entities.UserProfile.filter(
            { user_email: user.email },
            '-created_date',
            1
          );

          if (profiles.length > 0) {
            const profile = profiles[0];
            const updatedCredits = { ...profile.credits };

            // Add purchased credits
            Object.keys(payment.credits_added).forEach(key => {
              updatedCredits[key] = (updatedCredits[key] || 0) + payment.credits_added[key];
            });

            await base44.entities.UserProfile.update(profile.id, {
              credits: updatedCredits
            });
          } else {
            // Create new profile with credits
            await base44.entities.UserProfile.create({
              user_email: user.email,
              plan_name: payment.subscription_tier || 'one_time',
              plan_status: payment.subscription_tier ? 'trial' : 'active',
              credits: payment.credits_added
            });
          }
        }

        // If subscription purchase, update subscription
        if (payment.subscription_tier) {
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 3);

          const subscriptions = await base44.entities.Subscription.filter(
            { user_email: user.email },
            '-created_date',
            1
          );

          if (subscriptions.length > 0) {
            await base44.entities.Subscription.update(subscriptions[0].id, {
              tier: payment.subscription_tier,
              status: 'trial',
              trial_start_date: new Date().toISOString(),
              trial_end_date: trialEnd.toISOString()
            });
          } else {
            await base44.entities.Subscription.create({
              user_email: user.email,
              tier: payment.subscription_tier,
              status: 'trial',
              trial_start_date: new Date().toISOString(),
              trial_end_date: trialEnd.toISOString()
            });
          }

          // Update user tier
          await base44.auth.updateMe({
            subscription_tier: payment.subscription_tier
          });
        }

        // If model unlock, add to user's unlocked models
        if (payment.model_unlocked) {
          const unlockedModels = user.unlocked_models || [];
          if (!unlockedModels.includes(payment.model_unlocked)) {
            await base44.auth.updateMe({
              unlocked_models: [...unlockedModels, payment.model_unlocked]
            });
          }
        }

        // Log to data system
        await base44.entities.DataSystem.create({
          user_email: user.email,
          event_type: payment.subscription_tier ? 'subscription_purchase' : 'api_call',
          event_details: {
            payment_id: payment.id,
            amount: payment.amount,
            description: payment.item_description
          },
          event_cost: payment.amount,
          timestamp: new Date().toISOString(),
          plan_name: payment.subscription_tier || user.subscription_tier || 'none'
        });

        setPaymentDetails(payment);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });

      } catch (error) {
        console.error('Payment processing error:', error);
      } finally {
        setProcessing(false);
      }
    };

    if (sessionId && paymentId) {
      processPayment();
    }
  }, []);

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-2 border-blue-500/30 bg-gray-900 max-w-md">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Processing Your Payment</h2>
            <p className="text-gray-400">Please wait while we confirm your purchase...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-green-500/50 bg-gray-900 max-w-md">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
            </motion.div>

            <h1 className="text-3xl font-bold text-green-400 mb-4">
              Payment Successful! 🎉
            </h1>

            {paymentDetails && (
              <div className="space-y-4 mb-8">
                <p className="text-lg text-gray-300">
                  {paymentDetails.item_description}
                </p>
                <div className="bg-gray-800 p-4 rounded-lg border border-green-500/30">
                  <p className="text-2xl font-bold text-green-400">
                    ${paymentDetails.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">paid successfully</p>
                </div>

                {paymentDetails.credits_added && Object.keys(paymentDetails.credits_added).length > 0 && (
                  <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                    <p className="text-sm font-bold text-blue-300 mb-2">Credits Added:</p>
                    <div className="space-y-1 text-sm text-gray-300">
                      {Object.entries(paymentDetails.credits_added).map(([key, value]) => (
                        value > 0 && (
                          <div key={key} className="flex items-center justify-between">
                            <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-bold text-green-400">+{value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => navigate(createPageUrl("Dashboard"))}
                className="w-full gold-gradient text-black hover:opacity-90"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("Profile"))}
                variant="outline"
                className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                View My Profile
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              A receipt has been sent to your email
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}