import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Database, 
  Cpu, 
  Sparkles, 
  Shield, 
  Cloud,
  Code,
  BookOpen
} from "lucide-react";

export default function SetupGuide() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-900/30 to-green-900/30">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl gold-gradient flex items-center justify-center glow-gold">
              <Rocket className="w-8 h-8 text-black" />
            </div>
            <div>
              <CardTitle className="text-3xl text-yellow-400">
                BoDiGi™ All-in-One Startup Guide
              </CardTitle>
              <p className="text-gray-300 mt-2">
                Complete setup documentation for the BoDigi platform
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-gray-900/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="supabase">Supa Brain</TabsTrigger>
          <TabsTrigger value="mcp">MCP Agent</TabsTrigger>
          <TabsTrigger value="3d">3D Background</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="design">Design DNA</TabsTrigger>
          <TabsTrigger value="env">Environment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Sparkles className="w-6 h-6" />
                Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>Every BoDiGi app must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Connect securely to the shared <strong className="text-green-400">Supabase Supa Brain</strong></li>
                <li>Contain a self-installing <strong className="text-green-400">MCP A2A Agent</strong> for automation</li>
                <li>Use the latest <strong className="text-green-400">3-D / WebGL dynamic background</strong> technology</li>
                <li>Follow <strong className="text-green-400">Automation Optimization + Security</strong> standards</li>
                <li>Deploy easily through <strong className="text-green-400">Cloud Run + Codespaces</strong></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-dark">
            <CardHeader>
              <CardTitle className="text-yellow-400">Implementation Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Supabase Supa Brain integration", done: true },
                  { label: "MCP A2A Agent utilities", done: true },
                  { label: "Enhanced 3D/WebGL background", done: true },
                  { label: "Event logging system", done: true },
                  { label: "Brand DNA (gold + maroon gradient)", done: true },
                  { label: "Environment variable template", done: true },
                  { label: "Cloud Run deployment config", done: false },
                  { label: "Automated testing suite", done: false }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-green-500' : 'bg-gray-600'}`}>
                      {item.done && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-gray-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supabase" className="space-y-4">
          <Card className="glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Database className="w-6 h-6" />
                Supabase Supa Brain Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Setup</h3>
                <p className="mb-3">The Supa Brain is already integrated through <code className="bg-gray-800 px-2 py-1 rounded">components/utils/supabaseClient.js</code></p>
                
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-green-400">{`import { supabase, logEvent } from '@/components/utils/supabaseClient';

// Log an event
await logEvent(user.email, 'brand_created', {
  brand_name: 'My Brand',
  feature: 'brand_builder'
});`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Key Functions</h3>
                <ul className="space-y-2">
                  <li><Badge className="mr-2">logEvent()</Badge> - Log events to Supa Brain</li>
                  <li><Badge className="mr-2">subscribeToEvents()</Badge> - Real-time event listening</li>
                  <li><Badge className="mr-2">getKnowledgeSnapshots()</Badge> - Fetch AI summaries</li>
                  <li><Badge className="mr-2">storeInsight()</Badge> - Save user insights</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Database Tables Needed</h3>
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-yellow-400">{`-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge snapshots
CREATE TABLE knowledge_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  snapshot_type TEXT,
  snapshot_data JSONB,
  app_origin TEXT DEFAULT 'bodigi',
  created_at TIMESTAMP DEFAULT NOW()
);

-- User insights
CREATE TABLE user_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  insight_type TEXT,
  insight_data JSONB,
  app_origin TEXT DEFAULT 'bodigi',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily summaries
CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  summary_date DATE,
  summary_text TEXT,
  event_count INTEGER,
  app_origin TEXT DEFAULT 'bodigi',
  created_at TIMESTAMP DEFAULT NOW()
);`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mcp" className="space-y-4">
          <Card className="glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Cpu className="w-6 h-6" />
                MCP A2A Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">What is the MCP Agent?</h3>
                <p>The Model Context Protocol (MCP) Agent is an autonomous system that:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Automatically syncs data to Supa Brain</li>
                  <li>Optimizes user workflows based on patterns</li>
                  <li>Creates daily summaries of activity</li>
                  <li>Enables cross-app communication</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Usage Example</h3>
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-green-400">{`import { triggerMCPTask, initializeMCPAgent } from '@/components/utils/mcpAgent';

// Initialize for a user
const channel = initializeMCPAgent(user.email);

// Trigger a task manually
await triggerMCPTask('supabrainSync', {
  user_id: user.email,
  data_type: 'brand_data',
  data: brandInfo
});

// Optimize automation
await triggerMCPTask('optimizeAutomation', {
  user_id: user.email
});`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Available Tasks</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { name: 'supabrainSync', desc: 'Sync data to Supa Brain' },
                    { name: 'optimizeAutomation', desc: 'Analyze and optimize workflows' },
                    { name: 'scheduleSummary', desc: 'Generate daily activity summary' },
                    { name: 'crossAppNotify', desc: 'Notify other BoDigi apps' }
                  ].map((task, i) => (
                    <div key={i} className="p-3 bg-gray-800/50 rounded-lg">
                      <Badge className="mb-2 gold-gradient text-black">{task.name}</Badge>
                      <p className="text-sm">{task.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="3d" className="space-y-4">
          <Card className="glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Sparkles className="w-6 h-6" />
                3D/WebGL Dynamic Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Features</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>5000 animated particles with brand colors</li>
                  <li>Neural network connection lines</li>
                  <li>Mouse-reactive camera movement</li>
                  <li>Wave motion effects</li>
                  <li>Gold + Maroon + Green color palette</li>
                  <li>Performance optimized (capped at 60 FPS)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Implementation</h3>
                <p>The background is automatically loaded in the layout component:</p>
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto mt-2">
                  <pre className="text-sm text-green-400">{`import WebGLBackground from '@/components/WebGLBackground';

<div className="min-h-screen relative">
  <WebGLBackground />
  <div className="relative z-10">
    {children}
  </div>
</div>`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Performance Tips</h3>
                <ul className="space-y-2">
                  <li>✅ Particle count: 5000 (optimized)</li>
                  <li>✅ Pixel ratio capped at 2x</li>
                  <li>✅ Proper cleanup on unmount</li>
                  <li>✅ Efficient line rendering (sampling)</li>
                  <li>✅ No blocking of main thread</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Shield className="w-6 h-6" />
                Security & Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Security Baseline</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Store secrets in Google Secret Manager</li>
                  <li>HTTPS only (enforced by Cloud Run)</li>
                  <li>Encrypt PII in Supa Brain (AES-256)</li>
                  <li>Verify webhook signatures</li>
                  <li>Run monthly vulnerability scans</li>
                  <li>Row-Level Security (RLS) enabled on all tables</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">RLS Policy Example</h3>
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-yellow-400">{`-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- User can only see their own events
CREATE POLICY "Users own events"
ON events FOR SELECT
USING (auth.uid() = user_id);

-- Admins can see all
CREATE POLICY "Admins see all"
ON events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Optimization Rules</h3>
                <ul className="space-y-2">
                  <li><Badge className="mr-2">Cloud Run</Badge> minInstances=0, concurrency≥5</li>
                  <li><Badge className="mr-2">Caching</Badge> Cache AI responses for 24h</li>
                  <li><Badge className="mr-2">Analytics</Badge> Shift to daily cron jobs</li>
                  <li><Badge className="mr-2">Assets</Badge> Serve via Cloud Storage + CDN</li>
                  <li><Badge className="mr-2">Logging</Badge> Use structured logging</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card className="glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Cloud className="w-6 h-6" />
                Deployment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Cloud Run Deployment</h3>
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-green-400">{`gcloud run deploy bodigi \\
  --source . \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars \\
  VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co,\\
  VITE_SUPABASE_ANON_KEY=YOUR_KEY,\\
  MCP_AGENT_ORIGIN=bodigi`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">GitHub Codespaces</h3>
                <ol className="list-decimal list-inside ml-4 space-y-2">
                  <li>Open repository in Codespaces</li>
                  <li>Click "Dev Container: Rebuild"</li>
                  <li>Run <code className="bg-gray-800 px-2 py-1 rounded">npm run dev</code></li>
                  <li>Test locally at localhost:5173</li>
                  <li>Commit + push → auto-deploy triggers</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Scheduled Jobs</h3>
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-yellow-400">{`# Daily summary job (2 AM)
gcloud scheduler jobs create http bodigi-summarizer \\
  --schedule="0 2 * * *" \\
  --uri="https://YOUR_URL/api/summarize" \\
  --http-method=POST`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <Card className="glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Code className="w-6 h-6" />
                Design DNA & Brand Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Color Palette</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="w-full h-20 rounded-lg" style={{ background: '#722f37' }}></div>
                    <p className="text-sm"><code>#722f37</code></p>
                    <p className="text-xs text-gray-400">Dark Maroon</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-20 rounded-lg" style={{ background: '#8b3a62' }}></div>
                    <p className="text-sm"><code>#8b3a62</code></p>
                    <p className="text-xs text-gray-400">Light Maroon</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-20 rounded-lg" style={{ background: '#fbbf24' }}></div>
                    <p className="text-sm"><code>#fbbf24</code></p>
                    <p className="text-xs text-gray-400">Gold</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-20 rounded-lg" style={{ background: '#10b981' }}></div>
                    <p className="text-sm"><code>#10b981</code></p>
                    <p className="text-xs text-gray-400">Green Accent</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Typography</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Clean sans-serif fonts only</li>
                  <li>Regular (400) and Bold (700) weights</li>
                  <li>No italic or decorative fonts</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Motion Principles</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Motion = purpose (no meaningless effects)</li>
                  <li>Background reflects app topic</li>
                  <li>Content must remain legible</li>
                  <li>Animations reinforce automation theme</li>
                  <li>Smooth transitions (0.2-0.3s)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">CSS Utilities</h3>
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-yellow-400">{`.gold-gradient {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.maroon-gradient {
  background: linear-gradient(135deg, #722f37 0%, #8b3a62 100%);
}

.glow-gold {
  filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.6));
}

.glass-dark {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(251, 191, 36, 0.2);
}`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="env" className="space-y-4">
          <Card className="glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <BookOpen className="w-6 h-6" />
                Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Required Variables</h3>
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-green-400">{`# Supabase Supa Brain Connection
VITE_SUPABASE_URL=https://YOUR_SUPABRAIN_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# MCP Agent Configuration
MCP_AGENT_ORIGIN=bodigi
MCP_AGENT_ENABLED=true

# Cloud Run Deployment (optional)
GCP_PROJECT_ID=your-gcp-project
GCP_REGION=us-central1
CLOUD_RUN_SERVICE_NAME=bodigi-app

# Base44 Platform
# (already configured through base44 platform)

# Security
ENCRYPTION_KEY=your-encryption-key-for-pii

# Feature Flags
ENABLE_3D_BACKGROUND=true
ENABLE_VOICE_CHAT=true
ENABLE_CAMERA=true`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Setup Instructions</h3>
                <ol className="list-decimal list-inside ml-4 space-y-2">
                  <li>Create a <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code> file in your project root</li>
                  <li>Copy the template above and fill in your actual values</li>
                  <li>Never commit the <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code> file to Git</li>
                  <li>For production, set these in Cloud Run environment variables</li>
                  <li>Use Google Secret Manager for sensitive keys</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">Getting Supabase Credentials</h3>
                <ol className="list-decimal list-inside ml-4 space-y-2">
                  <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">supabase.com</a></li>
                  <li>Create or select your project</li>
                  <li>Go to Settings → API</li>
                  <li>Copy the Project URL (VITE_SUPABASE_URL)</li>
                  <li>Copy the anon/public key (VITE_SUPABASE_ANON_KEY)</li>
                  <li>Copy the service_role key (SUPABASE_SERVICE_ROLE_KEY)</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-2 border-green-500/30 bg-gradient-to-r from-green-900/30 to-yellow-900/30">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-400 mb-2">
              🎉 You're All Set!
            </h3>
            <p className="text-gray-300 mb-4">
              BoDigi is configured with Supa Brain, MCP Agent, and advanced 3D backgrounds.
            </p>
            <p className="text-sm text-gray-400">
              Start building with confidence knowing automation and intelligence are built-in.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}