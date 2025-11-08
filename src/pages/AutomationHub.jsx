
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  Mail,
  Share2,
  BarChart3,
  Loader2,
  Calendar,
  Activity,
  Lock,
  Crown,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import WorkflowBuilder from "../components/WorkflowBuilder";

export default function AutomationHub() {
  const [view, setView] = useState("dashboard");
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: async () => {
      if (!user?.email || user?.role === 'admin') return [];
      return await base44.entities.Subscription.filter({ user_email: user.email }, '-created_date', 1);
    },
    enabled: !!user?.email,
  });

  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ['automation-workflows'],
    queryFn: () => base44.entities.AutomationWorkflow.list('-updated_date', 100),
    initialData: []
  });

  const { data: runs = [], isLoading: runsLoading } = useQuery({
    queryKey: ['automation-runs'],
    queryFn: () => base44.entities.AutomationRun.list('-created_date', 50),
    initialData: []
  });

  const currentSubscription = subscriptions[0];
  const isAdmin = user?.role === 'admin';

  // Check access to Automation Hub
  const hasAccess = () => {
    if (isAdmin) return true;
    if (!currentSubscription) return false;
    
    // During trial, all features including automation are available
    if (currentSubscription.status === 'trial') return true;
    
    // Pro and Elite have unlimited automation
    if (currentSubscription.tier === 'pro' || currentSubscription.tier === 'elite') return true;
    
    // Basic tier - check pay-per-use credits or count
    if (currentSubscription.tier === 'basic') {
      // Allow if they haven't used automation yet during trial
      // The current_workflows property on subscription is just an example. 
      // In a real system, you'd track the number of active automations for the basic user.
      // For now, let's assume if it's basic, they need to purchase.
      // Or, if pay_per_use_credits are available (meaning they bought some)
      if (currentSubscription.pay_per_use_credits > 0) return true;
    }
    
    return false;
  };

  const canCreateWorkflow = () => {
    if (isAdmin) return true;
    if (!currentSubscription) return false;
    
    // During trial or Pro/Elite - unlimited
    if (currentSubscription.status === 'trial') return true;
    if (currentSubscription.tier === 'pro' || currentSubscription.tier === 'elite') return true;
    
    // Basic tier - need to pay per automation, so they can't 'create' directly without purchasing.
    // The flow would be: purchase an automation -> then create it. For simplicity, we block creation here.
    return false;
  };

  const getAccessMessage = () => {
    if (!currentSubscription) {
      return {
        title: "Subscription Required",
        message: "Automation Hub requires a subscription. Start your 3-day free trial to access all features!",
        action: "Start Free Trial",
        actionUrl: "Pricing"
      };
    }

    if (currentSubscription.tier === 'basic' && currentSubscription.status !== 'trial') {
      return {
        title: "Upgrade to Pro for Unlimited Automations",
        message: "Basic plan users can purchase individual automations for $4.99 each, or upgrade to Pro for unlimited access at $20/month value.",
        action: "Upgrade to Pro",
        actionUrl: "Pricing"
      };
    }

    return null;
  };

  const createWorkflowMutation = useMutation({
    mutationFn: (workflowData) => base44.entities.AutomationWorkflow.create(workflowData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-workflows'] });
      // Invalidate subscriptions query to reflect changes in pay-per-use credits or active automations for basic users
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.email] });
    }
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, workflowData }) => base44.entities.AutomationWorkflow.update(id, workflowData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-workflows'] });
    }
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: (id) => base44.entities.AutomationWorkflow.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-workflows'] });
      // Invalidate subscriptions query to reflect changes in active automations for basic users
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.email] });
    }
  });

  const createRunMutation = useMutation({
    mutationFn: (runData) => base44.entities.AutomationRun.create(runData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-runs'] });
    }
  });

  // Filter workflows
  const filteredWorkflows = workflows.filter(w => {
    const matchesCategory = filterCategory === "all" || w.category === filterCategory;
    const matchesStatus = filterStatus === "all" || w.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  // Calculate stats
  const stats = {
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter(w => w.status === 'active').length,
    totalRuns: runs.length,
    successfulRuns: runs.filter(r => r.status === 'completed').length,
    failedRuns: runs.filter(r => r.status === 'failed').length,
    avgSuccessRate: workflows.length > 0 
      ? workflows.reduce((sum, w) => sum + (w.success_rate || 0), 0) / workflows.length 
      : 0
  };

  const recentRuns = runs.slice(0, 10);

  const workflowTemplates = [
    {
      name: "Weekly Email Campaign",
      category: "email",
      description: "Send automated weekly newsletters to your subscribers",
      icon: Mail,
      color: "blue"
    },
    {
      name: "Social Media Scheduler",
      category: "social_media",
      description: "Schedule and post content across all platforms",
      icon: Share2,
      color: "purple"
    },
    {
      name: "Lead Nurture Sequence",
      category: "sales",
      description: "Automatically nurture leads through email sequences",
      icon: TrendingUp,
      color: "green"
    },
    {
      name: "Analytics Report Generator",
      category: "analytics",
      description: "Generate and send weekly performance reports",
      icon: BarChart3,
      color: "yellow"
    }
  ];

  const handleCreateFromTemplate = async (template) => {
    if (!canCreateWorkflow()) {
      alert("Basic plan users need to purchase automations. Upgrade to Pro for unlimited access!");
      navigate(createPageUrl("Pricing"));
      return;
    }

    const newWorkflow = await createWorkflowMutation.mutateAsync({
      name: template.name,
      description: template.description,
      category: template.category,
      trigger_type: "schedule",
      trigger_config: {
        schedule_cron: "0 9 * * 1" // Every Monday at 9am
      },
      workflow_steps: [],
      status: "draft",
      template_source: template.name
    });

    setSelectedWorkflow(newWorkflow);
    setView("builder");
  };

  const handleCreateBlank = async () => {
    if (!canCreateWorkflow()) {
      alert("Basic plan users need to purchase automations. Upgrade to Pro for unlimited access!");
      navigate(createPageUrl("Pricing"));
      return;
    }

    const newWorkflow = await createWorkflowMutation.mutateAsync({
      name: "New Workflow",
      description: "Custom automation workflow",
      category: "custom",
      trigger_type: "manual",
      workflow_steps: [],
      status: "draft"
    });

    setSelectedWorkflow(newWorkflow);
    setView("builder");
  };

  const handleToggleStatus = async (workflow) => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    await updateWorkflowMutation.mutateAsync({
      id: workflow.id,
      workflowData: { status: newStatus }
    });
  };

  const handleRunWorkflow = async (workflow) => {
    await createRunMutation.mutateAsync({
      workflow_id: workflow.id,
      workflow_name: workflow.name,
      trigger_source: "manual",
      status: "running",
      start_time: new Date().toISOString(),
      total_steps: workflow.workflow_steps?.length || 0,
      completed_steps: 0
    });

    // Simulate execution
    setTimeout(async () => {
      const runs = await base44.entities.AutomationRun.filter(
        { workflow_id: workflow.id },
        '-created_date',
        1
      );
      
      if (runs.length > 0) {
        const latestRun = runs[0];
        await base44.entities.AutomationRun.update(latestRun.id, {
          status: "completed",
          end_time: new Date().toISOString(),
          duration_ms: 1500,
          completed_steps: workflow.workflow_steps?.length || 0
        });

        await updateWorkflowMutation.mutateAsync({
          id: workflow.id,
          workflowData: {
            last_run_date: new Date().toISOString(),
            total_runs: (workflow.total_runs || 0) + 1
          }
        });
      }
    }, 2000);
  };

  const handleDeleteWorkflow = async (id) => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      await deleteWorkflowMutation.mutateAsync(id);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      marketing: TrendingUp,
      email: Mail,
      social_media: Share2,
      analytics: BarChart3,
      sales: TrendingUp,
      operations: Zap,
      customer_service: Sparkles,
      custom: Zap
    };
    return icons[category] || Zap;
  };

  const getCategoryColor = (category) => {
    const colors = {
      marketing: "bg-purple-600",
      email: "bg-blue-600",
      social_media: "bg-pink-600",
      analytics: "bg-yellow-600",
      sales: "bg-green-600",
      operations: "bg-orange-600",
      customer_service: "bg-cyan-600",
      custom: "bg-gray-600"
    };
    return colors[category] || "bg-gray-600";
  };

  // Show access restriction message
  if (!hasAccess()) {
    const accessMsg = getAccessMessage();
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
          <CardContent className="p-12 text-center">
            <Lock className="w-20 h-20 text-purple-400 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-purple-400 mb-4">{accessMsg.title}</h1>
            <p className="text-xl text-gray-300 mb-8">{accessMsg.message}</p>
            <Button
              size="lg"
              onClick={() => navigate(createPageUrl(accessMsg.actionUrl))}
              className="gold-gradient text-black hover:opacity-90"
            >
              <Crown className="w-5 h-5 mr-2" />
              {accessMsg.action}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-500/30 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-yellow-400">What You Get with Automation Hub</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Pro Plan ($49.99/month)
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
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
                    All templates included
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Advanced scheduling
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  Pay-Per-Use ($4.99/automation)
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Single workflow
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Unlimited runs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    No monthly fees
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Full template access
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "builder") {
    return (
      <WorkflowBuilder
        workflow={selectedWorkflow}
        onClose={() => {
          setView("dashboard");
          setSelectedWorkflow(null);
        }}
        onSave={async (updatedWorkflow) => {
          await updateWorkflowMutation.mutateAsync({
            id: selectedWorkflow.id,
            workflowData: updatedWorkflow
          });
          setView("dashboard");
          setSelectedWorkflow(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center glow-purple">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-purple-400">Automation Hub</h1>
                <p className="text-lg text-gray-300">
                  Command center for marketing & business automation
                </p>
                {currentSubscription?.status === 'trial' && (
                  <Badge className="bg-green-600 text-white mt-2">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Trial Active - Full Access
                  </Badge>
                )}
              </div>
            </div>
            <Button
              onClick={handleCreateBlank}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Workflow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-2 border-purple-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Workflows</span>
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">{stats.totalWorkflows}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Active</span>
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.activeWorkflows}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Runs</span>
              <Play className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats.totalRuns}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Successful</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.successfulRuns}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Failed</span>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-red-400">{stats.failedRuns}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Avg Success</span>
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-400">{stats.avgSuccessRate.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Templates */}
      {workflows.length === 0 && (
        <Card className="border-2 border-purple-500/30 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-purple-400">Quick Start Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {workflowTemplates.map((template, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="bg-gray-800 border-purple-500/20 hover:border-purple-500/50 cursor-pointer transition-all"
                    onClick={() => handleCreateFromTemplate(template)}
                  >
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl ${getCategoryColor(template.category)} flex items-center justify-center mb-4`}>
                        <template.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-white mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-400">{template.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflows List */}
      {workflows.length > 0 && (
        <Card className="border-2 border-purple-500/30 bg-gray-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-400">Your Workflows</CardTitle>
              <div className="flex gap-3">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40 bg-gray-800 border-purple-500/30">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 bg-gray-800 border-purple-500/30">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredWorkflows.map((workflow, index) => {
                const CategoryIcon = getCategoryIcon(workflow.category);
                
                return (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-gray-800 border-purple-500/20 hover:border-purple-500/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-xl ${getCategoryColor(workflow.category)} flex items-center justify-center flex-shrink-0`}>
                              <CategoryIcon className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-white text-lg">{workflow.name}</h3>
                                <Badge className={`
                                  ${workflow.status === 'active' ? 'bg-green-600' : ''}
                                  ${workflow.status === 'paused' ? 'bg-yellow-600' : ''}
                                  ${workflow.status === 'draft' ? 'bg-gray-600' : ''}
                                  text-white
                                `}>
                                  {workflow.status}
                                </Badge>
                                <Badge className="bg-purple-600/30 text-purple-300">
                                  {workflow.trigger_type}
                                </Badge>
                              </div>

                              <p className="text-sm text-gray-400 mb-3">{workflow.description}</p>

                              <div className="flex items-center gap-6 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {workflow.total_runs || 0} runs
                                </span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {workflow.success_rate || 100}% success
                                </span>
                                {workflow.last_run_date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Last run: {new Date(workflow.last_run_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRunWorkflow(workflow)}
                              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleStatus(workflow)}
                              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                            >
                              {workflow.status === 'active' ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedWorkflow(workflow);
                                setView("builder");
                              }}
                              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteWorkflow(workflow.id)}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Runs */}
      {recentRuns.length > 0 && (
        <Card className="border-2 border-blue-500/30 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-blue-400">Recent Execution History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRuns.map((run, index) => (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-blue-500/20"
                >
                  <div className="flex items-center gap-4">
                    {run.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {run.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                    {run.status === 'running' && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
                    
                    <div>
                      <p className="font-bold text-white">{run.workflow_name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(run.start_time).toLocaleString()} • {run.trigger_source}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Steps</p>
                      <p className="text-sm font-bold text-white">
                        {run.completed_steps}/{run.total_steps}
                      </p>
                    </div>
                    {run.duration_ms && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Duration</p>
                        <p className="text-sm font-bold text-white">
                          {(run.duration_ms / 1000).toFixed(1)}s
                        </p>
                      </div>
                    )}
                    <Badge className={`
                      ${run.status === 'completed' ? 'bg-green-600' : ''}
                      ${run.status === 'failed' ? 'bg-red-600' : ''}
                      ${run.status === 'running' ? 'bg-blue-600' : ''}
                      text-white
                    `}>
                      {run.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
