import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Loader2, 
  Bot,
  Sparkles,
  Zap,
  TrendingUp,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { executeAgent, getAgentConfig } from "./utils/agentToolkit";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sanitizeLLMPrompt, checkRateLimit, sanitizeInput } from "./utils/security";
import { toast } from "sonner";

const agentIcons = {
  aura: Sparkles,
  boltz: Zap,
  marketing_advisor: TrendingUp,
  automation_specialist: RefreshCw
};

const agentColors = {
  aura: 'from-green-600 to-emerald-600',
  boltz: 'from-yellow-600 to-orange-600',
  marketing_advisor: 'from-pink-600 to-rose-600',
  automation_specialist: 'from-purple-600 to-indigo-600'
};

export default function DynamicAgentChat({ 
  agentName = 'aura',
  context = {},
  initialMessage = null,
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [agentConfig, setAgentConfig] = useState(null);
  const [showCodeBlock, setShowCodeBlock] = useState(null);
  const messagesEndRef = React.useRef(null);
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
    enabled: !!user?.email
  });

  const { data: aiModels = [] } = useQuery({
    queryKey: ['ai-models'],
    queryFn: () => base44.entities.AIModel.list('tier_required', 100),
    initialData: []
  });

  const currentSubscription = subscriptions[0];
  const isAdmin = user?.role === 'admin';

  // Determine which agent to use - prioritize user's active model selection
  const activeAgentName = React.useMemo(() => {
    // If user has selected a specific AI model, try to use it
    if (user?.active_model_id) {
      const selectedModel = aiModels.find(m => m.id === user.active_model_id);
      if (selectedModel) {
        // Map model names to agent names
        const modelToAgent = {
          'Aura': 'aura',
          'Boltz': 'boltz',
          'Nova': 'marketing_advisor',
          'CodeX': 'boltz', // CodeX can use Boltz's toolkit
          'Vox': 'aura' // Vox can use Aura's toolkit for now
        };
        return modelToAgent[selectedModel.model_name] || agentName;
      }
    }
    // Otherwise use the default agent for this page
    return agentName;
  }, [user?.active_model_id, aiModels, agentName]);

  // Get the selected model for display
  const selectedModel = React.useMemo(() => {
    if (user?.active_model_id) {
      return aiModels.find(m => m.id === user.active_model_id);
    }
    return null;
  }, [user?.active_model_id, aiModels]);

  const {
    data: conversation,
    isLoading: isLoadingConversation,
    error: conversationError
  } = useQuery({
    queryKey: ['conversation', activeAgentName, user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const conv = await base44.agents.createConversation({
        agent_name: activeAgentName,
        metadata: {
          context: context,
        }
      });
      return conv;
    },
    enabled: !!user?.email && !!activeAgentName,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Load agent configuration and set initial greeting
  useEffect(() => {
    async function loadConfig() {
      const config = await getAgentConfig(activeAgentName);
      setAgentConfig(config);
      
      if (!conversation?.messages?.length && messages.length === 0) {
        // Get the display name for the greeting
        const displayName = selectedModel ? selectedModel.model_name : (config?.display_name || activeAgentName);
        
        // Use custom initial message if provided, otherwise use config greeting, otherwise generate one
        const greeting = initialMessage || config?.whatsappGreeting || 
          `Hi! I'm ${displayName}, ready to help you. How can I assist you today?`;
        
        setMessages([{
          role: 'assistant',
          content: greeting,
          agentName: activeAgentName
        }]);
      }
    }
    loadConfig();
  }, [activeAgentName, initialMessage, messages.length, conversation, selectedModel]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, conversation?.messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageObject) => {
      if (!conversation?.id) {
        throw new Error('No active conversation ID available');
      }

      // Security: Rate limiting (10 messages per minute for non-admins)
      if (!isAdmin) {
        const rateLimitKey = `ai_chat_${user.email}_${activeAgentName}`;
        if (!checkRateLimit(rateLimitKey, 10, 60000)) {
          throw new Error('Rate limit exceeded. Please wait a moment before sending more messages.');
        }
      }

      // Security: Sanitize user input before sending to AI
      const sanitizedContent = sanitizeLLMPrompt(messageObject.content);
      
      // Security: Validate message length
      if (sanitizedContent.length > 10000) {
        throw new Error('Message too long. Please keep messages under 10,000 characters.');
      }

      // Log AI message usage (but not for admins)
      if (user && !isAdmin) {
        try {
          await base44.entities.DataSystem.create({
            user_email: user.email,
            event_type: 'ai_message',
            event_details: {
              agent_name: activeAgentName,
              message_length: sanitizedContent.length,
              context: context
            },
            event_cost: 0.01,
            timestamp: new Date().toISOString(),
            plan_name: currentSubscription?.tier || 'none'
          });

          if (currentSubscription) {
            await base44.entities.Subscription.update(currentSubscription.id, {
              features_used: {
                ...currentSubscription.features_used,
                ai_messages: (currentSubscription.features_used?.ai_messages || 0) + 1
              }
            });
          }
        } catch (error) {
          console.error('Failed to log AI usage:', error);
        }
      }

      return await base44.agents.addMessage(conversation.id, {
        ...messageObject,
        content: sanitizedContent
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', activeAgentName, user?.email] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    },
    onSettled: () => {
      // Cleanup logic
    }
  });

  const renderMessageContent = (content) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }

      parts.push({
        type: 'code',
        language: match[1] || 'javascript',
        content: match[2].trim()
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }

    if (parts.length === 0) {
      return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }

    return (
      <div className="space-y-3">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <p key={index} className="text-sm whitespace-pre-wrap">{part.content}</p>;
          } else {
            return (
              <div key={index} className="relative group">
                <div className="flex items-center justify-between bg-gray-950 px-3 py-2 rounded-t-lg border border-gray-700">
                  <span className="text-xs text-gray-400 font-mono">{part.language}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(part.content);
                      setShowCodeBlock(index);
                      setTimeout(() => setShowCodeBlock(null), 2000);
                    }}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {showCodeBlock === index ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-gray-900 p-4 rounded-b-lg overflow-x-auto border border-t-0 border-gray-700">
                  <code className="text-xs text-green-400 font-mono">{part.content}</code>
                </pre>
              </div>
            );
          }
        })}
      </div>
    );
  };

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    
    if (!trimmedInput) return;
    if (sendMessageMutation.isPending || isLoadingConversation || !conversation?.id) return;

    const sanitizedInputForDisplay = sanitizeInput(trimmedInput);
    
    setInputValue("");
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: sanitizedInputForDisplay
    }]);

    try {
      await sendMessageMutation.mutateAsync({
        role: 'user',
        content: trimmedInput
      });
    } catch (error) {
      console.error('Message sending error in handleSend:', error);
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const AgentIcon = agentIcons[activeAgentName] || Bot;
  const agentColorGradient = agentColors[activeAgentName] || 'from-gray-600 to-gray-700';

  const displayedMessages = (conversation?.messages && conversation.messages.length > 0)
    ? conversation.messages
    : messages;

  const isChatLoading = sendMessageMutation.isPending || isLoadingConversation;

  // Get the display name for UI
  const displayName = selectedModel ? selectedModel.model_name : (agentConfig?.display_name || activeAgentName);

  return (
    <Card className="border-2 border-yellow-500/30 bg-gray-900 h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Agent Header */}
        <div className={`flex items-center justify-between p-4 bg-gradient-to-r ${agentColorGradient} rounded-lg mb-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <AgentIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                {displayName}
              </h3>
              <p className="text-xs text-white/80">
                {selectedModel ? `${selectedModel.specialization} Specialist` : 'AGIstatic Agent'} • Powered by Gemini Cloud
              </p>
            </div>
          </div>
          
          <Badge className="bg-white/20 text-white">
            {activeAgentName === 'boltz' ? 'Full-Stack Toolkit' : 'Dynamic Toolkit'}
          </Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[400px]">
          <AnimatePresence>
            {(displayedMessages || []).map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-yellow-600 text-black'
                      : `bg-gradient-to-r ${agentColorGradient} text-white`
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 text-xs opacity-75">
                      <AgentIcon className="w-3 h-3" />
                      <span>{displayName}</span>
                    </div>
                  )}
                  
                  {message.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    renderMessageContent(message.content)
                  )}

                  {message.toolExecutions && message.toolExecutions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-xs opacity-75 mb-2">
                        🛠️ Tools Executed:
                      </p>
                      {message.toolExecutions.map((exec, i) => (
                        <Badge key={i} className="mr-2 bg-white/20 text-white text-xs">
                          {exec.entity}: {exec.operation}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isChatLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className={`p-4 rounded-lg bg-gradient-to-r ${agentColorGradient}`}>
                <div className="flex items-center gap-2 text-white">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Processing...</span>
                </div>
              </div>
            </motion.div>
          )}

          {sendMessageMutation.isError && sendMessageMutation.error?.message?.includes('Rate limit') && (
            <div className="flex justify-center mt-4">
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-300">Rate limit exceeded. Please wait before sending more messages.</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Chat with ${displayName}...`}
            disabled={isChatLoading || !conversation?.id}
            maxLength={10000}
            className="flex-1 bg-gray-800 border-yellow-500/30 text-white"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isChatLoading || !conversation?.id}
            className="gold-gradient text-black hover:opacity-90"
          >
            {isChatLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Agent Info */}
        {agentConfig && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-yellow-500/20">
            <p className="text-xs text-gray-400">
              <strong className="text-yellow-400">
                {selectedModel ? `${selectedModel.model_name} Capabilities:` : 'Agent Capabilities:'}
              </strong>{' '}
              {selectedModel?.capabilities?.join(', ') || agentConfig.capabilities?.join(', ') || 'General assistance'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}