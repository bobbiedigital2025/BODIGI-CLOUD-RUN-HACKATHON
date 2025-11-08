import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Rocket,
  CheckCircle,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MVPPreviewWebGL from "../components/MVPPreviewWebGL";
import MVPPreviewPanel from "../components/MVPPreviewPanel";
import BoltzBuilderChat from "../components/BoltzBuilderChat";
import LaunchAnimation from "../components/LaunchAnimation";

export default function MVPBuilderPreview() {
  const [is3DMode, setIs3DMode] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState(null);
  const [showLaunchAnimation, setShowLaunchAnimation] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: mvps = [] } = useQuery({
    queryKey: ['mvps'],
    queryFn: () => base44.entities.MVP.list('-updated_date', 1),
    initialData: [],
  });

  const currentMVP = mvps[0];

  const updateMVPMutation = useMutation({
    mutationFn: ({ id, mvpData }) => base44.entities.MVP.update(id, mvpData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mvps'] });
    },
  });

  const handleSave = async () => {
    if (currentMVP) {
      await updateMVPMutation.mutateAsync({
        id: currentMVP.id,
        mvpData: { 
          ...currentMVP,
          last_saved: new Date().toISOString()
        }
      });
    }
  };

  const handleRegenerate = async () => {
    console.log('Regenerating preview...');
  };

  const handleDeployRequest = () => {
    setIsDeploying(true);
  };

  const handleDeploySuccess = (result) => {
    setIsDeploying(false);
    setDeployedUrl(result.url);
    
    // Trigger launch animation
    setShowLaunchAnimation(true);
  };

  const handleLaunchAnimationComplete = () => {
    setShowLaunchAnimation(false);
  };

  const handleUpdateMVP = (updates) => {
    if (currentMVP) {
      updateMVPMutation.mutate({
        id: currentMVP.id,
        mvpData: { ...currentMVP, ...updates }
      });
    }
  };

  if (!currentMVP) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-2 border-yellow-500/30 bg-gray-900 max-w-md">
          <CardContent className="p-8 text-center">
            <Rocket className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">No MVP Found</h2>
            <p className="text-gray-400 mb-6">
              Create an MVP first to access the builder preview
            </p>
            <Button
              onClick={() => navigate(createPageUrl("MVPCreator"))}
              className="gold-gradient text-black hover:opacity-90"
            >
              Go to MVP Creator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* WebGL Background */}
      <MVPPreviewWebGL />

      {/* Launch Animation */}
      <LaunchAnimation 
        isActive={showLaunchAnimation} 
        onComplete={handleLaunchAnimationComplete}
      />

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-yellow-500/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(createPageUrl("MVPCreator"))}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Creator
              </Button>
              <div className="h-6 w-px bg-yellow-500/30" />
              <div>
                <h1 className="text-xl font-bold text-yellow-400">
                  {currentMVP.name || "MVP Builder"}
                </h1>
                <p className="text-xs text-gray-400">Collaborative workspace with Boltz AI</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {deployedUrl ? (
                <Button
                  variant="outline"
                  onClick={() => window.open(deployedUrl, '_blank')}
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Live MVP
                </Button>
              ) : isDeploying ? (
                <Badge className="bg-blue-600 text-white px-4 py-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Rocket className="w-4 h-4" />
                  </motion.div>
                  Deploying...
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Deployment Success Banner */}
          <AnimatePresence>
            {deployedUrl && !isDeploying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-400">🎉 Deployment Successful!</p>
                        <p className="text-xs text-gray-400">{deployedUrl}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => window.open(deployedUrl, '_blank')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Split View Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
          {/* Left: Preview Panel */}
          <div className="h-full">
            <MVPPreviewPanel
              mvpData={currentMVP}
              onSave={handleSave}
              onRegenerate={handleRegenerate}
              is3DMode={is3DMode}
              onToggle3D={() => setIs3DMode(!is3DMode)}
            />
          </div>

          {/* Right: Boltz Chat Panel */}
          <div className="h-full">
            <BoltzBuilderChat
              mvpData={currentMVP}
              onUpdateMVP={handleUpdateMVP}
              onDeployRequest={handleDeployRequest}
              onDeploySuccess={handleDeploySuccess}
              isDeploying={isDeploying}
            />
          </div>
        </div>
      </div>
    </div>
  );
}