import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import DynamicAgentChat from "../components/DynamicAgentChat";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function BrandBuilder() {
  const navigate = useNavigate();

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => base44.entities.Brand.list('-updated_date', 1),
    initialData: [],
  });

  const currentBrand = brands[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="border-none shadow-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white glow-green">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/30">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f049e8b39754755a23cad0/a5a6b8d86_boltz_arua_we_got_it_from_here.png"
                alt="Aura"
                className="w-full h-full object-cover"
                style={{ objectPosition: '30% center' }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">Brand Builder Works Best With Aura!!</h1>
                <span className="px-2 py-1 bg-white/20 rounded text-xs font-bold">AGIstatic</span>
              </div>
              <p className="text-lg opacity-90">Create your unique brand identity with AI</p>
              <p className="text-xs opacity-75 mt-1">Powered by Dynamic Toolkit • Gemini Cloud LLM</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentBrand && currentBrand.status === 'completed' && (
        <Card className="border-2 border-green-500/30 bg-green-950/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-green-400 mb-2">
                  ✅ Brand Complete: {currentBrand.name}
                </h3>
                <p className="text-sm text-gray-300">
                  Your brand is ready! Continue to create your logo or start building your MVP.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate(createPageUrl("LogoGenerator"))}
                  className="bg-white text-green-600 hover:bg-gray-100"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Logo
                </Button>
                <Button
                  onClick={() => navigate(createPageUrl("MVPCreator"))}
                  className="gold-gradient text-black hover:opacity-90"
                >
                  Continue to MVP →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <DynamicAgentChat
        agentName="aura"
        context={{ page: 'BrandBuilder', taskType: 'branding' }}
        initialMessage="Hi! I'm Aura, your brand creation expert. I'm excited to help you build your unique brand identity! Let's start by learning about your vision. What kind of business are you looking to create?"
      />
    </div>
  );
}