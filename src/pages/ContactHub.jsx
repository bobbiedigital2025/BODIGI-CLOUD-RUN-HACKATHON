import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Mail,
  Phone,
  CreditCard,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  Crown,
  Sparkles,
  Rocket,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function ContactHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  // Check if user is admin
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
    enabled: currentUser?.role === 'admin',
    initialData: []
  });

  const { data: allSubscriptions = [], isLoading: subsLoading } = useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 500),
    enabled: currentUser?.role === 'admin',
    initialData: []
  });

  const { data: allContactHub = [], isLoading: contactLoading } = useQuery({
    queryKey: ['all-contact-hub'],
    queryFn: () => base44.entities.ContactHub.list('-last_action_date', 500),
    enabled: currentUser?.role === 'admin',
    initialData: []
  });

  const { data: allBrands = [] } = useQuery({
    queryKey: ['all-brands-admin'],
    queryFn: () => base44.entities.Brand.list('-created_date', 500),
    enabled: currentUser?.role === 'admin',
    initialData: []
  });

  const { data: allMVPs = [] } = useQuery({
    queryKey: ['all-mvps-admin'],
    queryFn: () => base44.entities.MVP.list('-created_date', 500),
    enabled: currentUser?.role === 'admin',
    initialData: []
  });

  // Redirect if not admin
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-red-400 mb-2">Access Denied</h1>
        <p className="text-gray-400">This page is only accessible to administrators.</p>
      </div>
    );
  }

  const isLoading = usersLoading || subsLoading || contactLoading;

  // Combine user data with subscription and contact info
  const enrichedUsers = allUsers.map(user => {
    const subscription = allSubscriptions.find(s => s.user_email === user.email);
    const contactInfo = allContactHub.find(c => c.user_email === user.email);
    const userBrands = allBrands.filter(b => b.created_by === user.email);
    const userMVPs = allMVPs.filter(m => m.created_by === user.email);

    return {
      ...user,
      subscription,
      contactInfo,
      brandsCount: userBrands.length,
      mvpsCount: userMVPs.length
    };
  });

  // Filter users
  const filteredUsers = enrichedUsers.filter(user => {
    const matchesSearch = !searchQuery || 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.subscription?.status === statusFilter;
    const matchesTier = tierFilter === "all" || user.subscription?.tier === tierFilter;
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  // Calculate stats
  const stats = {
    totalUsers: allUsers.length,
    activeSubscriptions: allSubscriptions.filter(s => s.status === 'active').length,
    trialUsers: allSubscriptions.filter(s => s.status === 'trial').length,
    totalRevenue: allContactHub.reduce((sum, c) => sum + (c.total_spent || 0), 0),
    avgRevenuePerUser: allContactHub.length > 0 
      ? allContactHub.reduce((sum, c) => sum + (c.total_spent || 0), 0) / allContactHub.length 
      : 0
  };

  const getTierBadgeColor = (tier) => {
    const colors = {
      basic: "bg-blue-600",
      pro: "bg-yellow-600",
      elite: "bg-purple-600",
      free_trial: "bg-green-600"
    };
    return colors[tier] || "bg-gray-600";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'trial':
        return <Calendar className="w-4 h-4 text-yellow-400" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
        <p className="text-gray-400">Loading contact hub data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center glow-purple">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-purple-400 flex items-center gap-3">
                Contact Hub
                <Badge className="bg-purple-600 text-white">
                  <Crown className="w-4 h-4 mr-1" />
                  Admin Only
                </Badge>
              </h1>
              <p className="text-lg text-gray-300">
                Complete user analytics, subscriptions, and payment data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="border-2 border-blue-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Users</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Active Subs</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.activeSubscriptions}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Trial Users</span>
              <Calendar className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-400">{stats.trialUsers}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">
              ${stats.totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-pink-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Avg/User</span>
              <TrendingUp className="w-5 h-5 text-pink-400" />
            </div>
            <p className="text-3xl font-bold text-pink-400">
              ${stats.avgRevenuePerUser.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 border-purple-500/30 bg-gray-900">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Users
              </label>
              <Input
                placeholder="Search by name, email, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-purple-500/30"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-800 border-purple-500/30">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Tier
              </label>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="bg-gray-800 border-purple-500/30">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free_trial">Free Trial</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="border-2 border-purple-500/30 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-purple-400">
            Users & Contact Information ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No users found matching your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-gray-800 border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* User Info */}
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xl font-bold text-white">
                              {user.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg">{user.full_name || 'Unknown'}</h3>
                              {user.role === 'admin' && (
                                <Badge className="bg-purple-600 text-white text-xs">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Mail className="w-4 h-4 text-gray-500" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <Phone className="w-4 h-4 text-gray-500" />
                                {user.phone}
                              </div>
                            )}
                            {user.company && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <Building2 className="w-4 h-4 text-gray-500" />
                                {user.company}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                              <Calendar className="w-3 h-3" />
                              Joined {new Date(user.created_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Subscription Info */}
                        <div>
                          <h4 className="font-bold text-purple-400 mb-3">Subscription</h4>
                          {user.subscription ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(user.subscription.status)}
                                <Badge className={`${getTierBadgeColor(user.subscription.tier)} text-white`}>
                                  {user.subscription.tier?.toUpperCase().replace('_', ' ')}
                                </Badge>
                                <Badge className="bg-gray-700 text-gray-300">
                                  {user.subscription.status}
                                </Badge>
                              </div>

                              {user.subscription.features_used && (
                                <div className="space-y-1 text-xs text-gray-400">
                                  <p>Brands: {user.subscription.features_used.brand_builder_uses || 0}</p>
                                  <p>MVPs: {user.subscription.features_used.mvp_creator_uses || 0}</p>
                                  <p>Logos: {user.subscription.features_used.logo_generations || 0}</p>
                                  <p>AI Messages: {user.subscription.features_used.ai_messages || 0}</p>
                                </div>
                              )}

                              {user.subscription.trial_end_date && user.subscription.status === 'trial' && (
                                <p className="text-xs text-yellow-400">
                                  Trial ends: {new Date(user.subscription.trial_end_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No active subscription</p>
                          )}
                        </div>

                        {/* Activity & Payment */}
                        <div>
                          <h4 className="font-bold text-purple-400 mb-3">Activity & Payment</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Created:</span>
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 font-bold">{user.brandsCount}</span>
                                <Rocket className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400 font-bold">{user.mvpsCount}</span>
                              </div>
                            </div>

                            {user.contactInfo && (
                              <>
                                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-400">Total Spent</span>
                                    <DollarSign className="w-4 h-4 text-purple-400" />
                                  </div>
                                  <p className="text-xl font-bold text-purple-400">
                                    ${(user.contactInfo.total_spent || 0).toFixed(2)}
                                  </p>
                                </div>

                                {user.contactInfo.last_payment_method && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <CreditCard className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-400">{user.contactInfo.last_payment_method}</span>
                                  </div>
                                )}

                                {user.contactInfo.payment_status && (
                                  <Badge className={`
                                    ${user.contactInfo.payment_status === 'completed' ? 'bg-green-600' : ''}
                                    ${user.contactInfo.payment_status === 'pending' ? 'bg-yellow-600' : ''}
                                    ${user.contactInfo.payment_status === 'failed' ? 'bg-red-600' : ''}
                                    text-white text-xs
                                  `}>
                                    {user.contactInfo.payment_status}
                                  </Badge>
                                )}

                                {user.contactInfo.last_action && (
                                  <p className="text-xs text-gray-500">
                                    Last: {user.contactInfo.last_action}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}