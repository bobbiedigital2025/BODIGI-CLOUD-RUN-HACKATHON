import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Send,
  Loader2,
  Sparkles,
  X,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  Minimize2,
  Maximize2 } from
"lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { querySupaBrain } from "./utils/supabaseClient";
import { base44 } from "@/api/base44Client";

export default function SupaBrainAgent({ context = {}, suggestedQueries = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
  {
    role: "assistant",
    content: "Hi! I'm your BoDigi AI assistant with access to your complete activity history. Ask me anything about your progress, next steps, or how to use features!",
    contextUsed: 0
  }]
  );
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (customQuery = null) => {
    const userQuery = customQuery || query;
    if (!userQuery.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: userQuery }]);
    setQuery("");
    setIsLoading(true);

    try {
      const user = await base44.auth.me();
      const response = await querySupaBrain(user.email, userQuery, context);

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: response.answer,
        contextUsed: response.context_used,
        recentActivity: response.recent_activity_count
      }]);
    } catch (error) {
      console.error('Supa Brain query error:', error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "I'm having trouble right now. Please try again in a moment.",
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuery = (suggested) => {
    handleSend(suggested);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50">

        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          style={{ filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.5))' }}>

          <Brain className="w-8 h-8" />
        </Button>
      </motion.div>);

  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-6 right-6'} z-50 ${isMinimized ? 'w-80' : 'w-[480px]'}`}>

        <Card className="border-2 border-purple-500/50 bg-gray-900 shadow-2xl overflow-hidden"
        style={{ filter: 'drop-shadow(0 0 30px rgba(147, 51, 234, 0.3))' }}>
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Supa Brain Assistant</CardTitle>
                  <p className="text-xs text-white/80">Powered by your activity history</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20">

                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20">

                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized &&
          <CardContent className="p-0">
              {/* Messages */}
              <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-950">
                {messages.map((message, index) =>
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                    <div
                  className={`max-w-[85%] rounded-lg p-4 ${
                  message.role === 'user' ?
                  'bg-purple-600 text-white' :
                  'bg-gray-800 text-gray-200 border border-purple-500/30'}`
                  }>

                      {message.role === 'assistant' &&
                  <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold text-purple-400">AI Assistant</span>
                        </div>
                  }
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {message.contextUsed !== undefined && message.contextUsed > 0 &&
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-purple-500/30">
                          <Badge className="bg-purple-600/30 text-purple-300 text-xs">
                            <Brain className="w-3 h-3 mr-1" />
                            Used {message.contextUsed} past insights
                          </Badge>
                          {message.recentActivity > 0 &&
                    <Badge className="bg-blue-600/30 text-blue-300 text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {message.recentActivity} recent actions
                            </Badge>
                    }
                        </div>
                  }
                    </div>
                  </motion.div>
              )}

                {isLoading &&
              <div className="flex justify-start">
                    <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        <span className="text-sm text-gray-400">Searching your history...</span>
                      </div>
                    </div>
                  </div>
              }

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Queries */}
              {suggestedQueries.length > 0 && messages.length === 1 &&
            <div className="p-4 bg-gray-900 border-t border-purple-500/30">
                  <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Suggested questions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQueries.map((suggestion, index) =>
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedQuery(suggestion)} className="bg-green-400 px-3 text-xs font-medium opacity-75 rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:text-accent-foreground h-9 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500">


                        <MessageSquare className="w-3 h-3 mr-1" />
                        {suggestion}
                      </Button>
                )}
                  </div>
                </div>
            }

              {/* Input */}
              <div className="p-4 bg-gray-900 border-t border-purple-500/30">
                <div className="flex gap-2">
                  <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your progress..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-800 border-purple-500/30 text-white placeholder:text-gray-500" />

                  <Button
                  onClick={() => handleSend()}
                  disabled={!query.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">

                    {isLoading ?
                  <Loader2 className="w-4 h-4 animate-spin" /> :

                  <Send className="w-4 h-4" />
                  }
                  </Button>
                </div>
              </div>
            </CardContent>
          }
        </Card>
      </motion.div>
    </AnimatePresence>);

}