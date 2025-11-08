import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Headphones,
  Send, 
  Loader2, 
  X,
  Minimize2,
  Maximize2,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm your BoDiGi Support assistant. I can help you with:\n\n• Account & subscription questions\n• Feature troubleshooting\n• How to use Brand Builder, MVP Creator, and other tools\n• Technical issues\n• Billing inquiries\n\nWhat can I help you with today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [escalated, setEscalated] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (customQuery = null) => {
    const userQuery = customQuery || query;
    if (!userQuery.trim() || isLoading) return;

    setMessages(prev => [...prev, { 
      role: "user", 
      content: userQuery,
      timestamp: new Date().toISOString()
    }]);
    setQuery("");
    setIsLoading(true);

    try {
      const user = await base44.auth.me();

      // Get user context for better support
      const userProfile = await base44.entities.UserProfile.filter(
        { user_email: user.email },
        '-created_date',
        1
      ).catch(() => []);

      const userBrands = await base44.entities.Brand.filter(
        { created_by: user.email },
        '-created_date',
        5
      ).catch(() => []);

      const userMVPs = await base44.entities.MVP.filter(
        { created_by: user.email },
        '-created_date',
        5
      ).catch(() => []);

      const context = {
        user_email: user.email,
        user_name: user.full_name,
        subscription_tier: user.subscription_tier || 'none',
        profile: userProfile[0] || {},
        brands_count: userBrands.length,
        mvps_count: userMVPs.length,
        recent_brands: userBrands.slice(0, 2).map(b => ({ name: b.name, status: b.status })),
        recent_mvps: userMVPs.slice(0, 2).map(m => ({ name: m.name, status: m.status }))
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are BoDiGi's AI Customer Support Agent. A user needs help.

USER CONTEXT:
${JSON.stringify(context, null, 2)}

CONVERSATION HISTORY:
${messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

USER QUESTION: ${userQuery}

Provide helpful, clear support. If this is a complex issue that requires human intervention (billing problems, technical bugs, account security, legal questions, or user frustration), respond with:

ESCALATE_TO_SUPPORT: {
  "user_email": "${user.email}",
  "issue_summary": "brief summary",
  "issue_details": "detailed description",
  "steps_attempted": ["list of steps"]
}

Then tell the user their issue has been escalated.

Otherwise, provide a helpful, step-by-step solution. Be conversational and supportive.`,
      });

      let responseText = typeof response === 'string' ? response : JSON.stringify(response);

      // Check if response contains escalation
      if (responseText.includes('ESCALATE_TO_SUPPORT:')) {
        try {
          const escalationMatch = responseText.match(/ESCALATE_TO_SUPPORT:\s*(\{[\s\S]*?\})/);
          if (escalationMatch) {
            const escalationData = JSON.parse(escalationMatch[1]);
            
            // Send escalation email
            await base44.integrations.Core.SendEmail({
              from_name: "BoDiGi Support Bot",
              to: "support@bodigi-digital.com",
              subject: "BoDiGi App Escalations - escalated problems",
              body: `
<h2>🚨 Support Escalation from AI Bot</h2>

<p><strong>Label:</strong> BoDiGi App Escalations</p>

<h3>User Information:</h3>
<ul>
  <li><strong>Email:</strong> ${escalationData.user_email}</li>
  <li><strong>Name:</strong> ${user.full_name}</li>
  <li><strong>Subscription:</strong> ${user.subscription_tier || 'none'}</li>
</ul>

<h3>Issue Summary:</h3>
<p>${escalationData.issue_summary}</p>

<h3>Issue Details:</h3>
<p>${escalationData.issue_details}</p>

<h3>User's Original Question:</h3>
<p>"${userQuery}"</p>

<h3>Troubleshooting Steps Attempted by AI:</h3>
<ul>
  ${escalationData.steps_attempted.map(step => `<li>${step}</li>`).join('\n  ')}
</ul>

<h3>User Context:</h3>
<ul>
  <li><strong>Brands Created:</strong> ${context.brands_count}</li>
  <li><strong>MVPs Created:</strong> ${context.mvps_count}</li>
  <li><strong>Recent Activity:</strong> ${context.recent_brands.length > 0 ? context.recent_brands.map(b => b.name).join(', ') : 'None'}</li>
</ul>

<p><em>This email was automatically generated by the BoDiGi Support AI Bot.</em></p>
              `
            });

            setEscalated(true);
            
            // Remove the escalation marker from the response
            responseText = responseText.replace(/ESCALATE_TO_SUPPORT:[\s\S]*?\}/, '').trim();
          }
        } catch (error) {
          console.error('Error processing escalation:', error);
        }
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: responseText,
        timestamp: new Date().toISOString(),
        escalated: responseText.includes('escalated to our human support team')
      }]);

    } catch (error) {
      console.error('Support chat error:', error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I'm having trouble right now. Please try again, or email support@bodigi-digital.com directly for immediate assistance.",
        error: true,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "How do I upgrade my subscription?",
    "Why can't I see my brand?",
    "What's the MVP revenue sharing agreement?",
    "How do I generate a logo?",
    "I need help with billing"
  ];

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-24 right-6 z-40"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
          style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))' }}
        >
          <Headphones className="w-8 h-8" />
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`fixed bottom-24 right-6 z-40 ${isMinimized ? 'w-80' : 'w-[480px]'}`}
      >
        <Card className="border-2 border-blue-500/50 bg-gray-900 shadow-2xl overflow-hidden"
          style={{ filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))' }}>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">BoDiGi Support</CardTitle>
                  <p className="text-xs text-white/80">AI-powered customer service</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {escalated && (
                  <Badge className="bg-green-600 text-white text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Escalated
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-[450px] overflow-y-auto p-4 space-y-4 bg-gray-950">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.error
                          ? 'bg-red-900/30 text-red-300 border border-red-500/30'
                          : 'bg-gray-800 text-gray-200 border border-blue-500/30'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Headphones className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-bold text-blue-400">Support Agent</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {message.escalated && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-500/30">
                          <Badge className="bg-green-600/30 text-green-300 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Issue Escalated to Human Support
                          </Badge>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        <span className="text-sm text-gray-400">Analyzing your question...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length === 1 && (
                <div className="p-4 bg-gray-900 border-t border-blue-500/30">
                  <p className="text-xs text-gray-400 mb-3">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.slice(0, 3).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend(question)}
                        className="text-xs border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500 text-gray-300"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 bg-gray-900 border-t border-blue-500/30">
                <div className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about BoDiGi..."
                    disabled={isLoading}
                    className="flex-1 bg-gray-800 border-blue-500/30 text-white placeholder:text-gray-500"
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={!query.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Need urgent help? Email{" "}
                  <a href="mailto:support@bodigi-digital.com" className="text-blue-400 hover:underline">
                    support@bodigi-digital.com
                  </a>
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}