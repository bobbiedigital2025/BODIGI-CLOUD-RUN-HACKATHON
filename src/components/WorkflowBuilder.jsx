import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Play,
  Plus,
  Mail,
  Share2,
  BarChart3,
  Webhook,
  Clock,
  Database,
  Sparkles,
  FileText,
  Zap,
  ChevronRight
} from "lucide-react";

export default function WorkflowBuilder({ workflow, onClose, onSave }) {
  const [workflowData, setWorkflowData] = useState(workflow || {
    name: "New Workflow",
    description: "",
    category: "marketing",
    trigger_type: "manual",
    workflow_steps: [],
    status: "draft"
  });

  const [selectedNode, setSelectedNode] = useState(null);

  const nodeTypes = [
    {
      type: "trigger",
      name: "Trigger",
      icon: Zap,
      color: "bg-yellow-600",
      description: "Start the workflow"
    },
    {
      type: "send_email",
      name: "Send Email",
      icon: Mail,
      color: "bg-blue-600",
      description: "Send an email to recipients"
    },
    {
      type: "post_social",
      name: "Post to Social",
      icon: Share2,
      color: "bg-purple-600",
      description: "Post content to social media"
    },
    {
      type: "webhook",
      name: "Call Webhook",
      icon: Webhook,
      color: "bg-green-600",
      description: "Make an HTTP request"
    },
    {
      type: "wait",
      name: "Wait",
      icon: Clock,
      color: "bg-orange-600",
      description: "Pause for a duration"
    },
    {
      type: "ai_generate",
      name: "AI Generate",
      icon: Sparkles,
      color: "bg-pink-600",
      description: "Generate content with AI"
    },
    {
      type: "save_data",
      name: "Save Data",
      icon: Database,
      color: "bg-cyan-600",
      description: "Store data in database"
    },
    {
      type: "analytics",
      name: "Track Analytics",
      icon: BarChart3,
      color: "bg-indigo-600",
      description: "Log analytics event"
    }
  ];

  const handleAddStep = (nodeType) => {
    const newStep = {
      step_id: `step_${Date.now()}`,
      step_type: nodeType.type,
      step_name: nodeType.name,
      config: {},
      position: {
        x: 100 + (workflowData.workflow_steps?.length || 0) * 200,
        y: 100
      }
    };

    setWorkflowData({
      ...workflowData,
      workflow_steps: [...(workflowData.workflow_steps || []), newStep]
    });
  };

  const handleRemoveStep = (stepId) => {
    setWorkflowData({
      ...workflowData,
      workflow_steps: workflowData.workflow_steps.filter(s => s.step_id !== stepId)
    });
  };

  const handleSave = () => {
    onSave(workflowData);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-500/30 bg-gray-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-purple-500/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <Input
                  value={workflowData.name}
                  onChange={(e) => setWorkflowData({ ...workflowData, name: e.target.value })}
                  className="text-2xl font-bold bg-transparent border-none text-purple-400 p-0 h-auto"
                />
                <p className="text-sm text-gray-400">Workflow Builder</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Workflow
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Node Types */}
        <Card className="border-2 border-purple-500/30 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-purple-400 text-sm">Available Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nodeTypes.map((nodeType) => (
              <Card
                key={nodeType.type}
                className="bg-gray-800 border-purple-500/20 cursor-pointer hover:border-purple-500/50 transition-all"
                onClick={() => handleAddStep(nodeType)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${nodeType.color} flex items-center justify-center flex-shrink-0`}>
                      <nodeType.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{nodeType.name}</p>
                      <p className="text-xs text-gray-400">{nodeType.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Canvas */}
        <div className="lg:col-span-3 space-y-6">
          {/* Settings */}
          <Card className="border-2 border-purple-500/30 bg-gray-900">
            <CardHeader>
              <CardTitle className="text-purple-400">Workflow Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Category</label>
                  <Select
                    value={workflowData.category}
                    onValueChange={(value) => setWorkflowData({ ...workflowData, category: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Trigger Type</label>
                  <Select
                    value={workflowData.trigger_type}
                    onValueChange={(value) => setWorkflowData({ ...workflowData, trigger_type: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="schedule">Scheduled</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="event">Event-based</SelectItem>
                      <SelectItem value="api_call">API Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Description</label>
                <Textarea
                  value={workflowData.description}
                  onChange={(e) => setWorkflowData({ ...workflowData, description: e.target.value })}
                  placeholder="Describe what this workflow does..."
                  className="bg-gray-800 border-purple-500/30"
                />
              </div>
            </CardContent>
          </Card>

          {/* Workflow Steps */}
          <Card className="border-2 border-purple-500/30 bg-gray-900">
            <CardHeader>
              <CardTitle className="text-purple-400">Workflow Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {workflowData.workflow_steps?.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No steps added yet</p>
                  <p className="text-sm text-gray-500">
                    Click on actions from the left panel to add them to your workflow
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workflowData.workflow_steps.map((step, index) => {
                    const nodeType = nodeTypes.find(n => n.type === step.step_type);
                    const NodeIcon = nodeType?.icon || Zap;
                    
                    return (
                      <div key={step.step_id} className="flex items-center gap-3">
                        <Card className="flex-1 bg-gray-800 border-purple-500/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${nodeType?.color || 'bg-gray-600'} flex items-center justify-center`}>
                                  <NodeIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-bold text-white">{step.step_name}</p>
                                  <p className="text-xs text-gray-400">
                                    {nodeType?.description || 'Custom step'}
                                  </p>
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveStep(step.step_id)}
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                              >
                                Remove
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {index < workflowData.workflow_steps.length - 1 && (
                          <ChevronRight className="w-6 h-6 text-purple-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}