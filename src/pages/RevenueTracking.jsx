import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

export default function RevenueTracking() {
  const [selectedMVP, setSelectedMVP] = useState("all");
  const [dateRange, setDateRange] = useState("all_time");

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: mvps = [] } = useQuery({
    queryKey: ['user-mvps'],
    queryFn: () => base44.entities.MVP.list('-created_date', 100),
    initialData: []
  });

  const { data: revenues = [] } = useQuery({
    queryKey: ['revenues'],
    queryFn: () => base44.entities.Revenue.list('-transaction_date', 500),
    initialData: []
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['payouts'],
    queryFn: () => base44.entities.PayoutSchedule.list('-period_end', 100),
    initialData: []
  });

  // Calculate totals
  const isAdmin = user?.role === 'admin';
  const userRevenues = isAdmin ? revenues : revenues.filter(r => r.user_email === user?.email);

  const filteredRevenues = userRevenues.filter(r => {
    const mvpMatch = selectedMVP === "all" || r.mvp_id === selectedMVP;
    // Add date filtering logic here based on dateRange
    return mvpMatch;
  });

  const totals = filteredRevenues.reduce((acc, rev) => {
    acc.gross += rev.gross_amount;
    acc.bodigiShare += rev.bodigi_share_amount;
    acc.creatorNet += rev.creator_net_amount;
    acc.count++;
    return acc;
  }, { gross: 0, bodigiShare: 0, creatorNet: 0, count: 0 });

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-600",
      processed: "bg-green-600",
      collected: "bg-blue-600",
      failed: "bg-red-600",
      waived: "bg-gray-600"
    };
    return styles[status] || "bg-gray-600";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-green-500/30 bg-gradient-to-r from-green-900/30 to-yellow-900/30">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full green-gradient flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-green-400">
                {isAdmin ? 'Revenue Dashboard' : 'My Revenue'}
              </h1>
              <p className="text-lg text-gray-300">
                Track earnings and revenue share from your MVPs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* First Year Notice */}
      <Card className="border-2 border-yellow-500/30 bg-yellow-950/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Revenue Sharing Agreement</h3>
              <p className="text-gray-300 mb-2">
                As per your agreement, BoDigi receives <strong>10% of revenue</strong> during your MVP's <strong>first year</strong>.
              </p>
              <p className="text-gray-400 text-sm">
                After the first year ends, you keep 100% of all revenue. Check each MVP's launch date below.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-2 border-yellow-500/30 bg-gray-900">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Filter by MVP</label>
              <Select value={selectedMVP} onValueChange={setSelectedMVP}>
                <SelectTrigger className="bg-gray-800 border-yellow-500/30">
                  <SelectValue placeholder="All MVPs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All MVPs</SelectItem>
                  {mvps.map(mvp => (
                    <SelectItem key={mvp.id} value={mvp.id}>
                      {mvp.name || 'Unnamed MVP'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-gray-800 border-yellow-500/30">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_time">All Time</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full gold-gradient text-black">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-2 border-green-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Gross Revenue</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              {formatCurrency(totals.gross)}
            </p>
            <p className="text-sm text-gray-500 mt-1">{totals.count} transactions</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">BoDigi Share (10%)</span>
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-400">
              {formatCurrency(totals.bodigiShare)}
            </p>
            <p className="text-sm text-gray-500 mt-1">First year only</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Your Net Revenue</span>
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {formatCurrency(totals.creatorNet)}
            </p>
            <p className="text-sm text-gray-500 mt-1">After revenue share</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Pending Payout</span>
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {formatCurrency(
                filteredRevenues
                  .filter(r => r.payout_status === 'pending')
                  .reduce((sum, r) => sum + r.creator_net_amount, 0)
              )}
            </p>
            <p className="text-sm text-gray-500 mt-1">Awaiting transfer</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-2 border-yellow-500/30 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-yellow-400">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRevenues.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No revenue transactions yet</p>
              <p className="text-sm mt-2">Revenue will appear here once your MVP starts generating sales</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRevenues.slice(0, 10).map((rev, index) => {
                const mvp = mvps.find(m => m.id === rev.mvp_id);
                return (
                  <motion.div
                    key={rev.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gray-800 rounded-lg border border-yellow-500/20"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-200">
                            {mvp?.name || 'MVP'}
                          </h4>
                          <Badge className={getStatusBadge(rev.payout_status)}>
                            {rev.payout_status}
                          </Badge>
                          {rev.first_year_active && (
                            <Badge className="bg-yellow-600">First Year</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{new Date(rev.transaction_date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{rev.payment_processor}</span>
                          <span>•</span>
                          <span>{rev.transaction_type}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">
                          {formatCurrency(rev.gross_amount, rev.currency)}
                        </p>
                        <p className="text-sm text-yellow-400">
                          BoDigi: {formatCurrency(rev.bodigi_share_amount, rev.currency)}
                        </p>
                        <p className="text-sm text-blue-400">
                          You: {formatCurrency(rev.creator_net_amount, rev.currency)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="border-2 border-blue-500/30 bg-blue-950/30">
        <CardHeader>
          <CardTitle className="text-blue-400">💡 How to Set Up Revenue Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-300">
          <div>
            <h4 className="font-bold text-blue-400 mb-2">1. Add Metadata to Your Payments</h4>
            <p className="text-sm mb-2">When integrating Stripe, PayPal, or Square in your MVP, add this metadata:</p>
            <pre className="bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`// Stripe Example
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5000,
  currency: 'usd',
  metadata: {
    mvp_id: 'YOUR_MVP_ID',
    user_email: 'creator@email.com',
    bodigi_mvp_id: 'YOUR_MVP_ID'  // For automatic tracking
  }
});`}
            </pre>
          </div>

          <div>
            <h4 className="font-bold text-blue-400 mb-2">2. Set Up Webhook Endpoint</h4>
            <p className="text-sm mb-2">Configure your payment processor to send webhooks to:</p>
            <pre className="bg-gray-800 p-3 rounded text-xs">
              https://your-mvp.com/api/webhooks/bodigi-revenue
            </pre>
          </div>

          <div>
            <h4 className="font-bold text-blue-400 mb-2">3. Automatic Revenue Splitting (Recommended)</h4>
            <p className="text-sm">
              Use Stripe Connect for automatic 90/10 split. BoDigi's 10% is automatically deducted, you receive 90% directly.
            </p>
          </div>

          <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
            <p className="font-bold text-yellow-400 mb-2">⚠️ Important</p>
            <p className="text-sm">
              Revenue sharing only applies during your MVP's first year. After 365 days from launch, you keep 100% of revenue.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}