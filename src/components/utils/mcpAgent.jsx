// MCP A2A Agent for BoDigi
// Handles automation, optimization, and cross-app synchronization

import { supabase, logEvent } from './supabaseClient';
import { base44 } from '@/api/base44Client';

const MCP_AGENT_ORIGIN = 'bodigi';

export class MCPAgent {
  constructor() {
    this.tasks = {
      supabrainSync: this.supabrainSync.bind(this),
      optimizeAutomation: this.optimizeAutomation.bind(this),
      scheduleSummary: this.scheduleSummary.bind(this),
      crossAppNotify: this.crossAppNotify.bind(this)
    };
  }

  // Main agent executor
  async execute(event, payload) {
    console.log(`[MCP Agent] Executing task: ${event}`);
    
    try {
      if (this.tasks[event]) {
        await this.tasks[event](payload);
        await logEvent(payload.user_id || 'system', 'mcp_agent_task', {
          task: event,
          status: 'completed',
          payload
        }, MCP_AGENT_ORIGIN);
      } else {
        console.warn(`[MCP Agent] Unknown task: ${event}`);
      }
    } catch (error) {
      console.error(`[MCP Agent] Error executing ${event}:`, error);
      await logEvent(payload.user_id || 'system', 'mcp_agent_error', {
        task: event,
        error: error.message
      }, MCP_AGENT_ORIGIN);
    }
  }

  // Sync data to Supa Brain
  async supabrainSync(payload) {
    const { user_id, data_type, data } = payload;
    
    try {
      // Log to Supa Brain events table
      await logEvent(user_id, `sync_${data_type}`, data, MCP_AGENT_ORIGIN);
      
      // Store in appropriate knowledge table
      const { error } = await supabase
        .from('knowledge_snapshots')
        .insert([{
          user_id,
          snapshot_type: data_type,
          snapshot_data: data,
          app_origin: MCP_AGENT_ORIGIN,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      console.log('[MCP Agent] Supa Brain sync completed');
    } catch (error) {
      console.error('[MCP Agent] Supa Brain sync failed:', error);
    }
  }

  // Optimize user's automation workflows
  async optimizeAutomation(payload) {
    const { user_id } = payload;
    
    try {
      // Fetch user's recent activity
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(100);

      // Analyze patterns
      const patterns = this.analyzePatterns(events);
      
      // Generate optimization suggestions
      const suggestions = await this.generateOptimizations(patterns);
      
      // Store insights
      await supabase.from('user_insights').insert([{
        user_id,
        insight_type: 'automation_optimization',
        insight_data: suggestions,
        app_origin: MCP_AGENT_ORIGIN,
        created_at: new Date().toISOString()
      }]);

      console.log('[MCP Agent] Automation optimization completed');
      return suggestions;
    } catch (error) {
      console.error('[MCP Agent] Optimization failed:', error);
    }
  }

  // Create daily summary
  async scheduleSummary(payload) {
    const { user_id } = payload;
    
    try {
      // Get yesterday's events
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user_id)
        .gte('created_at', yesterday.toISOString());

      // Generate summary using AI
      const summary = await this.generateAISummary(events);
      
      // Store summary
      await supabase.from('daily_summaries').insert([{
        user_id,
        summary_date: yesterday.toISOString().split('T')[0],
        summary_text: summary,
        event_count: events.length,
        app_origin: MCP_AGENT_ORIGIN,
        created_at: new Date().toISOString()
      }]);

      console.log('[MCP Agent] Daily summary created');
      return summary;
    } catch (error) {
      console.error('[MCP Agent] Summary creation failed:', error);
    }
  }

  // Notify other BoDigi apps of important events
  async crossAppNotify(payload) {
    const { user_id, event_type, data } = payload;
    
    try {
      await logEvent(user_id, `cross_app_${event_type}`, {
        ...data,
        notified_apps: ['ebooker_plus', 'learn_and_earn', 'famous_ai'],
        from_app: MCP_AGENT_ORIGIN
      }, MCP_AGENT_ORIGIN);

      console.log('[MCP Agent] Cross-app notification sent');
    } catch (error) {
      console.error('[MCP Agent] Cross-app notification failed:', error);
    }
  }

  // Helper: Analyze user patterns
  analyzePatterns(events) {
    const patterns = {
      most_used_features: {},
      peak_activity_hours: {},
      common_workflows: []
    };

    events.forEach(event => {
      const hour = new Date(event.created_at).getHours();
      patterns.peak_activity_hours[hour] = (patterns.peak_activity_hours[hour] || 0) + 1;
      
      if (event.type) {
        patterns.most_used_features[event.type] = (patterns.most_used_features[event.type] || 0) + 1;
      }
    });

    return patterns;
  }

  // Helper: Generate optimization suggestions
  async generateOptimizations(patterns) {
    try {
      const prompt = `Based on this user activity pattern: ${JSON.stringify(patterns)}, suggest 3 automation optimizations for their BoDigi workflow. Be specific and actionable.`;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  impact: { type: 'string', enum: ['high', 'medium', 'low'] }
                }
              }
            }
          }
        }
      });

      return response.suggestions || [];
    } catch (error) {
      console.error('Failed to generate optimizations:', error);
      return [];
    }
  }

  // Helper: Generate AI summary
  async generateAISummary(events) {
    try {
      const eventSummary = events.map(e => `${e.type}: ${JSON.stringify(e.payload)}`).join('\n');
      
      const prompt = `Summarize this day's activity in BoDigi for the user in 2-3 sentences:\n${eventSummary}`;
      
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      
      return response || 'No significant activity today.';
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return 'Summary generation failed.';
    }
  }
}

// Export singleton instance
export const mcpAgent = new MCPAgent();

// Auto-execute tasks on specific triggers
export async function triggerMCPTask(task, payload) {
  await mcpAgent.execute(task, payload);
}

// Initialize agent listeners
export function initializeMCPAgent(user_id) {
  console.log('[MCP Agent] Initialized for user:', user_id);
  
  // Listen for significant events
  const channel = supabase
    .channel(`mcp_agent_${user_id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'events',
        filter: `user_id=eq.${user_id}`
      },
      async (payload) => {
        // Auto-sync important events
        if (payload.new.type.includes('brand') || payload.new.type.includes('mvp')) {
          await mcpAgent.execute('supabrainSync', {
            user_id,
            data_type: payload.new.type,
            data: payload.new.payload
          });
        }
      }
    )
    .subscribe();

  return channel;
}