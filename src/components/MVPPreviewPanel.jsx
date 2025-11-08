import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  RefreshCw,
  Box,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Maximize2
} from "lucide-react";
import { motion } from "framer-motion";

export default function MVPPreviewPanel({ 
  mvpData, 
  onSave, 
  onRegenerate,
  is3DMode,
  onToggle3D 
}) {
  const [viewMode, setViewMode] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const viewModes = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
  ];

  const getPreviewWidth = () => {
    switch (viewMode) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'w-full';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 backdrop-blur-xl border-r border-yellow-500/30 rounded-l-2xl">
      {/* Toolbar */}
      <div className="p-4 border-b border-yellow-500/30 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-purple-400 text-lg">Live Preview</h3>
            <p className="text-xs text-gray-400">Real-time editing enabled</p>
          </div>
          <Badge className="bg-green-600 text-white">
            <Eye className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-2 mb-3">
          {viewModes.map((mode) => (
            <Button
              key={mode.id}
              variant={viewMode === mode.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode.id)}
              className={viewMode === mode.id 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-purple-500/10"
              }
            >
              <mode.icon className="w-4 h-4 mr-1" />
              {mode.label}
            </Button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            className="flex-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Regenerate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle3D}
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <Box className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-6 bg-gray-950/50">
        <motion.div
          layout
          className={`mx-auto transition-all duration-300 ${getPreviewWidth()}`}
          animate={{
            rotateY: is3DMode ? 10 : 0,
            rotateX: is3DMode ? -5 : 0,
            scale: is3DMode ? 0.9 : 1
          }}
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}
        >
          <Card className="overflow-hidden border-2 border-yellow-500/30 shadow-2xl">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                {/* Hero Section */}
                <div className="relative h-[400px] bg-gradient-to-br from-yellow-600/20 to-orange-600/20 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmYmJmMjQiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTZWMThoNnYxMnptMCAxMmgtNlY0Mmg2di0xMnptMCAxMmgtNlY1NGg2di0xMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
                  <div className="relative z-10 text-center px-6">
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-5xl font-bold text-white mb-4"
                    >
                      {mvpData?.name || "Your MVP Name"}
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-xl text-gray-300 mb-6"
                    >
                      {mvpData?.description || "Your amazing product description goes here"}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Button size="lg" className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-lg px-8">
                        Get Started
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="p-12">
                  <h2 className="text-3xl font-bold text-center text-yellow-400 mb-8">
                    Key Features
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {(mvpData?.features || [
                      { name: "Feature 1", description: "Amazing feature description", value: 10 },
                      { name: "Feature 2", description: "Another great feature", value: 10 },
                      { name: "Feature 3", description: "One more awesome feature", value: 10 }
                    ]).slice(0, 3).map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <Card className="bg-gray-800/50 border-yellow-500/30 h-full hover:border-yellow-500 transition-all">
                          <CardContent className="p-6">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center mb-4">
                              <span className="text-2xl">✨</span>
                            </div>
                            <h3 className="text-xl font-bold text-yellow-400 mb-2">
                              {feature.name}
                            </h3>
                            <p className="text-gray-400">
                              {feature.description}
                            </p>
                            <Badge className="mt-3 bg-green-600 text-white">
                              ${feature.value} value
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-12 text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Ready to Get Started?
                  </h2>
                  <p className="text-xl text-gray-300 mb-6">
                    Join thousands of satisfied customers today
                  </p>
                  <Button size="lg" className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-8">
                    Start Free Trial
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {is3DMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-4"
            >
              <Badge className="bg-purple-600 text-white">
                <Box className="w-3 h-3 mr-1" />
                3D View Active
              </Badge>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-yellow-500/30 bg-gray-900/80">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Auto-save enabled
          </span>
        </div>
      </div>
    </div>
  );
}