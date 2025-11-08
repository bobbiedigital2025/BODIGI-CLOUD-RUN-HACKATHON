
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Shield, 
  Mail, 
  Phone, 
  Building2, 
  User,
  CreditCard,
  Calendar,
  Search,
  Filter,
  Download,
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminHub() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isVerifying, setIsVerifying] = useState(true);

  const { data: currentUser, isLoading: isLoadingUser, error: userError } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        console.error('Failed to get current user:', error);
        throw error;
      }
    },
    retry: 1, // Only retry once
  });

  const { data: allUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 1000),
    initialData: [],
    enabled: !!currentUser && currentUser.role === 'admin', // Only fetch if admin
  });

  const { data: allSubscriptions = [], isLoading: isLoadingSubs } = useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 1000),
    initialData: [],
    enabled: !!currentUser && currentUser.role === 'admin', // Only fetch if admin
  });

  const { data: allBrands = [], isLoading: isLoadingBrands } = useQuery({
    queryKey: ['all-brands-admin'],
    queryFn: () => base44.entities.Brand.list('-created_date', 1000),
    initialData: [],
    enabled: !!currentUser && currentUser.role === 'admin', // Only fetch if admin
  });

  const { data: allMVPs = [], isLoading: isLoadingMVPs } = useQuery({
    queryKey: ['all-mvps-admin'],
    queryFn: () => base44.entities.MVP.list('-created_date', 1000),
    initialData: [],
    enabled: !!currentUser && currentUser.role === 'admin', // Only fetch if admin
  });

  // Verify admin access and redirect if unauthorized
  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // Wait for user data to load
        if (isLoadingUser) return;

        // Check if there was an error loading user, implying unauthenticated or backend issue
        if (userError) {
          console.error('Error loading user, likely unauthenticated or network issue:', userError);
          // Attempt to redirect to login if not authenticated
          const isAuthenticated = await base44.auth.isAuthenticated();
          if (!isAuthenticated) {
            console.warn('User not authenticated, redirecting to login');
            base44.auth.redirectToLogin(createPageUrl('AdminHub'));
          } else {
            // User is authenticated but there was another error fetching their details, redirect to dashboard
            navigate(createPageUrl('Dashboard'));
          }
          return;
        }

        // Check if user is admin
        if (currentUser && currentUser.role !== 'admin') {
          console.warn('Unauthorized access attempt to AdminHub by:', currentUser.email);
          navigate(createPageUrl('Dashboard'));
          return;
        }
        
        // If currentUser is null after isLoadingUser is false and no error, it means user is not logged in.
        // This case should ideally be caught by userError and isAuthenticated check above, but for robustness.
        if (!currentUser) {
          console.warn('No current user found after loading, redirecting to login');
          base44.auth.redirectToLogin(createPageUrl('AdminHub'));
          return;
        }

        // Admin verified
        setIsVerifying(false);
      } catch (error) {
        console.error('Error verifying admin access:', error);
        navigate(createPageUrl('Dashboard'));
      }
    };

    verifyAccess();
  }, [currentUser, isLoadingUser, userError, navigate]);

  // Show loading state while verifying
  if (isVerifying || isLoadingUser) {
    return (
      <div className="max-w-4xl mx-auto mt-20">
        <Card className="border-2 border-purple-500/30 bg-gray-900">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-purple-400 mb-2">Verifying Admin Access</h2>
            <p className="text-gray-400">
              Please wait while we verify your credentials...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if current user is admin - CRITICAL SECURITY CHECK (after initial verification)
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto mt-20">
        <Card className="border-2 border-red-500/30 bg-red-950/30">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">🚫 Access Denied</h2>
            <p className="text-gray-400 mb-4">
              You must be an administrator to access this page.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              This incident has been logged for security purposes.
            </p>
            <Button
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get subscription for each user
  const getUserSubscription = (userEmail) => {
    return allSubscriptions.find(sub => sub.user_email === userEmail);
  };

  // Get user projects count
  const getUserProjectCounts = (userEmail) => {
    const brands = allBrands.filter(b => b.created_by === userEmail);
    const mvps = allMVPs.filter(m => m.created_by === userEmail);
    return { brands: brands.length, mvps: mvps.length };
  };

  // Filter users
  const filteredUsers = allUsers.filter(user => {
    const subscription = getUserSubscription(user.email);
    
    const matchesSearch = !searchQuery || 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTier = tierFilter === "all" || subscription?.tier === tierFilter;
    const matchesStatus = statusFilter === "all" || subscription?.status === statusFilter;
    
    return matchesSearch && matchesTier && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalUsers: allUsers.length,
    activeSubscriptions: allSubscriptions.filter(s => s.status === 'active').length,
    trialUsers: allSubscriptions.filter(s => s.status === 'trial').length,
    totalRevenue: allSubscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        const prices = { basic: 19.99, pro: 49.99, elite: 99.99 };
        return sum + (prices[s.tier] || 0);
      }, 0)
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Subscription', 'Status', 'Trial Ends', 'Brands', 'MVPs'];
    const rows = filteredUsers.map(user => {
      const sub = getUserSubscription(user.email);
      const projects = getUserProjectCounts(user.email);
      return [
        user.full_name || '',
        user.email || '',
        user.phone || '',
        user.company || '',
        sub?.tier || 'none',
        sub?.status || 'none',
        sub?.trial_end_date || '',
        projects.brands,
        projects.mvps
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bodigi-users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTierBadge = (tier) => {
    const colors = {
      basic: "bg-blue-600",
      pro: "bg-yellow-600",
      elite: "bg-purple-600",
      free_trial: "bg-green-600",
      none: "bg-gray-600"
    };
    return (
      <Badge className={`${colors[tier] || colors.none} text-white`}>
        {tier?.toUpperCase().replace('_', ' ') || 'NONE'}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      trial: "bg-green-600",
      active: "bg-blue-600",
      cancelled: "bg-red-600",
      expired: "bg-gray-600"
    };
    return (
      <Badge className={`${colors[status] || 'bg-gray-600'} text-white`}>
        {status?.toUpperCase() || 'NONE'}
      </Badge>
    );
  };

  const isLoading = isLoadingUsers || isLoadingSubs || isLoadingBrands || isLoadingMVPs;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-purple-400">Admin Hub</h1>
                <p className="text-lg text-gray-300">
                  Manage users, subscriptions, and system analytics
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Logged in as: <span className="text-purple-400 font-bold">{currentUser.email}</span>
                </p>
              </div>
            </div>
            <Button
              onClick={exportToCSV}
              disabled={isLoading || filteredUsers.length === 0}
              className="bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:opacity-90"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-2 border-yellow-500/30 bg-yellow-950/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-sm text-yellow-300 font-bold">🔒 Admin-Only Access</p>
              <p className="text-xs text-gray-400">
                This page contains sensitive data and is only accessible to administrators. All access is logged.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-blue-400">
                  {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.totalUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Active Subscriptions</p>
                <p className="text-3xl font-bold text-green-400">
                  {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.activeSubscriptions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Trial Users</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.trialUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Monthly Revenue</p>
                <p className="text-3xl font-bold text-purple-400">
                  {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : `$${stats.totalRevenue.toFixed(2)}`}
                </p>
              </div>
            </div>
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
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-purple-500/30 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Tier
              </label>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="bg-gray-800 border-purple-500/30 text-white">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                  <SelectItem value="free_trial">Free Trial</SelectItem>
                  <SelectItem value="none">No Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-800 border-purple-500/30 text-white">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-2 border-purple-500/30 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-purple-400">
            All Users ({isLoading ? '...' : filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Loading user data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-500/20">
                    <TableHead className="text-purple-400">User Info</TableHead>
                    <TableHead className="text-purple-400">Contact</TableHead>
                    <TableHead className="text-purple-400">Subscription</TableHead>
                    <TableHead className="text-purple-400">Status</TableHead>
                    <TableHead className="text-purple-400">Projects</TableHead>
                    <TableHead className="text-purple-400">Investment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => {
                    const subscription = getUserSubscription(user.email);
                    const projects = getUserProjectCounts(user.email);
                    
                    return (
                      <TableRow key={user.email} className="border-purple-500/20">
                        <TableCell>
                          <div>
                            <p className="font-bold text-gray-200">{user.full_name || 'No Name'}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            {user.company && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Building2 className="w-3 h-3" />
                                {user.company}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {user.phone ? (
                              <p className="text-gray-300 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </p>
                            ) : (
                              <p className="text-gray-500">No phone</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {subscription ? (
                            <div>
                              {getTierBadge(subscription.tier)}
                              {subscription.trial_end_date && subscription.status === 'trial' && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Trial ends: {new Date(subscription.trial_end_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Badge className="bg-gray-600 text-white">No Subscription</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {subscription ? getStatusBadge(subscription.status) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-green-400">Brands: {projects.brands}</p>
                            <p className="text-yellow-400">MVPs: {projects.mvps}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.seeking_investment ? (
                            <div className="text-sm">
                              <Badge className="bg-green-600 text-white mb-1">Seeking</Badge>
                              {user.investment_amount_sought && (
                                <p className="text-xs text-gray-400">{user.investment_amount_sought}</p>
                              )}
                            </div>
                          ) : (
                            <Badge className="bg-gray-600 text-white">Not Seeking</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No users found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
