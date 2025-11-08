import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Cloud, 
  Download, 
  Copy, 
  CheckCircle2, 
  FileCode,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { 
  generateDockerfile,
  generateCloudBuild,
  generateNginxConf,
  generateEnvFile,
  generateDockerIgnore,
  generatePackageJson,
  generateDeployCommand
} from '../components/utils/googleCloudDeploy';

export default function CloudDeployment() {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = () => {
    // Download all deployment files with delays to prevent browser blocking
    const files = [
      { name: 'Dockerfile', content: generateDockerfile(), delay: 0 },
      { name: 'cloudbuild.yaml', content: generateCloudBuild(geminiApiKey), delay: 500 },
      { name: 'nginx.conf', content: generateNginxConf(), delay: 1000 },
      { name: '.env', content: generateEnvFile(geminiApiKey), delay: 1500 },
      { name: '.dockerignore', content: generateDockerIgnore(), delay: 2000 },
      { name: 'package.json', content: generatePackageJson(), delay: 2500 }
    ];

    files.forEach(file => {
      setTimeout(() => {
        downloadFile(file.name, file.content);
      }, file.delay);
    });

    // Alert user about multiple downloads
    alert('Downloading 6 files... Please allow multiple downloads if prompted by your browser!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-none shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Cloud className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Google Cloud Deployment Kit</h1>
              <p className="text-lg opacity-90">Everything you need to deploy BoDiGi to Cloud Run</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Deploy Button */}
      <Card className="border-2 border-green-500 bg-gradient-to-r from-green-950 to-emerald-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-2">🚀 Quick Deploy - Download All Files</h3>
              <p className="text-gray-300">
                Download all required files in one click, then follow the deployment steps below.
              </p>
            </div>
            <Button
              onClick={downloadAllFiles}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              <Download className="w-5 h-5 mr-2" />
              Download All Files (6)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files Needed */}
      <Card>
        <CardHeader>
          <CardTitle>📦 Required Files for Deployment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-bold text-gray-900 mb-2">Core Files (add to project root):</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <code className="bg-gray-200 px-2 py-1 rounded">Dockerfile</code> - Container configuration
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <code className="bg-gray-200 px-2 py-1 rounded">nginx.conf</code> - Web server config
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <code className="bg-gray-200 px-2 py-1 rounded">cloudbuild.yaml</code> - CI/CD pipeline
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <code className="bg-gray-200 px-2 py-1 rounded">.dockerignore</code> - Files to exclude from build
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <code className="bg-gray-200 px-2 py-1 rounded">.env</code> - Environment variables
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <code className="bg-gray-200 px-2 py-1 rounded">package.json</code> - Node.js dependencies
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Get Gemini API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</span>
            Get Your Gemini API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            You need a Google AI Studio API key to power all the AI agents in BoDiGi.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get API Key from Google AI Studio
            </Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter Your API Key:</label>
            <Input
              type="password"
              placeholder="AIzaSy..."
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="font-mono"
            />
            {geminiApiKey && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                API key entered (keep this secure!)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Download Individual Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</span>
            Download Files Individually (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Or download files one by one if you prefer:
          </p>
          
          <div className="grid md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => downloadFile('Dockerfile', generateDockerfile())}
              className="justify-start h-auto p-4"
            >
              <div className="flex items-center gap-3 w-full">
                <FileCode className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Dockerfile</div>
                  <div className="text-xs text-gray-500">Multi-stage build config</div>
                </div>
                <Download className="w-4 h-4 ml-auto" />
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => downloadFile('cloudbuild.yaml', generateCloudBuild(geminiApiKey))}
              className="justify-start h-auto p-4"
            >
              <div className="flex items-center gap-3 w-full">
                <FileCode className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">cloudbuild.yaml</div>
                  <div className="text-xs text-gray-500">CI/CD configuration</div>
                </div>
                <Download className="w-4 h-4 ml-auto" />
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => downloadFile('nginx.conf', generateNginxConf())}
              className="justify-start h-auto p-4"
            >
              <div className="flex items-center gap-3 w-full">
                <FileCode className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">nginx.conf</div>
                  <div className="text-xs text-gray-500">Web server config</div>
                </div>
                <Download className="w-4 h-4 ml-auto" />
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => downloadFile('.env', generateEnvFile(geminiApiKey))}
              className="justify-start h-auto p-4"
            >
              <div className="flex items-center gap-3 w-full">
                <FileCode className="w-5 h-5 text-orange-600" />
                <div className="text-left">
                  <div className="font-medium">.env</div>
                  <div className="text-xs text-gray-500">Environment variables</div>
                </div>
                <Download className="w-4 h-4 ml-auto" />
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => downloadFile('.dockerignore', generateDockerIgnore())}
              className="justify-start h-auto p-4"
            >
              <div className="flex items-center gap-3 w-full">
                <FileCode className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">.dockerignore</div>
                  <div className="text-xs text-gray-500">Docker ignore rules</div>
                </div>
                <Download className="w-4 h-4 ml-auto" />
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => downloadFile('package.json', generatePackageJson())}
              className="justify-start h-auto p-4"
            >
              <div className="flex items-center gap-3 w-full">
                <FileCode className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <div className="font-medium">package.json</div>
                  <div className="text-xs text-gray-500">Node dependencies</div>
                </div>
                <Download className="w-4 h-4 ml-auto" />
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Deploy Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">3</span>
            Deploy to Google Cloud Run
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Enable Required APIs</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(`gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com`, 'enable-apis')}
                className="text-gray-400 hover:text-white"
              >
                {copied === 'enable-apis' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <pre className="text-xs text-green-400 font-mono overflow-x-auto">
{`gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com`}
            </pre>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Create Artifact Registry</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(`gcloud artifacts repositories create bodigi-images --repository-format=docker --location=us-east5`, 'create-registry')}
                className="text-gray-400 hover:text-white"
              >
                {copied === 'create-registry' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <pre className="text-xs text-green-400 font-mono overflow-x-auto">
{`gcloud artifacts repositories create bodigi-images --repository-format=docker --location=us-east5`}
            </pre>
          </div>

          {geminiApiKey && (
            <div className="bg-gray-900 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Deploy with Cloud Build</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(generateDeployCommand(geminiApiKey), 'deploy')}
                  className="text-gray-400 hover:text-white"
                >
                  {copied === 'deploy' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <pre className="text-xs text-green-400 font-mono overflow-x-auto">
{generateDeployCommand(geminiApiKey)}
              </pre>
            </div>
          )}

          {!geminiApiKey && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Enter your Gemini API key above to generate the deploy command
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Step-by-Step Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">1.</span>
              <div>
                <p className="font-medium">Download all files using the button above</p>
                <p className="text-gray-600">Save them to your project root directory</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">2.</span>
              <div>
                <p className="font-medium">Update the .env file with your credentials</p>
                <p className="text-gray-600">Add your Gemini API key and GCP project ID</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">3.</span>
              <div>
                <p className="font-medium">Install Google Cloud SDK</p>
                <p className="text-gray-600">Visit: https://cloud.google.com/sdk/install</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">4.</span>
              <div>
                <p className="font-medium">Run the commands above in order</p>
                <p className="text-gray-600">Enable APIs → Create Registry → Deploy</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">5.</span>
              <div>
                <p className="font-medium">Your app will be live in 3-5 minutes! 🎉</p>
                <p className="text-gray-600">You'll get a URL like: https://bodigi-frontend-xxx.run.app</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Success Message */}
      <Card className="border-2 border-green-500 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-bold text-green-900">Ready for Google Cloud Hackathon! 🎉</h3>
              <p className="text-sm text-green-700">
                All deployment files are ready. Download them, follow the steps, and you'll be live on Cloud Run in minutes!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}