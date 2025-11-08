
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Rocket,
  TrendingUp,
  Repeat,
  ArrowRight,
  CheckCircle,
  Clock,
  User,
  Crown,
  Zap,
  Bot,
  PlayCircle,
  History
} from "lucide-react";
import { motion } from "framer-motion";
import AIModelPicker from "@/components/AIModelPicker";
import OnboardingFlow from "@/components/OnboardingFlow";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: onboardingProgress } = useQuery({
    queryKey: ['onboarding-progress', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const progress = await base44.entities.OnboardingProgress.filter(
        { user_email: user.email },
        '-created_date',
        1
      );
      return progress[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: async () => {
      if (!user?.email || user?.role === 'admin') return [];
      return await base44.entities.Subscription.filter({ user_email: user.email }, '-created_date', 1);
    },
    enabled: !!user?.email
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => base44.entities.Brand.list('-updated_date', 10)
  });

  const { data: mvps = [] } = useQuery({
    queryKey: ['mvps'],
    queryFn: () => base44.entities.MVP.list('-updated_date', 10)
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['automation-workflows'],
    queryFn: () => base44.entities.AutomationWorkflow.list('-updated_date', 10),
    initialData: []
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['marketing-campaigns'],
    queryFn: () => base44.entities.MarketingCampaign.list('-updated_date', 10),
    initialData: []
  });

  const { data: loops = [] } = useQuery({
    queryKey: ['loops'],
    queryFn: () => base44.entities.LearnAndEarnLoop.list('-updated_date', 10),
    initialData: []
  });

  const currentSubscription = subscriptions[0];
  const currentBrand = brands[0];
  const currentMVP = mvps[0];
  const isAdmin = user?.role === 'admin';

  // Auto-show onboarding for new users
  React.useEffect(() => {
    if (user && !onboardingProgress && !isAdmin) {
      // New user without onboarding progress
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, [user, onboardingProgress, isAdmin]);

  const calculateDaysLeft = () => {
    if (!currentSubscription?.trial_end_date) return 0;
    const now = new Date();
    const endDate = new Date(currentSubscription.trial_end_date);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Determine what the user should continue with
  const getResumeItems = () => {
    const items = [];

    // Check for incomplete brand
    if (currentBrand && currentBrand.status !== 'completed') {
      items.push({
        title: "Complete Your Brand",
        description: currentBrand.name ? `Continue building "${currentBrand.name}"` : "Finish your brand identity",
        page: "BrandBuilder",
        icon: Sparkles,
        color: "green",
        badge: "In Progress",
        lastUpdated: currentBrand.updated_date
      });
    }

    // Check for incomplete MVP
    if (currentMVP && currentMVP.status !== 'completed' && !currentMVP.legal_accepted) {
      items.push({
        title: "Continue MVP Development",
        description: currentMVP.name ? `Keep working on "${currentMVP.name}"` : "Finish your MVP design",
        page: "MVPCreator",
        icon: Rocket,
        color: "yellow",
        badge: "In Progress",
        lastUpdated: currentMVP.updated_date
      });
    }

    // Check for draft workflows
    const draftWorkflows = workflows.filter(w => w.status === 'draft');
    if (draftWorkflows.length > 0) {
      const mostRecentDraftWorkflow = draftWorkflows.sort((a,b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime())[0];
      items.push({
        title: "Complete Automation Workflow",
        description: `${draftWorkflows.length} draft workflow${draftWorkflows.length > 1 ? 's' : ''} waiting`,
        page: "AutomationHub",
        icon: Zap,
        color: "purple",
        badge: "Draft",
        lastUpdated: mostRecentDraftWorkflow?.updated_date
      });
    }

    // Check for draft campaigns
    const draftCampaigns = campaigns.filter(c => c.status === 'draft');
    if (draftCampaigns.length > 0) {
      const mostRecentDraftCampaign = draftCampaigns.sort((a,b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime())[0];
      items.push({
        title: "Launch Marketing Campaign",
        description: `${draftCampaigns.length} campaign${draftCampaigns.length > 1 ? 's' : ''} ready to launch`,
        page: "Marketing",
        icon: TrendingUp,
        color: "pink",
        badge: "Draft",
        lastUpdated: mostRecentDraftCampaign?.updated_date
      });
    }

    // Check for draft loops
    const draftLoops = loops.filter(l => l.status === 'draft');
    if (draftLoops.length > 0) {
      const mostRecentDraftLoop = draftLoops.sort((a,b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime())[0];
      items.push({
        title: "Publish Learn & Earn Loop",
        description: `${draftLoops.length} loop${draftLoops.length > 1 ? 's' : ''} ready to publish`,
        page: "LoopBuilder",
        icon: Repeat,
        color: "cyan",
        badge: "Draft",
        lastUpdated: mostRecentDraftLoop?.updated_date
      });
    }

    // Sort by most recently updated
    items.sort((a, b) => {
      const dateA = new Date(a.lastUpdated || 0);
      const dateB = new Date(b.lastUpdated || 0);
      return dateB.getTime() - dateA.getTime();
    });

    return items.slice(0, 3); // Show top 3 most recent
  };

  const resumeItems = getResumeItems();

  const steps = [
    {
      title: "Build Your Brand",
      description: "Create your unique brand identity with Aura",
      icon: Sparkles,
      page: "BrandBuilder",
      completed: currentBrand?.status === 'completed',
      color: "green"
    },
    {
      title: "Full-Stack MVP Development",
      description: "Build complete applications with Boltz - Frontend to Cloud",
      icon: Rocket,
      page: "MVPCreator",
      completed: currentMVP?.legal_accepted,
      color: "yellow"
    },
    {
      title: "Automation Hub",
      description: "Automate marketing & business workflows",
      icon: Zap,
      page: "AutomationHub",
      completed: workflows.filter(w => w.status === 'active').length > 0,
      color: "purple"
    },
    {
      title: "Learn Marketing",
      description: "Master strategies to grow your business",
      icon: TrendingUp,
      page: "Marketing",
      completed: campaigns.some(c => c.status === 'active'), // Assuming completion if any campaign is active
      color: "blue"
    },
    {
      title: "Build Your Loop",
      description: "Create your Learn & Earn marketing funnel",
      icon: Repeat,
      page: "LoopBuilder",
      completed: loops.some(l => l.status === 'active'), // Assuming completion if any loop is active
      color: "pink"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <OnboardingFlow
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-900/30 to-green-900/30">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-yellow-400 mb-2">
                  Welcome back, {user?.full_name || 'Entrepreneur'}! 👋
                </h1>
                <p className="text-xl text-white font-semibold">
                  Let's continue building your digital empire
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowOnboarding(true)}
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Restart Tour
                </Button>
                <Button
                  onClick={() => navigate(createPageUrl("Profile"))}
                  className="gold-gradient text-black hover:opacity-90"
                >
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Admin Status or Subscription Status */}
      {isAdmin ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-400">
                      ADMIN ACCESS - UNLIMITED
                    </p>
                    <p className="text-white font-semibold">
                      Full access to all features • No subscription required
                    </p>
                  </div>
                </div>
                <Badge className="bg-purple-600 text-white px-4 py-2">
                  <Crown className="w-4 h-4 mr-2" />
                  Administrator
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : currentSubscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2 border-green-500/30 bg-gray-900">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full green-gradient flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-400">
                      {currentSubscription.tier.toUpperCase().replace('_', ' ')} Plan
                    </p>
                    <p className="text-white font-semibold">
                      {currentSubscription.status === 'trial'
                        ? `${calculateDaysLeft()} days left in trial`
                        : 'Active subscription'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(createPageUrl("Pricing"))}
                  variant="outline"
                  className="border-green-500/30 text-green-400"
                >
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Continue Where You Left Off Section */}
      {resumeItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="border-2 border-blue-500/30 bg-gradient-to-r from-blue-900/30 to-cyan-900/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-blue-400" />
                <CardTitle className="text-2xl text-blue-400">Continue Where You Left Off</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {resumeItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      className="border-2 border-blue-500/30 bg-gray-900 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => navigate(createPageUrl(item.page))}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg ${item.color === 'green' ? 'green-gradient' : item.color === 'yellow' ? 'gold-gradient' : item.color === 'purple' ? 'bg-gradient-to-br from-purple-600 to-indigo-600' : item.color === 'pink' ? 'bg-gradient-to-br from-pink-600 to-rose-600' : item.color === 'cyan' ? 'bg-gradient-to-br from-cyan-600 to-blue-600' : 'bg-gray-700'} flex items-center justify-center`}>
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <Badge className={`${item.color === 'green' ? 'bg-green-600' : item.color === 'yellow' ? 'bg-yellow-600' : item.color === 'purple' ? 'bg-purple-600' : item.color === 'pink' ? 'bg-pink-600' : item.color === 'cyan' ? 'bg-cyan-600' : 'bg-gray-500'} text-white text-xs mb-2`}>
                              {item.badge}
                            </Badge>
                            <h3 className="text-base font-bold text-white">{item.title}</h3>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Model Picker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-2 border-purple-500/30 bg-gray-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-purple-400" />
              <div>
                <CardTitle className="text-2xl text-purple-400">AI Assistant Lineup</CardTitle>
                <p className="text-sm text-gray-400 mt-1">Choose your specialized AI model for different tasks</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AIModelPicker />
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Steps */}
      <div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">Your Journey</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Card
                className={`border-2 ${step.completed ? 'border-green-500/30 bg-green-950/20' : 'border-yellow-500/30 bg-gray-900'} hover:shadow-xl transition-all cursor-pointer`}
                onClick={() => navigate(createPageUrl(step.page))}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${step.completed ? 'green-gradient' : 'gold-gradient'} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-yellow-400">{step.title}</h3>
                        {step.completed && (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </div>
                      <p className="text-white mb-4">{step.description}</p>
                      <Button
                        variant="ghost"
                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 p-0"
                      >
                        {step.completed ? 'View Details' : 'Get Started'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">Your Progress</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-2 border-green-500/30 bg-gray-900">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Brands Created</p>
                  <p className="text-3xl font-bold text-green-400">{brands.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-500/30 bg-gray-900">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Rocket className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">MVPs Created</p>
                  <p className="text-3xl font-bold text-yellow-400">{mvps.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500/30 bg-gray-900">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Automations</p>
                  <p className="text-3xl font-bold text-purple-400">{workflows.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/30 bg-gray-900">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Days Active</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {user?.created_date ? Math.floor((Date.now() - new Date(user.created_date).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
