import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, Zap, Crown, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function Pricing() {
  const [selectedTier, setSelectedTier] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Subscription.filter({ user_email: user.email }, '-created_date', 1);
    },
    enabled: !!user?.email
  });

  const currentSubscription = subscriptions[0];

  const createSubscriptionMutation = useMutation({
    mutationFn: (subData) => base44.entities.Subscription.create(subData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      navigate(createPageUrl("Dashboard"));
    }
  });

  const handleSelectTier = async (tier) => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl("Pricing"));
      return;
    }

    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 3);

    await createSubscriptionMutation.mutateAsync({
      user_email: user.email,
      tier: tier,
      status: 'trial',
      trial_start_date: trialStartDate.toISOString(),
      trial_end_date: trialEndDate.toISOString(),
      features_used: {
        brand_builder_uses: 0,
        mvp_creator_uses: 0,
        logo_generations: 0,
        ai_messages: 0,
        loop_builder_uses: 0,
        automation_runs: 0
      },
      pay_per_use_credits: 0
    });
  };

  const tiers = [
  {
    name: "Basic",
    price: "19.99",
    tier: "basic",
    icon: Sparkles,
    color: "from-blue-600 to-cyan-600",
    features: [
    "1 Brand Builder session",
    "1 MVP Creator project",
    "2 Logo generations",
    "50 AI messages/month",
    "Basic marketing templates",
    "Email support",
    "3-day free trial"],

    payPerUse: [
    { name: "Extra Brand Session", price: "$15" },
    { name: "Extra MVP Project", price: "$25" },
    { name: "Logo Generation", price: "$10" },
    { name: "50 AI Messages", price: "$10" },
    { name: "Single Automation", price: "$4.99" }]

  },
  {
    name: "Pro",
    price: "49.99",
    tier: "pro",
    icon: Zap,
    color: "from-yellow-600 to-orange-600",
    popular: true,
    features: [
    "3 Brand Builder sessions",
    "3 MVP Creator projects",
    "10 Logo generations",
    "200 AI messages/month",
    "Advanced marketing strategies",
    "Learn & Earn Loop Builder",
    "Unlimited Automation Hub ($20 value)",
    "Priority email support",
    "Custom branding",
    "3-day free trial"],

    payPerUse: [
    { name: "Extra Brand Session", price: "$12" },
    { name: "Extra MVP Project", price: "$20" },
    { name: "Logo Generation", price: "$8" },
    { name: "100 AI Messages", price: "$15" }]

  },
  {
    name: "Elite",
    price: "99.99",
    tier: "elite",
    icon: Crown,
    color: "from-purple-600 to-pink-600",
    features: [
    "Unlimited Brand Builder",
    "Unlimited MVP Creator",
    "Unlimited Logo generations",
    "Unlimited AI messages",
    "Full marketing suite",
    "Unlimited Loop Builder",
    "Unlimited Automation Hub",
    "24/7 Priority support",
    "White-label options",
    "Custom integrations",
    "Dedicated account manager",
    "3-day free trial"],

    payPerUse: []
  }];


  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-yellow-400 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Start with a 3-day free trial, then auto-charge for your selected tier
          </p>
          <Badge className="bg-amber-300 text-black px-6 py-2 text-lg font-semibold rounded-full inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 gold-gradient">
            All plans include 3-day FREE trial
          </Badge>
        </div>

        {currentSubscription &&
        <Card className="mb-8 border-2 border-green-500/30 bg-green-950/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-green-400 font-bold">Current Plan: {currentSubscription.tier.toUpperCase()}</p>
                  <p className="text-gray-300 text-sm">Status: {currentSubscription.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        }

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier, index) =>
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative">

              {tier.popular &&
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="gold-gradient text-black font-bold px-4 py-1">
                    MOST POPULAR
                  </Badge>
                </div>
            }
              
              <Card className={`h-full ${tier.popular ? 'border-4 border-yellow-500 glow-gold' : 'border-2 border-yellow-500/30'} bg-gray-900`}>
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 ${tier.popular ? 'glow-gold' : ''}`}>
                    <tier.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl text-yellow-400">{tier.name}</CardTitle>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-5xl font-bold text-white">${tier.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">After 3-day free trial</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <p className="font-bold text-green-400 mb-3">Included Features:</p>
                    {tier.features.map((feature, i) =>
                  <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                  )}
                  </div>

                  {tier.payPerUse.length > 0 &&
                <div className="pt-4 border-t border-yellow-500/20">
                      <p className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Pay-Per-Use Add-ons:
                      </p>
                      <div className="space-y-2">
                        {tier.payPerUse.map((addon, i) =>
                    <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-400">{addon.name}</span>
                            <span className="text-yellow-400 font-bold">{addon.price}</span>
                          </div>
                    )}
                      </div>
                    </div>
                }

                  <Button
                  onClick={() => handleSelectTier(tier.tier)}
                  disabled={currentSubscription?.tier === tier.tier}
                  className={`w-full py-6 text-lg font-bold ${
                  tier.popular ?
                  'gold-gradient text-black hover:opacity-90' :
                  'bg-gray-800 text-yellow-400 hover:bg-gray-700'}`
                  }>

                    {currentSubscription?.tier === tier.tier ?
                  'Current Plan' :
                  'Start Free Trial'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Automation Hub Pricing Section */}
        <Card className="mb-16 border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl text-purple-400">Automation Hub Pricing</CardTitle>
                <p className="text-gray-400">Automate your marketing & business workflows</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-purple-500/20">
                <CardContent className="p-6">
                  <Badge className="bg-yellow-600 text-white mb-4">Included in Pro & Elite</Badge>
                  <h3 className="text-2xl font-bold text-purple-400 mb-2">Unlimited Automations</h3>
                  <p className="text-4xl font-bold text-white mb-4">$20<span className="text-lg text-gray-400">/month</span></p>
                  <p className="text-gray-300 mb-4">
                    Included with Pro ($49.99) and Elite ($99.99) plans
                  </p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Unlimited workflow creation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Unlimited executions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      All automation templates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Advanced scheduling
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Available during 3-day trial
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-purple-500/20">
                <CardContent className="p-6">
                  <Badge className="bg-blue-600 text-white mb-4">Pay-Per-Use</Badge>
                  <h3 className="text-2xl font-bold text-blue-400 mb-2">Per Automation</h3>
                  <p className="text-4xl font-bold text-white mb-4">$4.99<span className="text-lg text-gray-400">/each</span></p>
                  <p className="text-gray-300 mb-4">
                    For Basic plan users or one-time automation needs
                  </p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Single automation workflow
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Unlimited runs per automation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      No monthly commitment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Access to all templates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Available during 3-day trial
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Pay-Per-Use Section */}
        <Card className="border-2 border-yellow-500/30 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-3xl text-yellow-400">Pay-Per-Use Options</CardTitle>
            <p className="text-gray-400">No subscription? No problem! Buy features as you need them.</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-yellow-500/20">
                <CardContent className="p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">Brand Builder Session</h4>
                  <p className="text-3xl font-bold text-white mb-2">$20</p>
                  <p className="text-sm text-gray-400">One-time brand creation</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-yellow-500/20">
                <CardContent className="p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">MVP Creator Project</h4>
                  <p className="text-3xl font-bold text-white mb-2">$30</p>
                  <p className="text-sm text-gray-400">One MVP design</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-yellow-500/20">
                <CardContent className="p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">Logo Generation</h4>
                  <p className="text-3xl font-bold text-white mb-2">$12</p>
                  <p className="text-sm text-gray-400">AI-generated logo</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-yellow-500/20">
                <CardContent className="p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">Single Automation</h4>
                  <p className="text-3xl font-bold text-white mb-2">$4.99</p>
                  <p className="text-sm text-gray-400">One workflow</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Legal Notice */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>By starting a free trial, you agree to be automatically charged after 3 days.</p>
          <p className="mt-2">Cancel anytime before trial ends to avoid charges. See our{' '}
            <a href={createPageUrl("Legal")} className="text-yellow-400 hover:underline">Terms & Conditions</a>
          </p>
        </div>
      </div>
    </div>);

}