import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading, 
  agentName,
  agentType,
  placeholder = "Type your message..." 
}) {
  const [inputValue, setInputValue] = React.useState("");
  const messagesEndRef = React.useRef(null);

  const AGENT_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f049e8b39754755a23cad0/a5a6b8d86_boltz_arua_we_got_it_from_here.png";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="border-2 border-yellow-500/20 bg-gray-900 overflow-hidden flex flex-col">
      <CardContent className="p-0 flex flex-col h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-yellow-500/30">
                    <img 
                      src={AGENT_IMAGE} 
                      alt={agentName} 
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: agentType === 'aura' ? '30% center' : '70% center'
                      }}
                    />
                  </div>
                )}
                
                <div className={`max-w-[70%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                  {message.role === 'assistant' && (
                    <p className={`text-xs mb-1 font-medium ${agentType === 'aura' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {agentName}
                    </p>
                  )}
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user' 
                      ? 'gold-gradient text-black ml-auto font-medium' 
                      : 'bg-gray-800 text-gray-200 border border-yellow-500/20'
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center flex-shrink-0 border-2 border-yellow-500/30">
                    <span className="text-black font-bold text-sm">You</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-yellow-500/30">
                <img 
                  src={AGENT_IMAGE} 
                  alt={agentName} 
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: agentType === 'aura' ? '30% center' : '70% center'
                  }}
                />
              </div>
              <div className="bg-gray-800 rounded-2xl px-4 py-3 border border-yellow-500/20">
                <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-yellow-500/20 p-4 bg-gray-800/80 flex-shrink-0">
          <div className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isLoading}
              className="flex-1 bg-gray-900 border-yellow-500/30 text-gray-200 placeholder:text-gray-500 focus-visible:ring-yellow-500"
            />
            <Button 
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="gold-gradient text-black hover:opacity-90 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}