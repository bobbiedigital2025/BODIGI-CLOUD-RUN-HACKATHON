
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Lock, CheckCircle, Sparkles, Zap, Mic, Code, TrendingUp, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const modelIcons = {
  brand_design: Sparkles,
  automation_technical: Zap,
  voice_video: Mic,
  development_optimization: Code,
  marketing_ads: TrendingUp,
  content_generation: Sparkles,
  security_compliance: Crown,
};

export default function AIModelPicker() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: models = [] } = useQuery({
    queryKey: ['ai-models'],
    queryFn: () => base44.entities.AIModel.list('tier_required', 100),
    initialData: []
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData) => base44.auth.updateMe(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  const tierHierarchy = {
    free_trial: 0,
    basic: 1,
    pro: 2,
    elite: 3
  };

  const userTierLevel = tierHierarchy[user?.subscription_tier || 'free_trial'] || 0;
  const isAdmin = user?.role === 'admin';

  const isModelUnlocked = (model) => {
    // Admins have access to ALL models
    if (isAdmin) return true;
    
    const modelTierLevel = tierHierarchy[model.tier_required];
    const tierAllows = userTierLevel >= modelTierLevel;
    const purchasedUnlock = user?.unlocked_models?.includes(model.id);
    return tierAllows || purchasedUnlock;
  };

  const handleSelectModel = async (model) => {
    if (!isModelUnlocked(model)) {
      setSelectedModel(model);
      setUpgradeModalOpen(true);
      return;
    }

    await updateUserMutation.mutateAsync({
      active_model_id: model.id
    });

    // Log the model selection
    await base44.entities.DataSystem.create({
      user_email: user.email,
      event_type: 'ai_message',
      event_details: {
        model_name: model.model_name,
        action: 'model_selected'
      },
      event_cost: 0,
      timestamp: new Date().toISOString(),
      plan_name: isAdmin ? 'admin' : user.subscription_tier
    });
  };

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'basic': return 'bg-blue-600';
      case 'pro': return 'bg-yellow-600';
      case 'elite': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">Choose Your AI Assistant</h2>
        <p className="text-gray-400">
          {isAdmin ? (
            <span className="text-purple-400 font-bold">
              👑 ADMIN ACCESS - All AI models unlocked
            </span>
          ) : (
            'Select the AI model that best fits your current task'
          )}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model, index) => {
          const unlocked = isModelUnlocked(model);
          const isActive = user?.active_model_id === model.id;
          const Icon = modelIcons[model.specialization] || Sparkles;

          return (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border-2 border-yellow-500 shadow-xl glow-gold'
                    : unlocked
                    ? 'border-2 border-gray-700 hover:border-yellow-500/50 hover:shadow-lg'
                    : 'border-2 border-gray-800 opacity-60'
                }`}
                onClick={() => handleSelectModel(model)}
                style={{
                  background: unlocked
                    ? `linear-gradient(135deg, ${model.color_theme?.primary}15 0%, ${model.color_theme?.secondary}15 100%)`
                    : 'linear-gradient(135deg, #1f293715 0%, #1f293715 100%)'
                }}
              >
                {!unlocked && !isAdmin && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-300 font-bold">
                        {model.tier_required.toUpperCase()} Required
                      </p>
                      {model.unlock_price > 0 && (
                        <p className="text-sm text-gray-400 mt-1">
                          or unlock for ${model.unlock_price}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {isActive && (
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-green-600 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                )}

                {isAdmin && unlocked && !isActive && (
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-purple-600 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${model.color_theme?.primary} 0%, ${model.color_theme?.secondary} 100%)`
                      }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    {!isAdmin && (
                      <Badge className={`${getTierBadgeColor(model.tier_required)} text-white`}>
                        {model.tier_required.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-2xl" style={{ color: model.color_theme?.primary }}>
                    {model.model_name}
                  </CardTitle>
                  <p className="text-sm text-gray-400 mt-2">{model.description}</p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-2">CAPABILITIES</p>
                      <div className="flex flex-wrap gap-1">
                        {model.capabilities?.slice(0, 3).map((cap, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-gray-700 text-gray-400">
                            {cap}
                          </Badge>
                        ))}
                        {model.capabilities?.length > 3 && (
                          <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                            +{model.capabilities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                      <span className="text-xs text-gray-500">
                        {isAdmin ? 'Admin Access' : 'Cost per call'}
                      </span>
                      <span className="text-sm font-bold" style={{ color: model.color_theme?.primary }}>
                        {isAdmin ? 'FREE' : `$${model.cost_per_call.toFixed(3)}`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Upgrade Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="bg-gray-900 border-yellow-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl text-yellow-400">
              Unlock {selectedModel?.model_name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This AI model requires a higher subscription tier or one-time unlock purchase.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-lg font-bold text-white mb-2">{selectedModel?.model_name}</p>
              <p className="text-sm text-gray-400 mb-4">{selectedModel?.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Required Tier:</span>
                <Badge className={`${getTierBadgeColor(selectedModel?.tier_required)} text-white`}>
                  {selectedModel?.tier_required?.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setUpgradeModalOpen(false);
                  navigate(createPageUrl("Pricing"));
                }}
                className="w-full gold-gradient text-black hover:opacity-90"
                size="lg"
              >
                Upgrade to {selectedModel?.tier_required?.toUpperCase()}
              </Button>

              {selectedModel?.unlock_price > 0 && (
                <Button
                  variant="outline"
                  className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  size="lg"
                >
                  One-Time Unlock for ${selectedModel?.unlock_price}
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => setUpgradeModalOpen(false)}
                className="w-full text-gray-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
