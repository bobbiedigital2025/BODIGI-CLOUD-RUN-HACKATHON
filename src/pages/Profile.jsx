
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  CreditCard,
  Sparkles,
  TrendingUp,
  Save,
  Crown,
  Calendar,
  Eye,
  EyeOff,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: async () => {
      if (!user?.email || user?.role === 'admin') return [];
      return await base44.entities.Subscription.filter({ user_email: user.email }, '-created_date', 1);
    },
    enabled: !!user?.email && user?.role !== 'admin',
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => base44.entities.Brand.list('-updated_date', 10),
  });

  const { data: mvps = [] } = useQuery({
    queryKey: ['mvps'],
    queryFn: () => base44.entities.MVP.list('-updated_date', 10),
  });

  const currentSubscription = subscriptions[0];
  const isAdmin = user?.role === 'admin';

  const updateUserMutation = useMutation({
    mutationFn: (userData) => base44.auth.updateMe(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditing(false);
    },
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        company: user.company || '',
        bio: user.bio || '',
        show_contact_to_investors: user.show_contact_to_investors || false,
        seeking_investment: user.seeking_investment || false,
        investment_amount_sought: user.investment_amount_sought || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    await updateUserMutation.mutateAsync(formData);
  };

  const getTierBadge = (tier) => {
    const badges = {
      basic: { color: "bg-blue-600", icon: Sparkles },
      pro: { color: "bg-yellow-600", icon: TrendingUp },
      elite: { color: "bg-purple-600", icon: Crown },
      free_trial: { color: "bg-green-600", icon: Sparkles }
    };
    const badge = badges[tier] || badges.free_trial;
    const Icon = badge.icon;
    return (
      <Badge className={`${badge.color} text-white px-3 py-1`}>
        <Icon className="w-4 h-4 mr-1" />
        {tier?.toUpperCase().replace('_', ' ')}
      </Badge>
    );
  };

  const calculateDaysLeft = () => {
    if (!currentSubscription?.trial_end_date) return 0;
    const now = new Date();
    const endDate = new Date(currentSubscription.trial_end_date);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-400">Loading profile...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="border-2 border-yellow-500/30 bg-gray-900">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-full gold-gradient flex items-center justify-center text-4xl font-bold text-black">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-yellow-400 mb-2">{user?.full_name}</h1>
              <p className="text-gray-400 flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              {isAdmin ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-purple-600 text-white px-4 py-2">
                    <Crown className="w-4 h-4 mr-2" />
                    ADMINISTRATOR
                  </Badge>
                  <Badge className="bg-green-600 text-white px-4 py-2">
                    UNLIMITED ACCESS
                  </Badge>
                </div>
              ) : currentSubscription && (
                <div className="flex flex-wrap items-center gap-3">
                  {getTierBadge(currentSubscription.tier)}
                  {currentSubscription.status === 'trial' && (
                    <Badge className="bg-green-600 text-white">
                      <Calendar className="w-4 h-4 mr-1" />
                      {calculateDaysLeft()} days left in trial
                    </Badge>
                  )}
                </div>
              )}
            </div>
            {!isAdmin && (
              <Button
                onClick={() => navigate(createPageUrl("Pricing"))}
                className="gold-gradient text-black hover:opacity-90"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card className="border-2 border-yellow-500/30 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center justify-between">
              <span>Profile Information</span>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-yellow-500/30 text-yellow-400"
                >
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="border-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="gold-gradient text-black"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter phone number"
                className="bg-gray-800 border-yellow-500/30 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4" />
                Company
              </label>
              <Input
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter company name"
                className="bg-gray-800 border-yellow-500/30 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Bio
              </label>
              <Textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="Tell us about yourself"
                className="bg-gray-800 border-yellow-500/30 h-24 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Investor Visibility Settings */}
        <Card className="border-2 border-green-500/30 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Investor Visibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-green-950/30 rounded-lg border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {formData.show_contact_to_investors ? (
                    <Eye className="w-5 h-5 text-green-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="font-bold text-white">Show Contact to Investors</span>
                </div>
                <Switch
                  checked={formData.show_contact_to_investors || false}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, show_contact_to_investors: checked });
                    if (!isEditing) {
                      updateUserMutation.mutate({ show_contact_to_investors: checked });
                    }
                  }}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              <p className="text-sm text-white">
                Allow investors to see your email and phone number when browsing projects
              </p>
            </div>

            <div className="p-4 bg-yellow-950/30 rounded-lg border border-yellow-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-white">Seeking Investment</span>
                </div>
                <Switch
                  checked={formData.seeking_investment || false}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, seeking_investment: checked });
                    if (!isEditing) {
                      updateUserMutation.mutate({ seeking_investment: checked });
                    }
                  }}
                  className="data-[state=checked]:bg-yellow-600"
                />
              </div>
              <p className="text-sm text-white mb-3">
                Show your projects to investors actively looking for opportunities
              </p>
              
              {formData.seeking_investment && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Investment Amount Sought</label>
                  <Input
                    value={formData.investment_amount_sought || ''}
                    onChange={(e) => setFormData({ ...formData, investment_amount_sought: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g., $50,000 - $100,000"
                    className="bg-gray-800 border-yellow-500/30 text-white"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={() => navigate(createPageUrl("InvestorHub"))}
              className="w-full green-gradient text-white hover:opacity-90"
            >
              View Investor Hub
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <Card className="border-2 border-yellow-500/30 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-yellow-400">
            {isAdmin ? 'Admin Statistics' : 'Usage Statistics'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {isAdmin ? (
            <>
              <div className="flex flex-col p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm mb-1">Status</span>
                <span className="text-purple-400 font-bold text-2xl">ADMIN</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm mb-1">Access Level</span>
                <span className="text-green-400 font-bold text-2xl">UNLIMITED</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm mb-1">Brands</span>
                <span className="text-yellow-400 font-bold text-2xl">{brands.length}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm mb-1">MVPs</span>
                <span className="text-yellow-400 font-bold text-2xl">{mvps.length}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm mb-1">No Limits</span>
                <span className="text-green-400 font-bold text-2xl">∞</span>
              </div>
            </>
          ) : currentSubscription?.features_used ? (
            <>
              <div className="flex flex-col p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm mb-1">Brand Builder</span>
                <span className="text-yellow-400 font-bold text-2xl">
                  {currentSubscription.features_used.brand_builder_uses || 0}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm mb-1">MVP Creator</span>
                <span className="text-yellow-400 font-bold text-2xl">
                  {currentSubscription.features_used.mvp_creator_uses || 0}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm mb-1">Logos</span>
                <span className="text-yellow-400 font-bold text-2xl">
                  {currentSubscription.features_used.logo_generations || 0}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm mb-1">AI Messages</span>
                <span className="text-yellow-400 font-bold text-2xl">
                  {currentSubscription.features_used.ai_messages || 0}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-300 text-sm mb-1">Credits</span>
                <span className="text-green-400 font-bold text-2xl">
                  ${currentSubscription.pay_per_use_credits || 0}
                </span>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-8 col-span-full">
              No subscription active yet.{' '}
              <button
                onClick={() => navigate(createPageUrl("Pricing"))}
                className="text-yellow-400 hover:underline"
              >
                Choose a plan
              </button>
            </p>
          )}
        </CardContent>
      </Card>

      {/* My Projects */}
      <Card className="border-2 border-yellow-500/30 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-yellow-400">My Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-3">Brands Created ({brands.length})</h3>
              <div className="space-y-2">
                {brands.length > 0 ? (
                  brands.map((brand) => (
                    <div key={brand.id} className="p-3 bg-gray-800 rounded-lg flex items-center justify-between">
                      <span className="text-gray-300">{brand.name || 'Unnamed Brand'}</span>
                      <Badge className={brand.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}>
                        {brand.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No brands created yet</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-yellow-400 mb-3">MVPs Created ({mvps.length})</h3>
              <div className="space-y-2">
                {mvps.length > 0 ? (
                  mvps.map((mvp) => (
                    <div key={mvp.id} className="p-3 bg-gray-800 rounded-lg flex items-center justify-between">
                      <span className="text-gray-300">{mvp.name || 'Unnamed MVP'}</span>
                      <Badge className={mvp.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}>
                        {mvp.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No MVPs created yet</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
