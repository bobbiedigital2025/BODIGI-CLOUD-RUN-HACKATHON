import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Rocket,
  Bot,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  X,
  Trophy,
  Zap,
  CheckCircle,
  Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Simple CSS-based confetti animation component
const SimpleConfetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            backgroundColor: ['#fbbf24', '#10b981', '#8b5cf6', '#f59e0b', '#34d399'][Math.floor(Math.random() * 5)]
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ 
            y: window.innerHeight + 100, 
            rotate: Math.random() * 360,
            opacity: 0,
            x: Math.random() * 200 - 100
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

const onboardingSteps = [
  {
    id: "welcome",
    title: "Welcome to BoDiGi™!",
    description: "We're so excited to have you here! Let's take a quick tour of what makes BoDiGi™ special.",
    icon: Trophy,
    color: "yellow",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f049e8b39754755a23cad0/a5a6b8d86_boltz_arua_we_got_it_from_here.png"
            alt="Aura and Boltz"
            className="w-full max-w-md mx-auto rounded-xl shadow-xl mb-4"
          />
        </div>
        <p className="text-lg text-gray-300 text-center">
          BoDiGi™ helps you build your digital business with AI-powered agents who guide you every step of the way.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
            <Sparkles className="w-8 h-8 text-green-400 mb-2" />
            <h3 className="font-bold text-green-400">Aura</h3>
            <p className="text-sm text-gray-400">Your brand creation expert</p>
          </div>
          <div className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
            <Rocket className="w-8 h-8 text-yellow-400 mb-2" />
            <h3 className="font-bold text-yellow-400">Boltz</h3>
            <p className="text-sm text-gray-400">Your MVP creation specialist</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "aura_intro",
    title: "Meet Aura - Your Brand Expert",
    description: "Aura is your warm, creative AI guide who helps you build a unique brand identity.",
    icon: Sparkles,
    color: "green",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f049e8b39754755a23cad0/a5a6b8d86_boltz_arua_we_got_it_from_here.png"
              alt="Aura"
              className="w-full h-full object-cover"
              style={{ objectPosition: '30% center' }}
            />
          </div>
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-1">Aura™</h3>
            <p className="text-sm opacity-90">Feminine • Creative • Supportive</p>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-green-400">What Aura Does:</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Creates your brand name, slogan, and personality</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Designs your color palette and visual identity</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Helps you understand your target audience</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Auto-saves your progress after every conversation</span>
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "boltz_intro",
    title: "Meet Boltz - Your MVP Specialist",
    description: "Boltz is your confident, technical AI guide who helps you build digital solutions.",
    icon: Rocket,
    color: "yellow",
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-black/20">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f049e8b39754755a23cad0/a5a6b8d86_boltz_arua_we_got_it_from_here.png"
              alt="Boltz"
              className="w-full h-full object-cover"
              style={{ objectPosition: '70% center' }}
            />
          </div>
          <div className="text-black">
            <h3 className="text-2xl font-bold mb-1">Boltz™</h3>
            <p className="text-sm opacity-90">Masculine • Technical • Strategic</p>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-yellow-400">What Boltz Does:</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Designs your MVP with 5 premium features ($50 value)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Creates monetization strategies for your product</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Deploys your MVP to Google Cloud Run</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Handles all technical details for you</span>
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "ai_models",
    title: "Choose Your AI Assistant",
    description: "BoDiGi™ offers multiple specialized AI models. Your subscription determines which ones you can access.",
    icon: Bot,
    color: "purple",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
            <Sparkles className="w-6 h-6 text-green-400 mb-2" />
            <h4 className="font-bold text-green-400 mb-1">Aura</h4>
            <Badge className="bg-blue-600 text-white text-xs mb-2">BASIC</Badge>
            <p className="text-xs text-gray-400">Brand & Design</p>
          </div>
          <div className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
            <Rocket className="w-6 h-6 text-yellow-400 mb-2" />
            <h4 className="font-bold text-yellow-400 mb-1">Boltz</h4>
            <Badge className="bg-blue-600 text-white text-xs mb-2">BASIC</Badge>
            <p className="text-xs text-gray-400">MVP & Technical</p>
          </div>
          <div className="p-4 bg-pink-900/30 rounded-lg border border-pink-500/30 opacity-60">
            <TrendingUp className="w-6 h-6 text-pink-400 mb-2" />
            <h4 className="font-bold text-pink-400 mb-1">Nova</h4>
            <Badge className="bg-yellow-600 text-white text-xs mb-2">PRO</Badge>
            <p className="text-xs text-gray-400">Marketing & Ads</p>
          </div>
          <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30 opacity-60">
            <Zap className="w-6 h-6 text-purple-400 mb-2" />
            <h4 className="font-bold text-purple-400 mb-1">Vox</h4>
            <Badge className="bg-purple-600 text-white text-xs mb-2">ELITE</Badge>
            <p className="text-xs text-gray-400">Voice & Video</p>
          </div>
        </div>
        <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
          <p className="text-sm text-gray-300">
            💡 <strong className="text-purple-400">Pro Tip:</strong> You can switch between unlocked AI models 
            anytime from your Dashboard to get specialized help for different tasks!
          </p>
        </div>
      </div>
    )
  },
  {
    id: "brand_journey",
    title: "Your Journey Starts Here",
    description: "Let's walk through the typical BoDiGi™ journey to digital success.",
    icon: TrendingUp,
    color: "blue",
    content: (
      <div className="space-y-4">
        <div className="relative">
          {[
            { step: 1, icon: Sparkles, title: "Build Your Brand", desc: "Chat with Aura to create your identity", color: "green" },
            { step: 2, icon: Rocket, title: "Create Your MVP", desc: "Work with Boltz to design your product", color: "yellow" },
            { step: 3, icon: Zap, title: "Automate & Market", desc: "Set up automations and campaigns", color: "purple" },
            { step: 4, icon: Trophy, title: "Launch & Earn", desc: "Deploy and start making money!", color: "pink" }
          ].map((item, index) => (
            <div key={index} className="flex gap-4 mb-6">
              <div className={`w-12 h-12 rounded-full bg-${item.color}-600 flex items-center justify-center flex-shrink-0`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-bold text-${item.color}-400`}>{item.step}. {item.title}</h4>
                </div>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
          <p className="text-sm text-gray-300">
            ⚡ <strong className="text-yellow-400">Average Time:</strong> Most users complete their 
            brand and MVP in under 2 hours with our AI agents!
          </p>
        </div>
      </div>
    )
  },
  {
    id: "ready",
    title: "You're All Set! 🎉",
    description: "Time to start building your digital empire with BoDiGi™!",
    icon: Crown,
    color: "gold",
    content: (
      <div className="space-y-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto">
          <Crown className="w-12 h-12 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-yellow-400 mb-2">
            WE GOT IT FROM HERE!
          </h3>
          <p className="text-gray-300 text-lg">
            Your AI agents Aura and Boltz are ready to help you succeed.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
            <p className="text-2xl font-bold text-green-400 mb-1">$50</p>
            <p className="text-xs text-gray-400">Premium Features FREE</p>
          </div>
          <div className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
            <p className="text-2xl font-bold text-yellow-400 mb-1">3 Days</p>
            <p className="text-xs text-gray-400">Free Trial Active</p>
          </div>
        </div>
        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
          <p className="text-sm text-gray-300">
            🚀 <strong className="text-green-400">Next Step:</strong> Head to the Brand Builder 
            and start chatting with Aura to create your brand identity!
          </p>
        </div>
      </div>
    )
  }
];

export default function OnboardingFlow({ open, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const updateProgressMutation = useMutation({
    mutationFn: async ({ step, completed }) => {
      if (!user?.email) return;

      const data = {
        user_email: user.email,
        current_step: step,
        completed_steps: completed ? 
          [...(onboardingProgress?.completed_steps || []), onboardingSteps[step].id] 
          : onboardingProgress?.completed_steps || [],
        completed: completed && step === onboardingSteps.length - 1,
        completed_at: completed && step === onboardingSteps.length - 1 ? 
          new Date().toISOString() : undefined
      };

      if (onboardingProgress?.id) {
        return await base44.entities.OnboardingProgress.update(onboardingProgress.id, data);
      } else {
        return await base44.entities.OnboardingProgress.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
    }
  });

  const handleNext = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      await updateProgressMutation.mutateAsync({ 
        step: currentStep + 1, 
        completed: false 
      });
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - show confetti!
      setShowConfetti(true);
      await updateProgressMutation.mutateAsync({ 
        step: currentStep, 
        completed: true 
      });
      setTimeout(() => {
        setShowConfetti(false);
        onClose();
        navigate(createPageUrl("BrandBuilder"));
      }, 3000);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    if (onboardingProgress?.id) {
      await base44.entities.OnboardingProgress.update(onboardingProgress.id, {
        skipped: true
      });
    } else {
      await base44.entities.OnboardingProgress.create({
        user_email: user.email,
        skipped: true,
        current_step: 0
      });
    }
    queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
    onClose();
  };

  const step = onboardingSteps[currentStep];
  const StepIcon = step.icon;
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <>
      {showConfetti && <SimpleConfetti />}
      
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-gray-900 border-2 border-yellow-500/30">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge className={`bg-${step.color}-600 text-white`}>
                Step {currentStep + 1} of {onboardingSteps.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-400 hover:text-white"
              >
                Skip Tour
              </Button>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${step.color}-600 to-${step.color}-500 flex items-center justify-center`}>
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl text-yellow-400">
                  {step.title}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {step.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step.content}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-yellow-400 w-6'
                      : index < currentStep
                      ? 'bg-green-400'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className={`gold-gradient text-black hover:opacity-90 ${
                currentStep === onboardingSteps.length - 1 ? 'px-8' : ''
              }`}
            >
              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  Start Building!
                  <Crown className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}