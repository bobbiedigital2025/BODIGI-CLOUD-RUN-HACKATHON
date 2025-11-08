import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Send, 
  Loader2, 
  Sparkles,
  Code,
  Palette,
  Layout,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { deploymentService } from "./DeploymentService";

export default function BoltzBuilderChat({ 
  mvpData,
  onUpdateMVP,
  onDeployRequest,
  onDeploySuccess,
  isDeploying 
}) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! I'm Boltz, your AI builder assistant. Let's create something amazing together! I can help you refine the layout, colors, copy, features, and overall design. When you're satisfied with everything, just let me know and I'll deploy it to the cloud! 🚀\n\nWhat would you like to work on first?",
      suggestions: ["Improve the layout", "Change colors", "Add features", "I'm satisfied - deploy it!"]
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(null);
  const [lastDeploymentError, setLastDeploymentError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDeploy = async () => {
    if (!mvpData) return;

    setLastDeploymentError(null);
    onDeployRequest();
    
    // Add deployment start message
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "Perfect! Let's get your MVP live. I'm starting the deployment process now...",
      isDeployment: true
    }]);

    try {
      const result = await deploymentService.deployMVP(mvpData, (stage) => {
        setDeploymentProgress(stage);
        
        // Update chat with progress
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.isDeployment && lastMsg?.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMsg,
                content: `${stage.message}\n\n${stage.progress}% complete`,
                progress: stage.progress
              }
            ];
          }
          return prev;
        });
      });

      if (result.status === 'SUCCESS') {
        // Deployment succeeded!
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `🎉 **Your MVP is LIVE!**\n\nYour application has been successfully deployed to Google Cloud Run!\n\n🔗 **Live URL:** ${result.url}\n\nYou can now share this link with your users. The app is running on secure, scalable infrastructure and will automatically scale based on traffic.\n\nWant to make changes? Just chat with me and I'll help you update and redeploy!`,
          deploymentSuccess: true,
          url: result.url,
          suggestions: ["Make changes", "View deployment logs", "Share my MVP"]
        }]);

        setDeploymentProgress(null);
        
        // Notify parent component
        if (onDeploySuccess) {
          onDeploySuccess(result);
        }
      } else {
        throw new Error(result.message || 'Deployment failed');
      }
    } catch (error) {
      console.error('Deployment error:', error);
      setLastDeploymentError(error.message);
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Hmm, looks like there was an issue during deployment:\n\n❌ **Error:** ${error.message}\n\nDon't worry! This happens sometimes. Would you like me to:\n1. Try deploying again\n2. Review the deployment logs\n3. Make some changes first`,
        deploymentError: true,
        suggestions: ["Try again", "Show logs", "Make changes first"]
      }]);
      
      setDeploymentProgress(null);
    }
  };

  const handleSend = async (customMessage = null) => {
    const userMessage = customMessage || input;
    if (!userMessage.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // Check if user wants to deploy
      const deployKeywords = ['deploy', 'launch', 'go live', 'satisfied', 'ready', 'host'];
      const wantsDeploy = deployKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      );

      if (wantsDeploy) {
        setIsLoading(false);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Awesome! I can see you're ready to go live. Let me confirm a few things:\n\n✅ MVP design finalized\n✅ Features configured\n✅ Content approved\n\nReady to deploy to Google Cloud Run? This will give you a live HTTPS URL that you can share with anyone!",
          suggestions: ["Yes, deploy now!", "Wait, let me review", "Make final changes"]
        }]);
        return;
      }

      // Handle other requests
      let response = "";
      let action = null;
      
      if (userMessage.toLowerCase().includes('color') || userMessage.toLowerCase().includes('palette')) {
        response = "Great! Let's work on the colors. I can see your brand uses gold and maroon tones. Would you like me to:\n\n1. Brighten the gold accents for more pop\n2. Add gradient overlays for depth\n3. Adjust contrast for better readability\n\nWhich direction feels right?";
        action = { type: "color_suggestion" };
      } else if (userMessage.toLowerCase().includes('layout')) {
        response = "Perfect! Let's refine the layout. I'm thinking:\n\n1. Hero section with bold headline and CTA\n2. Feature cards in a 3-column grid\n3. Testimonial section with carousel\n4. Footer with links and social\n\nShall I generate this layout?";
        action = { type: "layout_suggestion" };
      } else if (userMessage.toLowerCase().includes('feature')) {
        response = "Excellent! What features would you like to add? Some popular options:\n\n• Contact form with email integration\n• Live chat widget\n• Newsletter signup\n• Social media feeds\n• Pricing tables\n\nTell me what your MVP needs!";
        action = { type: "feature_suggestion" };
      } else if (userMessage.toLowerCase().includes('log')) {
        const logs = await deploymentService.getDeploymentLogs('latest');
        response = "Here are the latest deployment logs:\n\n" + 
          logs.map(log => `[${log.level}] ${log.message}`).join('\n');
      } else {
        response = "I understand! Let me help you with that. Based on your brand and audience, I recommend focusing on:\n\n1. **Visual Impact** - Make it pop with your gold and maroon theme\n2. **Clear Messaging** - Highlight what makes your product unique\n3. **Easy Navigation** - Keep users engaged\n\nWhat aspect would you like to tackle first?";
      }

      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: response,
          action,
          suggestions: action?.type === "deploy_ready" 
            ? ["Deploy Now", "Make more changes"]
            : ["Sounds good!", "Show me alternatives", "Let me think"]
        }]);
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Oops! I encountered an error. Let's try that again!",
        error: true
      }]);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === "Deploy Now" || suggestion === "Yes, deploy now!") {
      handleDeploy();
    } else if (suggestion === "Try again") {
      handleDeploy();
    } else if (suggestion === "I'm satisfied - deploy it!") {
      handleSend("I'm satisfied with my MVP, let's deploy it!");
    } else {
      handleSend(suggestion);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 backdrop-blur-xl border-l border-yellow-500/30 rounded-r-2xl">
      {/* Header */}
      <div className="p-4 border-b border-yellow-500/30 bg-gradient-to-r from-yellow-600/20 to-orange-600/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-yellow-400 text-lg">Boltz AI Builder</h3>
            <p className="text-xs text-gray-400">Your technical co-pilot & deployment assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-yellow-600 to-orange-600 text-white'
                    : message.deploymentSuccess
                    ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white border-2 border-green-400'
                    : message.deploymentError
                    ? 'bg-gradient-to-br from-red-600 to-orange-600 text-white border-2 border-red-400'
                    : 'bg-gray-800/80 text-gray-200 border border-yellow-500/20'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    {message.deploymentSuccess ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : message.deploymentError ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : message.isDeployment ? (
                      <Rocket className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Code className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className="text-xs font-bold text-yellow-400">BOLTZ</span>
                  </div>
                )}
                
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                
                {message.progress !== undefined && (
                  <div className="mt-3">
                    <Progress value={message.progress} className="h-2" />
                  </div>
                )}

                {message.url && (
                  <Button
                    onClick={() => window.open(message.url, '_blank')}
                    className="mt-3 w-full bg-white text-green-600 hover:bg-gray-100"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Open Live MVP
                  </Button>
                )}

                {message.action && (
                  <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center gap-2 text-xs text-yellow-400">
                      <Zap className="w-3 h-3" />
                      <span>Action available</span>
                    </div>
                  </div>
                )}

                {message.suggestions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={suggestion.includes('deploy') || suggestion.includes('Deploy')
                          ? "text-xs border-green-500 bg-green-500/10 hover:bg-green-500/20 hover:border-green-400 text-green-300"
                          : "text-xs border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500"
                        }
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}

                {message.error && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>Error occurred</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-800/80 rounded-2xl p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                <span className="text-sm text-gray-400">Boltz is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-yellow-500/30 bg-gray-800/50">
        <div className="flex gap-2 mb-2 overflow-x-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSend("Change the color scheme")}
            className="text-xs hover:bg-yellow-500/10 text-gray-300"
          >
            <Palette className="w-3 h-3 mr-1" />
            Colors
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSend("Improve the layout")}
            className="text-xs hover:bg-yellow-500/10 text-gray-300"
          >
            <Layout className="w-3 h-3 mr-1" />
            Layout
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSend("Add features")}
            className="text-xs hover:bg-yellow-500/10 text-gray-300"
          >
            <Zap className="w-3 h-3 mr-1" />
            Features
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSend("I'm satisfied - deploy it!")}
            className="text-xs hover:bg-green-500/10 text-green-400"
          >
            <Rocket className="w-3 h-3 mr-1" />
            Deploy
          </Button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-yellow-500/30 bg-gray-900/80">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Boltz anything or say 'deploy' when ready..."
            disabled={isLoading || isDeploying}
            className="flex-1 bg-gray-800 border-yellow-500/30 text-white placeholder:text-gray-500"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || isDeploying}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {deploymentProgress && (
          <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 text-sm text-green-400 mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{deploymentProgress.message}</span>
            </div>
            <Progress value={deploymentProgress.progress} className="h-2" />
          </div>
        )}
      </div>
    </div>
  );
}