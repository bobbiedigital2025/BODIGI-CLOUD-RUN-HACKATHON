
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, Save } from "lucide-react";
import VoiceChatInterface from "../components/VoiceChatInterface";

export default function LoopBuilder() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! Boltz here again. Now let's create your Learn and Earn Loop - the gamified marketing funnel that will drive sales and keep customers engaged. This will use the 5 premium features from your MVP. Tell me about your marketing goals!"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: loops = [] } = useQuery({
    queryKey: ['loops'],
    queryFn: () => base44.entities.LearnAndEarnLoop.list('-updated_date', 1),
    initialData: [],
  });

  const { data: mvps = [] } = useQuery({
    queryKey: ['mvps'],
    queryFn: () => base44.entities.MVP.list('-updated_date', 1),
    initialData: [],
  });

  const currentLoop = loops[0];
  const currentMVP = mvps[0];

  const createLoopMutation = useMutation({
    mutationFn: (loopData) => base44.entities.LearnAndEarnLoop.create(loopData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loops'] });
    },
  });

  const updateLoopMutation = useMutation({
    mutationFn: ({ id, loopData }) => base44.entities.LearnAndEarnLoop.update(id, loopData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loops'] });
    },
  });

  const handleSendMessage = async (userMessage) => {
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Boltz, creating a Learn and Earn Loop (gamified marketing funnel).

MVP Information:
${currentMVP ? JSON.stringify(currentMVP) : 'No MVP available'}

Current conversation:
${conversationHistory}
user: ${userMessage}

Your task:
1. Understand the user's marketing goals
2. AUTO-SAVE progress using: "SAVE_LOOP: {json_object}"
3. Create a Learn and Earn Loop that includes:
   - Educational content about the MVP
   - Gamification elements (points, badges, progress)
   - The 5 premium features as rewards/incentives
   - Clear call-to-action for subscription/trial
   - Bonus incentives

Example save: "SAVE_LOOP: {"features_included": ["feature1", "feature2"], "loop_url": "https://bodigi.app/loop/xxx"}"

When complete: "SAVE_LOOP: {complete_loop_data with status: "published"}}"

Respond naturally and focus on engagement strategies.`,
      });

      let assistantMessage = response;

      // Auto-save loop data
      if (typeof response === 'string' && response.includes('SAVE_LOOP:')) {
        const loopDataStr = response.match(/SAVE_LOOP:\s*(\{[\s\S]*?\})/)?.[1];
        if (loopDataStr) {
          try {
            const loopData = JSON.parse(loopDataStr);
            const dataToSave = {
              ...loopData,
              mvp_id: currentMVP?.id,
              features_included: loopData.features_included || currentMVP?.features?.map(f => f.name) || [],
              loop_url: loopData.loop_url || `https://bodigi.app/loop/${currentMVP?.id}`,
            };
            
            if (currentLoop) {
              await updateLoopMutation.mutateAsync({
                id: currentLoop.id,
                loopData: dataToSave
              });
            } else {
              await createLoopMutation.mutateAsync(dataToSave);
            }
            
            assistantMessage = response.split('SAVE_LOOP:')[0].trim() + "\n\n💾 *Progress saved*";
          } catch (e) {
            console.error('Error parsing loop data:', e);
          }
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: assistantMessage }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I encountered an error. Could you please try again?" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="border-none shadow-xl bg-gradient-to-r from-yellow-600 to-green-600 text-black glow-gold">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-black/20">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f049e8b39754755a23cad0/a5a6b8d86_boltz_arua_we_got_it_from_here.png"
                alt="Boltz"
                className="w-full h-full object-cover"
                style={{ objectPosition: '70% center' }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Learn and Earn Loop Builder</h1>
              <p className="text-lg opacity-90">Create your gamified marketing funnel with AI</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentLoop && (
        <Card className="border-2 border-green-500/30 bg-green-950/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Save className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-green-400 mb-2">Your Loop Progress</h3>
                {currentLoop.features_included && currentLoop.features_included.length > 0 && (
                  <p className="text-sm text-gray-300 mb-2">
                    <strong className="text-green-400">Features:</strong> {currentLoop.features_included.join(', ')}
                  </p>
                )}
                {currentLoop.status === 'published' && (
                  <div>
                    <p className="text-sm text-gray-300 mb-4">
                      <strong className="text-green-400">Status:</strong> Published! 🎉
                    </p>
                    {currentLoop.loop_url && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-400">Loop URL:</span>
                        <a 
                          href={currentLoop.loop_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:underline flex items-center gap-1"
                        >
                          {currentLoop.loop_url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    <Button 
                      onClick={() => navigate(createPageUrl("Profile"))}
                      className="gold-gradient text-black hover:opacity-90"
                    >
                      View Your Profile →
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <VoiceChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        agentName="Boltz"
        agentType="boltz"
        placeholder="Chat with Boltz about your loop..."
      />
    </div>
  );
}
