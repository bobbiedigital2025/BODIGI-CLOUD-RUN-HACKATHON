
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Download, 
  Save, 
  Loader2,
  CheckCircle,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LogoGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState({
    icon_512: null,
    icon_256: null,
    regular_1024: null,
    regular_512: null,
    transparent_bg: null
  });
  const [activeTab, setActiveTab] = useState("icon");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => base44.entities.Brand.list('-updated_date', 1),
    initialData: []
  });

  const currentBrand = brands[0];

  const updateBrandMutation = useMutation({
    mutationFn: ({ id, brandData }) => base44.entities.Brand.update(id, brandData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    }
  });

  const logoFormats = [
    {
      id: "icon_512",
      name: "App Icon (512×512)",
      description: "Perfect for app stores and mobile apps",
      size: "512×512",
      icon: Smartphone,
      prompt: "Create a simple, bold app icon logo with no text, just the symbol/mark"
    },
    {
      id: "icon_256",
      name: "Small Icon (256×256)",
      description: "For favicons and small displays",
      size: "256×256",
      icon: Smartphone,
      prompt: "Create a simplified app icon, highly recognizable at small sizes"
    },
    {
      id: "regular_1024",
      name: "Full Logo (1024×1024)",
      description: "High-res logo for websites and print",
      size: "1024×1024",
      icon: Monitor,
      prompt: "Create a complete professional logo with brand name"
    },
    {
      id: "regular_512",
      name: "Standard Logo (512×512)",
      description: "General purpose logo",
      size: "512×512",
      icon: Monitor,
      prompt: "Create a professional logo suitable for digital use"
    },
    {
      id: "transparent_bg",
      name: "Transparent Background",
      description: "Logo on transparent background",
      size: "1024×1024",
      icon: ImageIcon,
      prompt: "Create a logo on a completely transparent background, no backdrop"
    }
  ];

  const handleGenerateLogo = async (formatId) => {
    if (!currentBrand || !currentBrand.name) {
      setError("Please create your brand first in Brand Builder!");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const format = logoFormats.find(f => f.id === formatId);
    if (!format) return;

    try {
      const basePrompt = `${format.prompt} for a brand called "${currentBrand.name}". ${currentBrand.slogan ? `Brand slogan: "${currentBrand.slogan}".` : ''} ${currentBrand.personality ? `Brand personality: ${currentBrand.personality}.` : ''} ${currentBrand.target_audience ? `Target audience: ${currentBrand.target_audience}.` : ''} The logo should be clean, memorable, and professional. Make it visually striking and modern.`;

      const result = await base44.integrations.Core.GenerateImage({
        prompt: basePrompt
      });

      if (!result || !result.url) {
        throw new Error('No logo URL returned from generation');
      }

      setGeneratedLogos(prev => ({
        ...prev,
        [formatId]: result.url
      }));

      setError(null);
    } catch (error) {
      console.error('Logo generation error:', error);
      setError(`Failed to generate ${format.name}: ${error.message}`);
      throw error; // Re-throw to be caught by handleGenerateAll
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!currentBrand || !currentBrand.name) {
      setError("Please create your brand first in Brand Builder!");
      return;
    }

    setIsGenerating(true);
    setError(null);

    let successCount = 0;
    let failCount = 0;

    for (const format of logoFormats) {
      try {
        await handleGenerateLogo(format.id);
        successCount++;
        // Small delay between generations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to generate ${format.name}:`, error);
        failCount++;
      }
    }

    setIsGenerating(false);
    
    if (successCount > 0) {
      alert(`Successfully generated ${successCount} logo formats!${failCount > 0 ? ` ${failCount} failed.` : ''}`);
    } else {
      setError('Failed to generate logos. Please try again.');
    }
  };

  const handleSaveToProfile = async (formatId) => {
    const logoUrl = generatedLogos[formatId];
    if (!logoUrl || !currentBrand) return;

    try {
      const updateData = {
        logo_url: logoUrl,
        logo_formats: {
          ...currentBrand.logo_formats,
          [formatId]: logoUrl
        }
      };

      await updateBrandMutation.mutateAsync({
        id: currentBrand.id,
        brandData: updateData
      });

      alert('Logo saved to your brand profile!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save logo. Please try again.');
    }
  };

  const handleDownload = async (formatId) => {
    const logoUrl = generatedLogos[formatId];
    if (!logoUrl) return;

    try {
      // Try direct download with fetch (works for same-origin and CORS-enabled URLs)
      try {
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentBrand?.name || 'logo'}_${formatId}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (fetchError) {
        // Fallback: Open in new tab (user can right-click save)
        console.log('Direct download failed, opening in new tab:', fetchError);
        const link = document.createElement('a');
        link.href = logoUrl;
        link.target = '_blank';
        link.download = `${currentBrand?.name || 'logo'}_${formatId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
      // Last resort: Copy URL to clipboard
      try {
        await navigator.clipboard.writeText(logoUrl);
        alert('Download blocked by browser. Logo URL copied to clipboard! You can paste it in a new tab to download.');
      } catch {
        alert(`Download blocked. Right-click this URL and "Save As": ${logoUrl}`);
      }
    }
  };

  const handleDownloadAll = async () => {
    const logosToDownload = Object.entries(generatedLogos).filter(([_, url]) => url);
    
    if (logosToDownload.length === 0) {
      alert('No logos to download. Please generate logos first.');
      return;
    }

    let successCount = 0;
    let failedUrls = [];

    for (const [formatId, logoUrl] of logosToDownload) {
      try {
        // Try to download with fetch
        try {
          const response = await fetch(logoUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${currentBrand?.name || 'logo'}_${formatId}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          successCount++;
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch {
          // Fallback: Try opening in new tab
          const link = document.createElement('a');
          link.href = logoUrl;
          link.target = '_blank';
          link.download = `${currentBrand?.name || 'logo'}_${formatId}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          successCount++;
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Failed to download ${formatId}:`, error);
        failedUrls.push({ formatId, url: logoUrl });
      }
    }
    
    if (successCount > 0) {
      alert(`Started download for ${successCount} logo(s)! Check your Downloads folder and browser pop-ups.`);
    }
    
    if (failedUrls.length > 0) {
      const urlList = failedUrls.map(item => `${item.formatId}: ${item.url}`).join('\n');
      alert(`Some downloads may have been blocked. Here are the URLs:\n\n${urlList}\n\nYou can right-click each link in the preview and select "Save Image As".`);
    }
  };

  if (!currentBrand) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="border-2 border-yellow-500/30 bg-yellow-950/30">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">No Brand Found</h2>
            <p className="text-gray-300 mb-6">
              Please create your brand first using the Brand Builder
            </p>
            <Button
              onClick={() => navigate(createPageUrl("BrandBuilder"))}
              className="green-gradient text-white hover:opacity-90"
            >
              Go to Brand Builder
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-none shadow-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white glow-green">
        <CardContent className="p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Professional Logo Generator</h1>
              <p className="text-lg opacity-90">
                Generate logos in multiple formats for {currentBrand.name}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={handleGenerateAll}
                disabled={isGenerating}
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100 font-bold shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate All Formats
                  </>
                )}
              </Button>
              
              {Object.values(generatedLogos).some(url => url) && (
                <Button
                  onClick={handleDownloadAll}
                  disabled={isGenerating}
                  size="lg"
                  variant="outline"
                  className="bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-400 font-bold shadow-xl"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-2 border-red-500/30 bg-red-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Brand Info */}
      <Card className="border-2 border-green-500/30 bg-gray-900">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            {currentBrand.logo_url && (
              <img 
                src={currentBrand.logo_url} 
                alt="Current Logo" 
                className="w-20 h-20 object-contain rounded-lg border-2 border-green-500/30 bg-white"
              />
            )}
            <div>
              <h3 className="text-xl font-bold text-green-400">{currentBrand.name}</h3>
              {currentBrand.slogan && (
                <p className="text-gray-400">{currentBrand.slogan}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Formats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {logoFormats.map((format, index) => (
            <motion.div
              key={format.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="border-2 border-yellow-500/30 bg-gray-900 h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
                      <format.icon className="w-6 h-6 text-black" />
                    </div>
                    <Badge className="bg-green-600 text-white">
                      {format.size}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-yellow-400">{format.name}</CardTitle>
                  <p className="text-sm text-gray-400">{format.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Preview Area */}
                  <div className="aspect-square bg-gray-800 rounded-lg border-2 border-yellow-500/20 flex items-center justify-center overflow-hidden relative group">
                    {generatedLogos[format.id] ? (
                      <>
                        <img 
                          src={generatedLogos[format.id]} 
                          alt={format.name}
                          className="w-full h-full object-contain p-4"
                        />
                        {/* Quick download overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            onClick={() => handleDownload(format.id)}
                            size="sm"
                            className="gold-gradient text-black"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Quick Download
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Not generated yet</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleGenerateLogo(format.id)}
                      disabled={isGenerating}
                      className="w-full gold-gradient text-black hover:opacity-90"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Generate
                    </Button>

                    {generatedLogos[format.id] && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveToProfile(format.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-green-500/30 text-green-400"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={() => handleDownload(format.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-yellow-500/30 text-yellow-400"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          onClick={() => window.open(generatedLogos[format.id], '_blank')}
                          variant="outline"
                          size="sm"
                          className="border-blue-500/30 text-blue-400"
                          title="Open in new tab"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Info Card */}
      <Card className="border-2 border-blue-500/30 bg-blue-950/30">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-blue-400 mb-3">💡 Download Tips</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• <strong>Click "Download All"</strong> to save all generated logos at once</li>
            <li>• <strong>Individual downloads</strong> - click Download button on each logo card</li>
            <li>• <strong>Quick download</strong> - hover over a logo and click the overlay button</li>
            <li>• <strong>If download fails</strong> - click the 📷 icon to open in new tab, then right-click and "Save Image As"</li>
            <li>• <strong>Browser pop-ups</strong> - Allow multiple downloads when prompted</li>
            <li>• All logos are saved as high-quality PNG files with transparent backgrounds where applicable</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
