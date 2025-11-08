
import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Rocket,
  TrendingUp,
  Repeat,
  Shield,
  Zap,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  AlertCircle // Added AlertCircle import
} from
"lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ScrollSmootherWrapper from "@/components/ui/scroll/ScrollSmoother";
import { ParallaxHero, ParallaxContent, ParallaxFloat, ParallaxSlow } from "@/components/ui/scroll/ParallaxSection";

export default function Welcome() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    }
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      try {
        return await base44.entities.Subscription.filter({ user_email: user.email }, '-created_date', 1);
      } catch {
        return [];
      }
    },
    enabled: !!user?.email
  });

  const hasSubscription = subscriptions.length > 0;

  const features = [
  {
    icon: Sparkles,
    title: "AI Brand Builder",
    description: "Create your unique brand identity with Aura, our AI brand expert"
  },
  {
    icon: Rocket,
    title: "MVP Creator",
    description: "Build digital solutions with Boltz, our AI coding agent"
  },
  {
    icon: TrendingUp,
    title: "Marketing Hub",
    description: "Learn proven strategies to grow your business"
  },
  {
    icon: Repeat,
    title: "Learn & Earn Loop",
    description: "Gamified marketing funnels that drive sales"
  },
  {
    icon: Shield,
    title: "Legal Protection",
    description: "All policies and agreements handled automatically"
  },
  {
    icon: Zap,
    title: "Quick Setup",
    description: "Launch your digital business in days, not months"
  },
  {
    icon: Users,
    title: "Target Your Audience",
    description: "AI-powered insights to reach the right customers"
  },
  {
    icon: Award,
    title: "Premium Features",
    description: "Get $50 worth of features FREE with trial"
  }];


  const benefits = [
  "AI-powered brand creation with Aura",
  "Custom MVP development with Boltz",
  "Gamified Learn & Earn marketing loops",
  "5 premium features valued at $10 each - FREE",
  "Complete legal documentation included",
  "Step-by-step business training courses",
  "3-day free trial, no credit card required",
  "Cancel anytime, keep what you built"];


  const handleGetStarted = async () => {
    const isAuthenticated = await base44.auth.isAuthenticated();

    if (isAuthenticated) {
      if (hasSubscription) {
        navigate(createPageUrl("Dashboard"));
      } else {
        base44.auth.redirectToLogin(createPageUrl("Pricing")); // Changed to redirect to pricing directly for unauthenticated users
      }
    } else {
      base44.auth.redirectToLogin(createPageUrl("Pricing"));
    }
  };


  return (
    <ScrollSmootherWrapper enabled={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Hero Section with Parallax */}
        <ParallaxHero>
          <section className="relative overflow-hidden min-h-screen flex items-center">
            <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-yellow-900/20" />
            <div className="container mx-auto px-4 py-20 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-5xl mx-auto">

                {/* Featured Image with Float Effect */}
                <ParallaxFloat>
                  <div className="mb-12">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f049e8b39754755a23cad0/a5a6b8d86_boltz_arua_we_got_it_from_here.png"
                      alt="Aura and Boltz - We Got It From Here"
                      className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl glow-gold" />

                  </div>
                </ParallaxFloat>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  <span className="text-yellow-400">Build. Launch. Grow.</span>
                  <br />
                  <span className="text-green-400">Your Digital Business</span>
                </h1>

                <p className="text-2xl md:text-3xl text-white mb-8 max-w-3xl mx-auto font-bold">
                  WE GOT IT FROM HERE!!!!
                </p>

                <p className="text-xl text-white mb-8 font-semibold">
                  Making going digital <span className="font-bold text-yellow-400">EASY!!!!</span> so you can relax knowing that we got it from here!!!!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    size="lg"
                    onClick={handleGetStarted}
                    className="gold-gradient hover:opacity-90 shadow-2xl glow-gold px-10 py-7 text-xl font-bold border-2 border-yellow-300">
                    {user && hasSubscription ? 'Go to Dashboard' : 'Start Your 3-Day Free Trial'}
                    <ArrowRight className="w-6 h-6 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate(createPageUrl("Legal"))}
                    className="mint-gradient border-2 border-teal-300 px-10 py-7 text-xl font-bold shadow-xl">
                    View Legal & Policies
                  </Button>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  {user && hasSubscription ?
                  'Welcome back! Ready to continue building?' :
                  'No credit card required • Cancel anytime • Get 5 premium features FREE'}
                </p>
              </motion.div>
            </div>
          </section>
        </ParallaxHero>

        {/* Features Grid with Content Parallax */}
        <ParallaxContent>
          <section className="container mx-auto px-4 py-20">
            <ParallaxSlow>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-yellow-400 mb-4">Everything You Need to Succeed</h2>
                <p className="text-xl text-white font-semibold">Powered by our AI agents Aura & Boltz</p>
              </div>
            </ParallaxSlow>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  data-speed={0.9 + index % 3 * 0.1}
                >
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-2 border-yellow-500/30 bg-gray-900 hover:border-yellow-500">
                    <CardContent className="p-6">
                      <div className="bg-green-300 mb-4 rounded-xl w-12 h-12 gold-gradient flex items-center justify-center glow-gold">
                        <feature.icon className="w-6 h-6 text-black" />
                      </div>
                      <h3 className="text-xl font-bold text-yellow-400 mb-2">{feature.title}</h3>
                      <p className="text-white">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </ParallaxContent>

        {/* Benefits Section with Parallax */}
        <ParallaxContent>
          <section className="container mx-auto px-4 py-20">
            <div className="glass-dark rounded-3xl shadow-2xl p-12 border-2 border-yellow-500/30">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <ParallaxSlow>
                  <div>
                    <h2 className="text-4xl font-bold text-yellow-400 mb-6">What You Get</h2>
                    <div className="space-y-4">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full green-gradient flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-lg text-white font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ParallaxSlow>

                <ParallaxFloat>
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-8 rounded-2xl shadow-2xl border-4 border-green-300">
                    <h3 className="text-3xl font-bold mb-4 text-gray-900">Special Launch Offer</h3>
                    <p className="text-xl mb-6 text-gray-900 font-semibold">
                      Start your digital business journey with our Learn & Earn Loop and get premium features for FREE!
                    </p>
                    <div className="bg-yellow-300 mb-6 p-6 rounded-xl border-2 border-gray-900">
                      <p className="text-sm uppercase tracking-wide mb-2 text-gray-900 font-bold">Total Value</p>
                      <p className="text-5xl font-bold text-gray-900">$50</p>
                      <p className="text-xl mt-2 text-gray-900 font-bold">in FREE features</p>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleGetStarted}
                      className="w-full bg-gray-900 text-yellow-300 hover:bg-black py-7 text-xl font-bold shadow-2xl border-2 border-gray-900 hover:border-yellow-300">
                      {user && hasSubscription ? 'Go to Dashboard' : 'Claim Your Free Features'}
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                  </div>
                </ParallaxFloat>
              </div>
            </div>
          </section>
        </ParallaxContent>

        {/* Important Disclaimer Banner */}
        <ParallaxContent>
          <section className="container mx-auto px-4 py-12">
            <Card className="border-2 border-red-500/50 bg-red-950/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">
                      ⚠️ Important: Please Read Before Starting
                    </h3>
                    <div className="space-y-2 text-sm text-white">
                      <p>
                        <strong className="text-red-300">No Refunds:</strong> All sales are final after your 3-day free trial.
                        Cancel anytime before trial ends to avoid charges.
                      </p>
                      <p>
                        <strong className="text-red-300">No Guarantee of Success:</strong> BoDiGi™ provides tools and guidance,
                        but does not guarantee revenue, success, or that it will meet all your business needs.
                        You may require additional services, developers, or investments to fully launch and monetize your MVP.
                      </p>
                      <p>
                        <strong className="text-red-300">Your Responsibility:</strong> You are responsible for all business decisions,
                        legal compliance, testing, and execution. AI-generated content should be reviewed before use.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(createPageUrl("Legal"))}
                      className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Read Full Terms & Disclaimers
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </ParallaxContent>

        {/* CTA Section with Parallax */}
        <ParallaxContent>
          <section className="container mx-auto px-4 py-20">
            <div className="bg-gradient-to-r from-yellow-400 to-green-400 p-12 text-center rounded-3xl shadow-2xl border-4 border-yellow-300">
              <h2 className="text-gray-900 mb-6 text-4xl font-bold md:text-5xl">Ready to Go Digital?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-900 font-bold">
                Join TEAM BoDiGi™ and let our AI agents help you build, launch, and grow your digital business
              </p>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-gray-900 text-yellow-300 hover:bg-black px-12 py-7 text-xl font-bold rounded-xl shadow-2xl border-4 border-gray-900 hover:scale-105 transition-transform">
                {user && hasSubscription ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              <p className="mt-4 text-base text-gray-900 font-bold">
                {user && hasSubscription ?
                'Continue building your digital empire' :
                '3-day free trial • 5 premium features included • No credit card required'}
              </p>
            </div>
          </section>
        </ParallaxContent>

        {/* Footer */}
        <footer className="border-t border-yellow-500/20 py-8" data-speed="1.2">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f049e8b39754755a23cad0/e3c0fa3cb_Chatbotassistant_compressed.png"
                  alt="BoDiGi™ Logo"
                  className="w-12 h-12 object-contain" />

                <div>
                  <p className="text-yellow-400 font-bold text-xl">BoDiGi™</p>
                  <p className="text-xs text-gray-400">by Bobbie Digital</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                © 2024 BoDiGi™ by Bobbie Digital. All rights reserved.
              </p>
              <p className="text-xs text-gray-600 mb-4">
                BoDiGi™ and the BoDiGi™ logo are trademarks of Bobbie Digital. Patent Pending.
              </p>
              <a href={createPageUrl("Legal")} className="text-sm text-green-400 hover:underline">
                Privacy Policy & Terms
              </a>
            </div>
          </div>
        </footer>
      </div>
    </ScrollSmootherWrapper>
  );
}
