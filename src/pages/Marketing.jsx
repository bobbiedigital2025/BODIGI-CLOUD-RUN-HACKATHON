
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  TrendingUp, 
  Target, 
  Users, 
  MessageSquare,
  Mail,
  Share2,
  BarChart,
  Lightbulb,
  ArrowRight,
  Plus, // New icon
  Sparkles, // New icon
  Calendar, // New icon
  DollarSign, // New icon
  Eye, // New icon
  MousePointerClick, // New icon
  ShoppingCart, // New icon
  Loader2, // New icon
  CheckCircle, // New icon
  Play, // New icon
  Pause, // New icon
  Edit, // New icon
  Trash2, // New icon
  Brain // New icon
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Moved from original code to maintain order
import { createPageUrl } from "@/utils"; // Moved from original code to maintain order

export default function Marketing() {
  const navigate = useNavigate();
  const [view, setView] = useState("overview"); // overview, campaigns, ai-assistant, analytics
  const [selectedCampaign, setSelectedCampaign] = useState(null); // Not used in this current implementation, but kept from outline
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => base44.entities.Brand.list('-updated_date', 10),
    initialData: []
  });

  const { data: mvps = [] } = useQuery({
    queryKey: ['mvps'],
    queryFn: () => base44.entities.MVP.list('-updated_date', 10),
    initialData: []
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['marketing-campaigns'],
    queryFn: () => base44.entities.MarketingCampaign.list('-created_date', 50),
    initialData: []
  });

  const createCampaignMutation = useMutation({
    mutationFn: (campaignData) => base44.entities.MarketingCampaign.create(campaignData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
    }
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, campaignData }) => base44.entities.MarketingCampaign.update(id, campaignData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id) => base44.entities.MarketingCampaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
    }
  });

  const currentBrand = brands[0]; // Assuming the first brand is the current one
  const currentMVP = mvps[0];     // Assuming the first MVP is the current one

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalSpend = campaigns.reduce((sum, c) => sum + (c.performance_metrics?.spend || 0), 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.performance_metrics?.revenue || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.performance_metrics?.impressions || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.performance_metrics?.clicks || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.performance_metrics?.conversions || 0), 0);
  const avgROI = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + (c.performance_metrics?.roi || 0), 0) / campaigns.length 
    : 0;

  const handleGenerateStrategy = async () => {
    setIsGenerating(true);
    
    try {
      const brandInfo = currentBrand ? JSON.stringify(currentBrand) : 'No brand data available. Provide more context for your brand.';
      const mvpInfo = currentMVP ? JSON.stringify(currentMVP) : 'No MVP data available. Provide more context for your MVP.';
      const pastCampaigns = campaigns.map(c => ({
        name: c.name,
        type: c.campaign_type,
        performance: c.performance_metrics
      }));

      const strategy = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert marketing strategist for a cutting-edge AI company. Analyze this business and create a comprehensive marketing strategy.

Brand Information:
${brandInfo}

MVP Information:
${mvpInfo}

Past Campaign Performance (if available):
${pastCampaigns.length > 0 ? JSON.stringify(pastCampaigns) : 'No past campaigns found.'}

Create a detailed marketing strategy that includes:
1. Target audience analysis (who are they, what are their pain points, where do they spend time online)
2. Recommended marketing channels (specific platforms, rationale)
3. Content strategy (types of content, themes, call-to-actions)
4. Budget allocation suggestions (e.g., % for paid ads, content creation, etc.)
5. Key Performance Indicators (KPIs) to track for each channel
6. Timeline and milestones (e.g., 30-day, 90-day plan)

Make it actionable, specific to this business, and innovative. Focus on digital growth.`,
      });

      const newCampaign = await createCampaignMutation.mutateAsync({
        name: `Marketing Strategy ${new Date().toLocaleDateString()}`,
        brand_id: currentBrand?.id || "N/A", // Use N/A if brand_id is undefined
        campaign_type: "mixed",
        status: "draft",
        strategy: typeof strategy === 'string' ? strategy : JSON.stringify(strategy, null, 2), // Ensure string or formatted JSON
        target_audience: currentBrand?.target_audience || currentMVP?.target_audience || "General audience looking for AI solutions",
        goals: ["Increase brand awareness", "Generate leads", "Drive conversions"]
      });

      setSelectedCampaign(newCampaign);
      setView("campaigns");
      alert('Marketing strategy generated and saved!');
    } catch (error) {
      console.error('Error generating strategy:', error);
      alert('Failed to generate strategy. Please ensure your brand and MVP data are setup and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAdCopy = async (campaign) => {
    setIsGenerating(true);
    
    try {
      const brandInfo = currentBrand ? JSON.stringify(currentBrand) : 'No brand data';
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert copywriter for a tech startup. Generate compelling ad copy for this campaign.

Brand Information: ${brandInfo}
Campaign Name: ${campaign.name}
Campaign Type: ${campaign.campaign_type}
Target Audience: ${campaign.target_audience}
Campaign Goals: ${campaign.goals?.join(', ')}

Generate 3 variations of ad copy, suitable for platforms like Google Ads or Facebook Ads. Each variation should include:
- A strong, attention-grabbing headline (max 60 chars)
- Engaging body text highlighting benefits (max 150 chars)
- A clear, powerful call-to-action (max 20 chars, e.g., "Learn More", "Get Started Today")

Focus on problem-solution, benefit-driven messaging.`,
        response_json_schema: {
          type: "object",
          properties: {
            variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string", description: "Headline for the ad" },
                  body: { type: "string", description: "Body text for the ad" },
                  cta: { type: "string", description: "Call to action text" }
                },
                required: ["headline", "body", "cta"]
              }
            }
          },
          required: ["variations"]
        }
      });

      // Take the first variation to store directly, but also store all variations
      const adCopy = {
        headline: response.variations[0].headline,
        body: response.variations[0].body,
        cta: response.variations[0].cta,
        variations: response.variations
      };

      await updateCampaignMutation.mutateAsync({
        id: campaign.id,
        campaignData: { ad_copy: adCopy }
      });

      alert('Ad copy generated successfully!');
    } catch (error) {
      console.error('Error generating ad copy:', error);
      alert('Failed to generate ad copy. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateContentCalendar = async (campaign) => {
    setIsGenerating(true);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a 30-day content calendar for this marketing campaign. Assume today is the start date.

Campaign Name: ${campaign.name}
Campaign Type: ${campaign.campaign_type}
Target Audience: ${campaign.target_audience}
Platforms: ${campaign.platforms?.join(', ') || 'LinkedIn, Twitter, Blog, Email Newsletter'}
Campaign Goals: ${campaign.goals?.join(', ') || 'Increase engagement, drive traffic'}

Generate 30 days of content ideas. For each day, include:
- Date (YYYY-MM-DD format, starting from today)
- Content type (e.g., "LinkedIn Post", "Blog Article", "Instagram Reel", "Email Newsletter")
- Platform (e.g., "LinkedIn", "Blog", "Instagram", "Email")
- Content description (a brief, actionable idea for the content, e.g., "Tutorial on using feature X", "Behind-the-scenes of product development", "Customer success story")
- Status: "scheduled"

Ensure content is diverse, engaging, and aligned with the campaign goals and target audience.`,
        response_json_schema: {
          type: "object",
          properties: {
            calendar: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string", format: "date" },
                  content_type: { type: "string" },
                  platform: { type: "string" },
                  content: { type: "string" },
                  status: { type: "string", enum: ["scheduled", "draft", "published"] }
                },
                required: ["date", "content_type", "platform", "content", "status"]
              }
            }
          },
          required: ["calendar"]
        }
      });

      await updateCampaignMutation.mutateAsync({
        id: campaign.id,
        campaignData: { content_calendar: response.calendar }
      });

      alert('Content calendar generated successfully!');
    } catch (error) {
      console.error('Error generating calendar:', error);
      alert('Failed to generate content calendar. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAskAI = async () => {
    if (!userMessage.trim()) return;

    const userMsg = { role: 'user', content: userMessage };
    setAiMessages(prev => [...prev, userMsg]);
    setUserMessage("");
    setIsGenerating(true);

    try {
      const brandInfo = currentBrand ? JSON.stringify(currentBrand) : 'No brand data available.';
      const mvpInfo = currentMVP ? JSON.stringify(currentMVP) : 'No MVP data available.';
      const campaignInfo = campaigns.map(c => ({
        name: c.name,
        type: c.campaign_type,
        status: c.status,
        performance: c.performance_metrics
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert marketing advisor for BoDigi, a platform for entrepreneurs. Help this user with their marketing question.

Here is relevant context about their business from BoDigi:
Brand Information:
${brandInfo}

MVP Information:
${mvpInfo}

Current Marketing Campaigns:
${campaignInfo.length > 0 ? JSON.stringify(campaignInfo) : 'No campaigns currently set up.'}

User Question: ${userMessage}

Provide actionable, specific advice tailored to their business. Be conversational and supportive, focusing on strategies that small businesses or solo entrepreneurs can implement. Keep your response concise and to the point.`,
      });

      const aiMsg = { role: 'assistant', content: response };
      setAiMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error asking AI:', error);
      setAiMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again or rephrase your question.' 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateMetrics = async (campaign, metrics) => {
    // This function is for demonstrating the update, not fully implemented for user input in this view
    await updateCampaignMutation.mutateAsync({
      id: campaign.id,
      campaignData: {
        performance_metrics: {
          ...campaign.performance_metrics,
          ...metrics,
          roi: metrics.revenue && metrics.spend 
            ? ((metrics.revenue - metrics.spend) / metrics.spend * 100).toFixed(2)
            : 0,
          ctr: metrics.clicks && metrics.impressions
            ? (metrics.clicks / metrics.impressions * 100).toFixed(2)
            : 0
        }
      }
    });
  };

  // Original marketing strategies and quick wins data (only strategies are used in the overview now)
  const strategies = [
    {
      title: "Social Media Marketing",
      icon: Share2,
      description: "Build your presence on Instagram, TikTok, Facebook, and LinkedIn",
      tips: [
        "Post consistently (3-5 times per week)",
        "Use relevant hashtags and keywords",
        "Engage with your audience daily",
        "Share behind-the-scenes content",
        "Run contests and giveaways"
      ],
      color: "from-blue-600 to-cyan-600"
    },
    {
      title: "Email Marketing",
      icon: Mail,
      description: "Build an email list and nurture leads into customers",
      tips: [
        "Offer a lead magnet (free guide, discount)",
        "Send weekly newsletters with value",
        "Segment your audience for targeted campaigns",
        "Use compelling subject lines",
        "Include clear calls-to-action"
      ],
      color: "from-green-600 to-emerald-600"
    },
    {
      title: "Content Marketing",
      icon: MessageSquare,
      description: "Create valuable content that attracts and educates your audience",
      tips: [
        "Start a blog on your website",
        "Create how-to videos and tutorials",
        "Share industry insights and tips",
        "Answer common customer questions",
        "Repurpose content across platforms"
      ],
      color: "from-purple-600 to-pink-600"
    },
    {
      title: "Paid Advertising",
      icon: Target,
      description: "Invest in targeted ads to reach your ideal customers",
      tips: [
        "Start with small budgets ($5-10/day)",
        "Test different ad creatives",
        "Target specific demographics and interests",
        "Track ROI and adjust campaigns",
        "Retarget website visitors"
      ],
      color: "from-yellow-600 to-orange-600"
    }
  ];

  // Quick wins section is replaced by quick actions and performance stats in the new overview
  // const quickWins = [
  //   "Set up Google My Business profile",
  //   "Create social media profiles on 3+ platforms",
  //   "Build an email list with a lead magnet",
  //   "Post your first 10 pieces of content",
  //   "Join relevant online communities",
  //   "Ask satisfied customers for reviews",
  //   "Partner with complementary businesses",
  //   "Launch a referral program"
  // ];

  if (view === "ai-assistant") {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 border-purple-500/30 bg-gray-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-purple-400">AI Marketing Assistant</CardTitle>
                  <p className="text-sm text-gray-400">Get personalized marketing advice for your business</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => { setView("overview"); setAiMessages([]); }} // Clear chat on back
                className="border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
              >
                Back to Overview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] overflow-y-auto mb-4 space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
              {aiMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-6">Ask me anything about your marketing strategy!</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                    <Button
                      variant="outline"
                      onClick={() => setUserMessage("What marketing channels should I focus on for my brand?")}
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> What channels should I focus on?
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setUserMessage("How can I improve my current campaign performance?")}
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" /> Improve campaign performance?
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setUserMessage("Suggest content ideas for my social media.")}
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" /> What content should I create?
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setUserMessage("How do I set up a simple email marketing funnel?")}
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
                    >
                      <Mail className="w-4 h-4 mr-2" /> Email funnel basics?
                    </Button>
                  </div>
                </div>
              ) : (
                aiMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-xl ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 p-4 rounded-xl">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                placeholder="Ask about your marketing strategy..."
                className="flex-grow bg-gray-800 border-purple-500/30 focus:border-purple-400 text-white"
                disabled={isGenerating}
              />
              <Button
                onClick={handleAskAI}
                disabled={!userMessage.trim() || isGenerating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "campaigns") {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="border-2 border-blue-500/30 bg-gray-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-400">Your Marketing Campaigns</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setView("overview")}
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-900/20"
                >
                  Back to Overview
                </Button>
                <Button
                  onClick={handleGenerateStrategy}
                  disabled={isGenerating}
                  className="gold-gradient text-black hover:opacity-90"
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  Generate New Strategy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">No campaigns found yet. Let AI create your first one!</p>
                <Button
                  onClick={handleGenerateStrategy}
                  disabled={isGenerating}
                  className="gold-gradient text-black hover:opacity-90"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {isGenerating ? "Generating..." : "Generate Your First Strategy"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="bg-gray-800 border-blue-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{campaign.name}</h3>
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-blue-600 text-white text-xs">{campaign.campaign_type}</Badge>
                            <Badge className={`
                              ${campaign.status === 'active' ? 'bg-green-600' : ''}
                              ${campaign.status === 'paused' ? 'bg-yellow-600' : ''}
                              ${campaign.status === 'draft' ? 'bg-gray-600' : ''}
                              text-white text-xs
                            `}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">Target Audience: {campaign.target_audience}</p>
                          <p className="text-sm text-gray-400">Goals: {campaign.goals?.join(', ')}</p>
                        </div>
                        <div className="flex gap-2">
                          {/* Placeholder for status actions */}
                          {campaign.status === 'active' && <Button size="icon" variant="ghost" className="text-yellow-400 hover:bg-yellow-900/20"><Pause className="w-5 h-5"/></Button>}
                          {campaign.status === 'paused' && <Button size="icon" variant="ghost" className="text-green-400 hover:bg-green-900/20"><Play className="w-5 h-5"/></Button>}
                          {campaign.status !== 'active' && <Button size="icon" variant="ghost" className="text-gray-400 hover:bg-gray-700/20"><Edit className="w-5 h-5"/></Button>}
                          <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-900/20" onClick={() => deleteCampaignMutation.mutate(campaign.id)}><Trash2 className="w-5 h-5"/></Button>
                        </div>
                      </div>

                      {campaign.strategy && (
                        <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                          <h4 className="font-bold text-blue-300 mb-2">Strategy Overview:</h4>
                          <Textarea 
                            readOnly 
                            value={campaign.strategy.substring(0, 500) + (campaign.strategy.length > 500 ? "..." : "")}
                            className="w-full h-32 bg-gray-900 border-gray-700 text-gray-200 resize-none"
                          />
                        </div>
                      )}

                      {campaign.ad_copy && (
                        <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                          <h4 className="font-bold text-purple-300 mb-2">Generated Ad Copy:</h4>
                          <p className="text-sm text-gray-300"><strong>Headline:</strong> {campaign.ad_copy.headline}</p>
                          <p className="text-sm text-gray-300"><strong>Body:</strong> {campaign.ad_copy.body}</p>
                          <p className="text-sm text-gray-300"><strong>CTA:</strong> {campaign.ad_copy.cta}</p>
                          {/* Could add a button here to view all variations */}
                        </div>
                      )}

                      {campaign.content_calendar && campaign.content_calendar.length > 0 && (
                        <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                          <h4 className="font-bold text-green-300 mb-2">Content Calendar (Upcoming):</h4>
                          <ul className="space-y-1 text-sm text-gray-300 max-h-32 overflow-y-auto">
                            {campaign.content_calendar.slice(0, 3).map((item, idx) => ( // Show first 3 items
                              <li key={idx} className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span>{item.date}: {item.content_type} on {item.platform} - {item.content}</span>
                              </li>
                            ))}
                            {campaign.content_calendar.length > 3 && (
                                <li className="text-gray-400">... {campaign.content_calendar.length - 3} more items</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {campaign.performance_metrics && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-700 rounded-lg">
                            <p className="text-xs text-gray-400">Impressions</p>
                            <p className="text-lg font-bold text-white">
                              {campaign.performance_metrics.impressions?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-gray-700 rounded-lg">
                            <p className="text-xs text-gray-400">Clicks</p>
                            <p className="text-lg font-bold text-white">
                              {campaign.performance_metrics.clicks?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-gray-700 rounded-lg">
                            <p className="text-xs text-gray-400">Conversions</p>
                            <p className="text-lg font-bold text-white">
                              {campaign.performance_metrics.conversions || 0}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-gray-700 rounded-lg">
                            <p className="text-xs text-gray-400">ROI</p>
                            <p className="text-lg font-bold text-green-400">
                              {campaign.performance_metrics.roi || 0}%
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleGenerateAdCopy(campaign)}
                          disabled={isGenerating || !currentBrand}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Sparkles className="w-4 h-4 mr-1" />
                          Generate Ad Copy
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleGenerateContentCalendar(campaign)}
                          disabled={isGenerating || !currentBrand}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Generate Calendar
                        </Button>
                        {/* Could add a button for manual metric update or more details */}
                        {/* <Button size="sm" variant="outline" className="border-gray-500 text-gray-300">View Details</Button> */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Overview
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-blue-500/30 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-blue-400">Marketing Hub</h1>
                <p className="text-lg text-gray-300">
                  AI-powered marketing strategies and campaign management for your business
                </p>
              </div>
            </div>
            {/* <p className="text-gray-400">
              Master the fundamentals of digital marketing and start attracting customers today.
            </p> */} {/* Removed as per new design */}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="border-2 border-purple-500/30 bg-gray-900 cursor-pointer hover:border-purple-500 transition-all duration-200"
          onClick={() => setView("ai-assistant")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">AI Marketing Assistant</h3>
                <p className="text-sm text-gray-400">Get personalized advice & insights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-2 border-blue-500/30 bg-gray-900 cursor-pointer hover:border-blue-500 transition-all duration-200"
          onClick={() => setView("campaigns")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">My Campaigns</h3>
                <p className="text-sm text-gray-400">{campaigns.length} campaigns managed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-2 border-green-500/30 bg-gray-900 cursor-pointer hover:border-green-500 transition-all duration-200"
          onClick={handleGenerateStrategy}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                {isGenerating ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Sparkles className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h3 className="font-bold text-white">Generate Strategy</h3>
                <p className="text-sm text-gray-400">{isGenerating ? "Generating..." : "AI-powered marketing plan"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="border-2 border-purple-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Active Campaigns</span>
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">{activeCampaigns.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Impressions</span>
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">{totalImpressions.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Clicks</span>
              <MousePointerClick className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">{totalClicks.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Conversions</span>
              <ShoppingCart className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-400">{totalConversions}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Spend</span>
              <DollarSign className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-red-400">${totalSpend.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Avg ROI</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">{avgROI.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Marketing Strategies - Kept from original file */}
      <div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">Core Marketing Strategies</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {strategies.map((strategy, index) => (
            <motion.div
              key={strategy.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            >
              <Card className="border-2 border-yellow-500/30 bg-gray-900 h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${strategy.color} flex items-center justify-center mb-4`}>
                    <strategy.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-yellow-400">{strategy.title}</CardTitle>
                  <p className="text-gray-400 text-sm">{strategy.description}</p>
                </CardHeader>
                <CardContent>
                  <h4 className="font-bold text-green-400 mb-3">Action Steps:</h4>
                  <ul className="space-y-2">
                    {strategy.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA - Kept from original file */}
      <Card className="border-2 border-green-500/30 bg-gradient-to-r from-green-900/30 to-yellow-900/30">
        <CardContent className="p-8 text-center">
          <h3 className="text-3xl font-bold text-green-400 mb-4">
            Ready to Launch Your Marketing Funnel?
          </h3>
          <p className="text-xl text-gray-300 mb-6">
            Build your Learn & Earn Loop to turn visitors into customers
          </p>
          <Button
            onClick={() => navigate(createPageUrl("LoopBuilder"))}
            size="lg"
            className="gold-gradient text-black hover:opacity-90 px-8 py-6 text-lg font-bold"
          >
            Build Your Loop Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
