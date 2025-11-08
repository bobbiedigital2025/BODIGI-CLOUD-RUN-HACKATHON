import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DollarSign, 
  Mail, 
  Phone, 
  Building2, 
  User,
  TrendingUp,
  Target,
  Sparkles,
  Search,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";

export default function InvestorHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: mvps = [] } = useQuery({
    queryKey: ['all-mvps'],
    queryFn: () => base44.entities.MVP.list('-created_date', 100),
    initialData: [],
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['all-brands'],
    queryFn: () => base44.entities.Brand.list('-created_date', 100),
    initialData: [],
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
    initialData: [],
  });

  // Filter MVPs by users who are seeking investment
  const seekingInvestmentUsers = allUsers.filter(u => u.seeking_investment);
  const visibleProjects = mvps.filter(mvp => {
    const creator = allUsers.find(u => u.email === mvp.created_by);
    return creator?.seeking_investment;
  });

  // Apply filters
  const filteredProjects = visibleProjects.filter(mvp => {
    const matchesSearch = !searchQuery || 
      mvp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mvp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mvp.niche?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesNiche = nicheFilter === "all" || mvp.niche === nicheFilter;
    const matchesType = typeFilter === "all" || mvp.type === typeFilter;
    
    return matchesSearch && matchesNiche && matchesType;
  });

  // Get unique niches and types for filters
  const uniqueNiches = [...new Set(mvps.map(m => m.niche).filter(Boolean))];
  const uniqueTypes = [...new Set(mvps.map(m => m.type).filter(Boolean))];

  const getBrandForMVP = (mvp) => {
    return brands.find(b => b.id === mvp.brand_id);
  };

  const getCreatorForMVP = (mvp) => {
    return allUsers.find(u => u.email === mvp.created_by);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-green-500/30 bg-gradient-to-r from-green-900/30 to-yellow-900/30">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full green-gradient flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-green-400">Investor Hub</h1>
              <p className="text-lg text-gray-300">
                Discover innovative digital businesses seeking investment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Badge className="bg-green-600 text-white">
              {filteredProjects.length} Projects Available
            </Badge>
            <Badge className="bg-yellow-600 text-white">
              {seekingInvestmentUsers.length} Entrepreneurs
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-2 border-yellow-500/30 bg-gray-900">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Projects
              </label>
              <Input
                placeholder="Search by name, description, or niche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-yellow-500/30"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Niche
              </label>
              <Select value={nicheFilter} onValueChange={setNicheFilter}>
                <SelectTrigger className="bg-gray-800 border-yellow-500/30">
                  <SelectValue placeholder="All Niches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Niches</SelectItem>
                  {uniqueNiches.map(niche => (
                    <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Type
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-gray-800 border-yellow-500/30">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="border-2 border-gray-700 bg-gray-900">
          <CardContent className="p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Projects Found</h3>
            <p className="text-gray-500">
              {searchQuery || nicheFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters to see more projects"
                : "No entrepreneurs are currently seeking investment"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredProjects.map((mvp, index) => {
            const brand = getBrandForMVP(mvp);
            const creator = getCreatorForMVP(mvp);
            const showContact = creator?.show_contact_to_investors;

            return (
              <motion.div
                key={mvp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-2 border-green-500/30 bg-gray-900 hover:border-green-500 transition-all h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {brand?.logo_url && (
                          <img 
                            src={brand.logo_url} 
                            alt={brand.name} 
                            className="w-16 h-16 object-contain rounded-lg border border-green-500/30 bg-white/10 mb-3"
                          />
                        )}
                        <CardTitle className="text-2xl text-green-400 mb-2">
                          {mvp.name || 'Unnamed Project'}
                        </CardTitle>
                        {brand?.name && (
                          <p className="text-sm text-gray-400">by {brand.name}</p>
                        )}
                      </div>
                      <Badge className="bg-yellow-600 text-white">
                        {mvp.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {mvp.niche && (
                        <Badge className="bg-blue-600 text-white">
                          <Target className="w-3 h-3 mr-1" />
                          {mvp.niche}
                        </Badge>
                      )}
                      {mvp.type && (
                        <Badge className="bg-purple-600 text-white">
                          {mvp.type.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {mvp.description && (
                      <div>
                        <h4 className="font-bold text-gray-300 mb-2">Description</h4>
                        <p className="text-gray-400 text-sm">{mvp.description}</p>
                      </div>
                    )}

                    {mvp.target_audience && (
                      <div>
                        <h4 className="font-bold text-gray-300 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Target Audience
                        </h4>
                        <p className="text-gray-400 text-sm">{mvp.target_audience}</p>
                      </div>
                    )}

                    {mvp.revenue_potential && (
                      <div>
                        <h4 className="font-bold text-gray-300 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Revenue Potential
                        </h4>
                        <p className="text-gray-400 text-sm">{mvp.revenue_potential}</p>
                      </div>
                    )}

                    {creator?.investment_amount_sought && (
                      <div className="p-3 bg-green-950/30 rounded-lg border border-green-500/30">
                        <h4 className="font-bold text-green-400 mb-1 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Investment Sought
                        </h4>
                        <p className="text-gray-300 text-lg font-bold">
                          {creator.investment_amount_sought}
                        </p>
                      </div>
                    )}

                    {mvp.features && mvp.features.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-300 mb-2">Features ({mvp.features.length})</h4>
                        <div className="space-y-1">
                          {mvp.features.slice(0, 3).map((feature, i) => (
                            <p key={i} className="text-sm text-gray-400">• {feature.name}</p>
                          ))}
                          {mvp.features.length > 3 && (
                            <p className="text-sm text-gray-500">+ {mvp.features.length - 3} more features</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div className="pt-4 border-t border-gray-700">
                      <h4 className="font-bold text-yellow-400 mb-3">Contact Information</h4>
                      {showContact ? (
                        <div className="space-y-2 bg-yellow-950/30 p-4 rounded-lg border border-yellow-500/30">
                          <div className="flex items-center gap-2 text-gray-300">
                            <User className="w-4 h-4 text-yellow-400" />
                            <span className="font-medium">{creator?.full_name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Mail className="w-4 h-4 text-yellow-400" />
                            <a href={`mailto:${creator?.email}`} className="hover:text-yellow-400 hover:underline">
                              {creator?.email}
                            </a>
                          </div>
                          {creator?.phone && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <Phone className="w-4 h-4 text-yellow-400" />
                              <a href={`tel:${creator.phone}`} className="hover:text-yellow-400 hover:underline">
                                {creator.phone}
                              </a>
                            </div>
                          )}
                          {creator?.company && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <Building2 className="w-4 h-4 text-yellow-400" />
                              <span>{creator.company}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
                          <p className="text-gray-400 text-sm">
                            Contact information hidden by owner
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}