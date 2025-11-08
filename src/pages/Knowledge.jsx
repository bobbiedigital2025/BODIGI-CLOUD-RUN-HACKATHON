import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Search,
  Sparkles,
  Calendar,
  Tag,
  TrendingUp,
  Loader2,
  RefreshCw,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  getKnowledgeSnapshots, 
  searchKnowledgeSnapshots,
  generateDailySnapshot 
} from "../components/utils/supabaseClient";

export default function Knowledge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: snapshots = [], isLoading, refetch } = useQuery({
    queryKey: ['knowledge-snapshots', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await getKnowledgeSnapshots(user.email, 50);
    },
    enabled: !!user?.email,
    initialData: []
  });

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user?.email) return;
    
    setIsSearching(true);
    try {
      const results = await searchKnowledgeSnapshots(user.email, searchQuery, 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateSnapshot = async () => {
    if (!user?.email) return;
    
    try {
      await generateDailySnapshot(user.email);
      refetch();
    } catch (error) {
      console.error('Error generating snapshot:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const displaySnapshots = searchResults !== null ? searchResults : snapshots;

  const getSnapshotTypeIcon = (type) => {
    switch (type) {
      case 'daily_summary':
        return Calendar;
      case 'brand_progress':
        return Sparkles;
      case 'mvp_insights':
        return TrendingUp;
      default:
        return Brain;
    }
  };

  const getSnapshotTypeColor = (type) => {
    switch (type) {
      case 'daily_summary':
        return 'bg-blue-600';
      case 'brand_progress':
        return 'bg-green-600';
      case 'mvp_insights':
        return 'bg-yellow-600';
      default:
        return 'bg-purple-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <CardContent className="p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center"
                style={{ filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.5))' }}>
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-purple-400">Knowledge Center</h1>
                <p className="text-lg text-gray-300">
                  AI-powered insights from your activity history
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerateSnapshot}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Daily Snapshot
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="border-2 border-purple-500/30 bg-gray-900">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search your knowledge base... (e.g., 'brand decisions', 'MVP features')"
                className="pl-10 bg-gray-800 border-purple-500/30 text-white"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
            {searchResults !== null && (
              <Button
                onClick={() => {
                  setSearchResults(null);
                  setSearchQuery("");
                }}
                variant="outline"
                className="border-purple-500/30 text-purple-400"
              >
                Clear
              </Button>
            )}
          </div>

          {searchResults !== null && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Found {searchResults.length} relevant insights using semantic search</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-2 border-purple-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Snapshots</span>
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">{snapshots.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Daily Summaries</span>
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {snapshots.filter(s => s.snapshot_type === 'daily_summary').length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Brand Insights</span>
              <Sparkles className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              {snapshots.filter(s => s.snapshot_type === 'brand_progress').length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-500/30 bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">MVP Insights</span>
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-400">
              {snapshots.filter(s => s.snapshot_type === 'mvp_insights').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Snapshots */}
      <Card className="border-2 border-purple-500/30 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-purple-400">
            {searchResults !== null ? 'Search Results' : 'Your Knowledge Snapshots'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
              <p className="text-gray-400">Loading your insights...</p>
            </div>
          ) : displaySnapshots.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">
                {searchResults !== null ? 'No results found' : 'No knowledge snapshots yet'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {searchResults !== null 
                  ? 'Try a different search query'
                  : 'Knowledge snapshots are automatically generated as you use BoDigi'}
              </p>
              <Button
                onClick={handleGenerateSnapshot}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Generate Your First Snapshot
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displaySnapshots.map((snapshot, index) => {
                const Icon = getSnapshotTypeIcon(snapshot.snapshot_type);
                const colorClass = getSnapshotTypeColor(snapshot.snapshot_type);

                return (
                  <motion.div
                    key={snapshot.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-gray-800 border-purple-500/20 hover:border-purple-500/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge className={`${colorClass} text-white`}>
                                {snapshot.snapshot_type.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-gray-400">
                                {new Date(snapshot.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {snapshot.relevance_score !== undefined && (
                                <Badge className="bg-purple-600 text-white">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Relevance: {snapshot.relevance_score}
                                </Badge>
                              )}
                            </div>

                            <p className="text-gray-300 mb-4 leading-relaxed">
                              {snapshot.summary || 'Summary being generated...'}
                            </p>

                            {snapshot.embedding_keywords && snapshot.embedding_keywords.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {snapshot.embedding_keywords.slice(0, 6).map((keyword, i) => (
                                  <Badge key={i} variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {snapshot.embedding_category && (
                              <div className="text-sm text-gray-500">
                                Category: <span className="text-purple-400">{snapshot.embedding_category}</span>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-2 border-blue-500/30 bg-blue-950/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-400 mb-2">How Knowledge Snapshots Work</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• <strong>Automatic Generation:</strong> Snapshots are created daily summarizing your activity</li>
                <li>• <strong>AI-Powered Insights:</strong> Each snapshot uses AI to extract key learnings and patterns</li>
                <li>• <strong>Semantic Search:</strong> Search uses embeddings to find contextually relevant insights</li>
                <li>• <strong>Cross-App Sync:</strong> Your knowledge is shared across all BoDigi applications</li>
                <li>• <strong>Privacy First:</strong> Only you can access your knowledge snapshots</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}