import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Crown } from "lucide-react";

/**
 * FeatureGate - Controls access to premium features based on subscription
 * IMPORTANT: Admins (role === 'admin') bypass ALL restrictions
 */
export default function FeatureGate({ 
  children, 
  requiredTier = 'basic',
  featureName = 'this feature',
  showUpgradePrompt = true 
}) {
  const navigate = useNavigate();

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
  const isAdmin = user?.role === 'admin';

  // ADMIN BYPASS - Admins have access to EVERYTHING
  if (isAdmin) {
    return <>{children}</>;
  }

  // Tier hierarchy
  const tierHierarchy = {
    free_trial: 0,
    basic: 1,
    pro: 2,
    elite: 3
  };

  const requiredLevel = tierHierarchy[requiredTier] || 0;
  const userLevel = tierHierarchy[currentSubscription?.tier] || 0;

  // Check if user has access
  const hasAccess = userLevel >= requiredLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show upgrade prompt if access denied
  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <Card className="border-2 border-yellow-500/30 bg-gray-900">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-yellow-400" />
        </div>
        <h3 className="text-2xl font-bold text-yellow-400 mb-2">
          Upgrade Required
        </h3>
        <p className="text-gray-300 mb-6">
          {featureName} requires a <span className="font-bold text-yellow-400">{requiredTier.toUpperCase()}</span> plan or higher.
        </p>
        <Button
          onClick={() => navigate(createPageUrl("Pricing"))}
          className="gold-gradient text-black hover:opacity-90"
        >
          View Plans & Upgrade
        </Button>
      </CardContent>
    </Card>
  );
}