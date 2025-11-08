
import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, AlertCircle } from "lucide-react";
import DynamicAgentChat from "../components/DynamicAgentChat";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function MVPCreator() {
  const navigate = useNavigate();

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => base44.entities.Brand.list('-updated_date', 1),
    initialData: [],
  });

  const { data: mvps = [] } = useQuery({
    queryKey: ['mvps'],
    queryFn: () => base44.entities.MVP.list('-updated_date', 1),
    initialData: [],
  });

  const completedBrand = brands.find(b => b.status === 'completed');
  const currentMVP = mvps[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="border-none shadow-xl bg-gradient-to-r from-yellow-600 to-yellow-500 text-black glow-gold">
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
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">Full-Stack MVP Creator with Boltz</h1>
                <span className="px-2 py-1 bg-black/20 rounded text-xs font-bold">AGIstatic 2.0</span>
              </div>
              <p className="text-lg opacity-90">Elite full-stack AI developer - Frontend to Backend to Cloud ⚡</p>
              <p className="text-xs opacity-75 mt-1">Complete Application Development • Production Deployments • Powered by Gemini Cloud</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!completedBrand && (
        <Card className="border-2 border-yellow-500 bg-yellow-950/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-400 mb-2">Build Your Brand First</h3>
                <p className="text-gray-300 mb-4">
                  For the best results, create your brand identity with Aura before building your MVP.
                </p>
                <Button 
                  onClick={() => navigate(createPageUrl("BrandBuilder"))}
                  className="green-gradient text-white hover:opacity-90"
                >
                  Go to Brand Builder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentMVP && currentMVP.legal_accepted && (
        <Card className="border-2 border-green-500/30 bg-green-950/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-green-400 mb-2">
                  ✅ MVP Ready for Development: {currentMVP.name}
                </h3>
                <p className="text-sm text-gray-300">
                  Your full-stack MVP specification is complete! Open the builder to start development and deployment.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate(createPageUrl("MVPBuilderPreview"))}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Open Full-Stack Builder
                </Button>
                <Button
                  onClick={() => navigate(createPageUrl("Marketing"))}
                  className="gold-gradient text-black hover:opacity-90"
                >
                  Continue to Marketing →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Highlights */}
      <Card className="border-2 border-yellow-500/30 bg-gray-900">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">🚀 What Boltz Can Build For You</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">FE</span>
              </div>
              <div>
                <p className="font-bold text-white">Frontend Development</p>
                <p className="text-sm text-gray-400">React, Vue, responsive design, animations, PWA</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">BE</span>
              </div>
              <div>
                <p className="font-bold text-white">Backend APIs</p>
                <p className="text-sm text-gray-400">Node.js, Python, REST, GraphQL, authentication</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">DB</span>
              </div>
              <div>
                <p className="font-bold text-white">Database Design</p>
                <p className="text-sm text-gray-400">PostgreSQL, MongoDB, Prisma, data modeling</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">☁️</span>
              </div>
              <div>
                <p className="font-bold text-white">Cloud Deployment</p>
                <p className="text-sm text-gray-400">Google Cloud Run, Docker, CI/CD, auto-scaling</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DynamicAgentChat
        agentName="boltz"
        context={{ page: 'MVPCreator', taskType: 'full_stack_development' }}
        initialMessage="⚡ Hey! I'm Boltz, your elite full-stack AI developer. I don't just design MVPs - I BUILD complete production-ready applications from frontend to backend, databases to cloud deployment.\n\nI can help you with:\n• Frontend UI/UX (React, animations, responsive design)\n• Backend APIs (Node.js, Python, authentication)\n• Database design (SQL, NoSQL, data modeling)\n• Cloud deployment (Docker, Google Cloud Run, CI/CD)\n• Real-time features, payments, and integrations\n\nWhat kind of full-stack application do you want to build? Tell me about your vision and target audience!"
      />
    </div>
  );
}
