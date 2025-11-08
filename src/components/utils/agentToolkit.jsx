import { base44 } from '@/api/base44Client';

/**
 * AGIstatic Agent Toolkit
 * Dynamic toolkit for lightweight AI agents that use Gemini Cloud LLM
 * Agents are defined in JSON and use shared API routes
 */

// Load agent definition from JSON
export async function loadAgentDefinition(agentName) {
  try {
    // In production, this would fetch from agents/{agentName}.json
    // For now, we'll use the base44 agents API
    const agentDef = await import(`../../agents/${agentName}.json`);
    return agentDef.default || agentDef;
  } catch (error) {
    console.error(`Failed to load agent ${agentName}:`, error);
    return null;
  }
}

// Build dynamic toolkit based on agent's tool_configs
export function buildToolkit(toolConfigs = []) {
  const toolkit = {};

  toolConfigs.forEach(config => {
    const { entity_name, allowed_operations } = config;

    if (!entity_name) return;

    toolkit[entity_name] = {
      create: allowed_operations.includes('create') ? async (data) => {
        return await base44.entities[entity_name].create(data);
      } : null,
      
      read: allowed_operations.includes('read') ? async (filters = {}, sort = '-created_date', limit = 10) => {
        if (Object.keys(filters).length > 0) {
          return await base44.entities[entity_name].filter(filters, sort, limit);
        }
        return await base44.entities[entity_name].list(sort, limit);
      } : null,
      
      update: allowed_operations.includes('update') ? async (id, data) => {
        return await base44.entities[entity_name].update(id, data);
      } : null,
      
      delete: allowed_operations.includes('delete') ? async (id) => {
        return await base44.entities[entity_name].delete(id);
      } : null,
      
      schema: async () => {
        return await base44.entities[entity_name].schema();
      }
    };

    // Remove null operations
    Object.keys(toolkit[entity_name]).forEach(key => {
      if (toolkit[entity_name][key] === null) {
        delete toolkit[entity_name][key];
      }
    });
  });

  return toolkit;
}

// Execute agent with context using Gemini Cloud LLM
export async function executeAgent(agentName, userMessage, context = {}) {
  try {
    // Load agent definition
    const agentDef = await loadAgentDefinition(agentName);
    if (!agentDef) {
      throw new Error(`Agent ${agentName} not found`);
    }

    // Build toolkit
    const toolkit = buildToolkit(agentDef.tool_configs);

    // Get current user
    const user = await base44.auth.me();

    // Prepare context with available tools
    const toolsDescription = Object.keys(toolkit).map(entityName => {
      const operations = Object.keys(toolkit[entityName]).filter(op => op !== 'schema');
      return `${entityName}: ${operations.join(', ')}`;
    }).join('\n');

    // Build enhanced prompt with agent personality + tools + context
    const enhancedPrompt = `${agentDef.instructions}

AVAILABLE TOOLS:
${toolsDescription}

USER CONTEXT:
- Email: ${user.email}
- Subscription: ${user.subscription_tier || 'none'}
- Intelligence Rank: ${user.intelligence_rank || 'starter'}

ADDITIONAL CONTEXT:
${JSON.stringify(context, null, 2)}

USER MESSAGE:
${userMessage}

IMPORTANT INSTRUCTIONS FOR TOOL USAGE:
- When you need to save data (Brand, MVP, etc.), respond with a special marker
- Use this format: SAVE_DATA: {"entity": "EntityName", "operation": "create/update", "data": {...}}
- Example: SAVE_DATA: {"entity": "Brand", "operation": "create", "data": {"name": "MyBrand", "status": "in_progress"}}
- For updates: SAVE_DATA: {"entity": "Brand", "operation": "update", "id": "record_id", "data": {...}}
- The system will automatically execute the operation and confirm

Respond naturally to the user, and use SAVE_DATA markers when you need to persist information.`;

    // Call Gemini Cloud LLM via Base44 integration
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: enhancedPrompt,
      add_context_from_internet: context.needsWebSearch || false
    });

    // Parse response for tool calls
    let finalResponse = response;
    const toolExecutions = [];

    if (typeof response === 'string' && response.includes('SAVE_DATA:')) {
      const matches = response.matchAll(/SAVE_DATA:\s*(\{[^}]*\})/g);
      
      for (const match of matches) {
        try {
          const toolCall = JSON.parse(match[1]);
          const { entity, operation, id, data } = toolCall;

          if (toolkit[entity] && toolkit[entity][operation]) {
            let result;
            if (operation === 'update' && id) {
              result = await toolkit[entity][operation](id, data);
            } else {
              result = await toolkit[entity][operation](data);
            }

            toolExecutions.push({
              entity,
              operation,
              success: true,
              result
            });
          }
        } catch (e) {
          console.error('Tool execution error:', e);
          toolExecutions.push({
            error: e.message,
            success: false
          });
        }
      }

      // Remove SAVE_DATA markers from response
      finalResponse = response.replace(/SAVE_DATA:\s*\{[^}]*\}/g, '').trim();
      
      // Add confirmation if tools were executed
      if (toolExecutions.some(e => e.success)) {
        finalResponse += "\n\n💾 *Progress saved*";
      }
    }

    // Log usage
    await logAgentUsage(user.email, agentName, userMessage, finalResponse, context);

    return {
      response: finalResponse,
      toolExecutions,
      agentName,
      context
    };

  } catch (error) {
    console.error('Agent execution error:', error);
    throw error;
  }
}

// Log agent usage for billing
async function logAgentUsage(userEmail, agentName, userMessage, agentResponse, context) {
  try {
    const user = await base44.auth.me();
    
    await base44.entities.DataSystem.create({
      user_email: userEmail,
      event_type: 'ai_message',
      event_details: {
        agent_name: agentName,
        message_length: userMessage.length,
        response_length: agentResponse.length,
        context: context.page || 'unknown'
      },
      event_cost: 0.01, // Base cost, adjust based on model
      timestamp: new Date().toISOString(),
      plan_name: user.subscription_tier || 'none'
    });
  } catch (error) {
    console.error('Failed to log agent usage:', error);
  }
}

// Get agent configuration (for UI)
export async function getAgentConfig(agentName) {
  const agentDef = await loadAgentDefinition(agentName);
  if (!agentDef) return null;

  return {
    name: agentName,
    description: agentDef.description,
    capabilities: agentDef.tool_configs?.map(t => t.entity_name) || [],
    whatsappGreeting: agentDef.whatsapp_greeting,
    personality: agentDef.instructions?.split('\n')[0] || agentDef.description
  };
}

// Swap agent dynamically based on context
export function selectAgentByContext(context = {}) {
  const { page, taskType, userRole } = context;

  // Smart agent selection based on context
  if (page === 'BrandBuilder' || taskType === 'branding') return 'aura';
  if (page === 'MVPCreator' || taskType === 'technical') return 'boltz';
  if (page === 'Marketing' || taskType === 'marketing') return 'marketing_advisor';
  if (page === 'AutomationHub' || taskType === 'automation') return 'automation_specialist';
  
  // Default to aura for general help
  return 'aura';
}

export default {
  loadAgentDefinition,
  buildToolkit,
  executeAgent,
  getAgentConfig,
  selectAgentByContext,
  logAgentUsage
};