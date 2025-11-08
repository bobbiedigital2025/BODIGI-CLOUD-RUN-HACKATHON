
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, Lock, AlertCircle } from "lucide-react";

export default function Legal() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <Card className="border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-900/30 to-red-900/30">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f049e8b39754755a23cad0/e3c0fa3cb_Chatbotassistant_compressed.png"
              alt="BoDiGi™ Logo"
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-4xl font-bold text-yellow-400">Legal & Policies</h1>
              <p className="text-lg text-gray-300">
                Terms, privacy, and agreements
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            © 2024 BoDiGi™ by Bobbie Digital. All rights reserved. BoDiGi™ and the BoDiGi™ logo are trademarks of Bobbie Digital.
          </p>
        </CardContent>
      </Card>

      {/* CRITICAL DISCLAIMERS - Must Read */}
      <Card className="border-4 border-red-500 bg-gradient-to-r from-red-900/40 to-orange-900/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <CardTitle className="text-2xl text-red-400">⚠️ IMPORTANT DISCLAIMERS - PLEASE READ</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-200">
          <div className="bg-red-950/50 p-6 rounded-lg border-2 border-red-500">
            <h3 className="text-xl font-bold text-red-300 mb-3">NO REFUNDS POLICY</h3>
            <p className="mb-2">
              <strong>ALL SALES ARE FINAL.</strong> BoDiGi™ does not offer refunds for any subscriptions, 
              pay-per-use features, or one-time purchases after the 3-day free trial period ends.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm mt-3">
              <li>You may cancel your subscription at any time to avoid future charges</li>
              <li>Cancellation does not entitle you to a refund for the current billing period</li>
              <li>Digital products and AI-generated content are delivered instantly and cannot be returned</li>
              <li>No refunds will be issued for unused features, credits, or subscription time</li>
            </ul>
          </div>

          <div className="bg-orange-950/50 p-6 rounded-lg border-2 border-orange-500">
            <h3 className="text-xl font-bold text-orange-300 mb-3">NO GUARANTEE OF SUCCESS OR REVENUE</h3>
            <p className="mb-2">
              <strong>BoDiGi™ IS A TOOL, NOT A GUARANTEE.</strong> By using BoDiGi™, you acknowledge and agree:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-3">
              <li>
                <strong>No Money-Making Guarantee:</strong> BoDiGi™ does not guarantee that you will make money, 
                generate revenue, or achieve business success by using our platform, AI agents, or tools.
              </li>
              <li>
                <strong>Results Vary:</strong> Your success depends on many factors including your effort, market conditions, 
                business model, target audience, competition, and execution - all of which are outside BoDiGi's control.
              </li>
              <li>
                <strong>Not Complete Business Solution:</strong> BoDiGi™ provides brand creation, MVP design, marketing guidance, 
                and automation tools. However, you may need additional services, tools, software, partnerships, capital, 
                technical expertise, or professional services to fully launch, operate, and monetize your business.
              </li>
              <li>
                <strong>MVP Implementation:</strong> While Boltz helps design your MVP and provides technical specifications, 
                you may need to hire developers, designers, or use additional platforms to fully build and deploy your product.
              </li>
              <li>
                <strong>Marketing Execution:</strong> Marketing strategies and recommendations provided are educational. 
                Actual campaign execution, ad spend, content creation, and customer acquisition require additional work and investment.
              </li>
              <li>
                <strong>No Business Advice:</strong> BoDiGi™ does not provide legal, financial, tax, or professional business advice. 
                Consult with qualified professionals before making business decisions.
              </li>
            </ul>
          </div>

          <div className="bg-yellow-950/50 p-6 rounded-lg border-2 border-yellow-500">
            <h3 className="text-xl font-bold text-yellow-300 mb-3">AI-GENERATED CONTENT DISCLAIMER</h3>
            <p className="text-sm">
              All content, code, designs, and strategies generated by BoDiGi's AI agents (Aura, Boltz, etc.) are provided 
              "AS IS" without warranty. While our AI strives for accuracy and quality:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm mt-2">
              <li>AI-generated content may contain errors, inaccuracies, or require human review</li>
              <li>You are responsible for reviewing, testing, and validating all AI output before use</li>
              <li>BoDiGi is not liable for losses resulting from AI-generated content</li>
              <li>You retain ownership of AI-generated content, but accept all risks of its use</li>
            </ul>
          </div>

          <div className="bg-purple-950/50 p-6 rounded-lg border-2 border-purple-500">
            <h3 className="text-xl font-bold text-purple-300 mb-3">LIMITATION OF LIABILITY</h3>
            <p className="text-sm">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BODIGI™ AND ITS FOUNDERS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm mt-2">
              <li>Any lost profits, revenue, or business opportunities</li>
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Losses resulting from use or inability to use the platform</li>
              <li>Losses from AI-generated content, strategies, or recommendations</li>
              <li>Losses from third-party integrations, services, or platforms</li>
            </ul>
            <p className="text-sm mt-3 font-bold">
              IN NO EVENT SHALL BODIGI'S TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID TO BODIGI IN THE LAST 12 MONTHS.
            </p>
          </div>

          <div className="bg-blue-950/50 p-6 rounded-lg border-2 border-blue-500">
            <h3 className="text-xl font-bold text-blue-300 mb-3">USER RESPONSIBILITY</h3>
            <p className="text-sm mb-2">By using BoDiGi™, you acknowledge that YOU are responsible for:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>All business decisions and their outcomes</li>
              <li>Compliance with all applicable laws and regulations</li>
              <li>Obtaining necessary licenses, permits, and legal agreements</li>
              <li>Protecting your intellectual property</li>
              <li>Managing your finances, taxes, and accounting</li>
              <li>Customer service, support, and satisfaction</li>
              <li>Quality assurance and testing of your products/services</li>
              <li>Marketing execution and ad spend management</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Terms of Service */}
      <Card className="border-2 border-yellow-500/30 bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-yellow-400" />
            <CardTitle className="text-2xl text-yellow-400">Terms of Service</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-300">
          <p>
            <strong>Last Updated:</strong> December 2024
          </p>
          
          <div>
            <h3 className="text-xl font-bold text-green-400 mb-2">1. Acceptance of Terms</h3>
            <p>
              By accessing and using BoDiGi™ ("the Platform"), you accept and agree to be bound by these Terms of Service. 
              BoDiGi™ is operated by Bobbie Digital and provides AI-powered tools for building digital businesses.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-green-400 mb-2">2. Subscription & Billing</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>All plans include a 3-day free trial</li>
              <li>After the trial, you will be automatically charged unless you cancel</li>
              <li>Subscription prices: Basic ($19.99/mo), Pro ($49.99/mo), Elite ($99.99/mo)</li>
              <li>You may cancel anytime through your Profile page</li>
              <li>Refunds are provided on a case-by-case basis</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-green-400 mb-2">3. AI Models & Multi-Model System</h3>
            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30 mb-4">
              <p className="font-bold text-purple-400 mb-2">BoDiGi™ AI Model License Agreement</p>
              <p className="text-sm mb-2">
                BoDiGi™ provides access to multiple AI models with varying capabilities and specializations. 
                Output quality, response time, and specialization differ by model and subscription tier.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Aura™:</strong> Brand creation and creative design (Basic+)</li>
                <li><strong>Boltz™:</strong> MVP creation and technical automation (Basic+)</li>
                <li><strong>Nova™:</strong> Marketing and ad strategy (Pro+)</li>
                <li><strong>CodeX™:</strong> Development and code optimization (Pro+)</li>
                <li><strong>Vox™:</strong> Voice, video, and multimedia content (Elite)</li>
              </ul>
            </div>
            <p className="text-sm">
              <strong>Ownership & Usage Rights:</strong> Users retain full ownership of all content, designs, code, and assets generated 
              through BoDiGi™ AI models under the <strong>BoDiGi™ Proprietary Use License v1.0</strong>. You may use, modify, 
              distribute, and commercialize any AI-generated output without restriction, provided it complies with applicable laws.
            </p>
            <p className="text-sm mt-2">
              <strong>Model Access & Pricing:</strong> AI model access is determined by your subscription tier. 
              Cost per API call varies by model complexity. One-time unlock purchases are available for select models outside your tier.
            </p>
            <p className="text-sm mt-2">
              <strong>Fair Use Policy:</strong> BoDiGi™ reserves the right to rate-limit or restrict access to AI models if usage 
              significantly exceeds normal patterns or constitutes abuse of the service.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-green-400 mb-2">4. MVP Revenue Sharing Agreement</h3>
            <p className="mb-2">
              <strong className="text-yellow-400">IMPORTANT:</strong> When you create an MVP through BoDiGi's MVP Creator, you agree to the following:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Bobbie Gray, founder of BoDiGi, will receive <strong>10% of all revenue or royalties</strong> generated by the MVP</li>
              <li>This applies to the <strong>FIRST YEAR ONLY</strong> from the date of MVP acceptance</li>
              <li>After year one, you retain 100% of all revenue</li>
              <li>You must explicitly accept this agreement before your MVP is finalized</li>
              <li>Revenue includes all sales, subscriptions, licensing fees, and monetization</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-green-400 mb-2">5. Intellectual Property</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>You own 100% of your brand identity and content created with BoDiGi</li>
              <li>You own your MVP concept and implementation</li>
              <li>The revenue sharing agreement does NOT affect ownership</li>
              <li>BoDiGi retains rights to the platform and AI tools (Aura & Boltz)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-green-400 mb-2">6. User Conduct</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Do not use the platform for illegal purposes</li>
              <li>Do not create harmful, offensive, or fraudulent content</li>
              <li>Do not abuse or exploit the AI agents</li>
              <li>Respect other users' privacy and intellectual property</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-green-400 mb-2">7. Account Termination</h3>
            <p>
              BoDiGi reserves the right to terminate accounts that violate these terms or engage in abusive behavior.
            </p>
          </div>

          <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30 mt-6">
            <p className="text-sm text-gray-400">
              <strong className="text-yellow-400">Trademark Notice:</strong> BoDiGi™ and the BoDiGi™ logo are trademarks of Bobbie Digital. 
              All rights reserved. Patent Pending. Unauthorized use is prohibited.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              <strong className="text-yellow-400">AI Model Names:</strong> Aura™, Boltz™, Vox™, CodeX™, and Nova™ are proprietary AI models 
              of BoDiGi™ and are trademarks of Bobbie Digital.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Policy */}
      <Card className="border-2 border-green-500/30 bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-green-400" />
            <CardTitle className="text-2xl text-green-400">Privacy Policy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-300">
          <p>
            <strong>Last Updated:</strong> December 2024
          </p>
          
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">Information We Collect</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Account information (email, name, phone, company)</li>
              <li>Subscription and billing data</li>
              <li>Brand and MVP data you create</li>
              <li>Usage analytics and platform interactions</li>
              <li>Communications with our AI agents and support</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">How We Use Your Data</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and improve the BoDiGi platform</li>
              <li>To process payments and manage subscriptions</li>
              <li>To train and improve our AI agents (anonymized)</li>
              <li>To send important updates and notifications</li>
              <li>To provide customer support</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">Data Sharing</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>We do NOT sell your personal data</li>
              <li>We share data only with service providers (payment processors, hosting)</li>
              <li>We may share anonymized data for analytics</li>
              <li>Investor Hub visibility is opt-in only</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">Your Rights</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Access and download your data anytime</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of marketing communications</li>
              <li>Control investor visibility settings</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">Data Security</h3>
            <p>
              We use industry-standard encryption and security measures to protect your data. However, no system is 100% secure.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Sharing Details */}
      <Card className="border-2 border-red-500/30 bg-red-950/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <CardTitle className="text-2xl text-red-400">MVP Revenue Sharing - Detailed Explanation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-300">
          <p className="text-lg font-bold text-yellow-400">
            This is the most important legal agreement when using BoDiGi's MVP Creator.
          </p>

          <div>
            <h3 className="text-xl font-bold text-green-400 mb-2">What Does This Mean?</h3>
            <p className="mb-4">
              When you create an MVP through BoDiGi and accept the legal agreement, Bobbie Gray (founder of BoDiGi) becomes entitled to 10% of the revenue your MVP generates during its first year of operation.
            </p>
            
            <h4 className="font-bold text-yellow-400 mb-2">What Counts as Revenue?</h4>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Direct product sales</li>
              <li>Subscription fees</li>
              <li>Service fees</li>
              <li>Licensing fees</li>
              <li>Advertising revenue</li>
              <li>Any other form of monetization</li>
            </ul>

            <h4 className="font-bold text-yellow-400 mb-2">What Happens After Year One?</h4>
            <p className="mb-4">
              After 12 months from the date you accept the MVP agreement, the revenue sharing ends completely. You keep 100% of all future revenue.
            </p>

            <h4 className="font-bold text-yellow-400 mb-2">Example:</h4>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p><strong>Your MVP generates $10,000 in Year 1:</strong></p>
              <ul className="list-none space-y-1 mt-2">
                <li>• You keep: $9,000</li>
                <li>• BoDiGi receives: $1,000 (10%)</li>
              </ul>
              <p className="mt-3"><strong>Your MVP generates $50,000 in Year 2:</strong></p>
              <ul className="list-none space-y-1 mt-2">
                <li>• You keep: $50,000 (100%)</li>
                <li>• BoDiGi receives: $0</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
            <p className="font-bold text-yellow-400 mb-2">
              ⚠️ You must explicitly accept this agreement before your MVP is finalized.
            </p>
            <p>
              If you do not accept, you can still use BoDiGi to plan and conceptualize your MVP, but Boltz won't finalize the MVP details.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-2 border-yellow-500/30 bg-gray-900">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f049e8b39754755a23cad0/e3c0fa3cb_Chatbotassistant_compressed.png"
              alt="BoDiGi™ Logo"
              className="w-12 h-12 object-contain"
            />
            <p className="text-xl font-bold text-yellow-400">BoDiGi™</p>
          </div>
          <h3 className="text-xl font-bold text-yellow-400 mb-2">Questions or Concerns?</h3>
          <p className="text-gray-300 mb-4">
            If you have any questions about these terms, privacy policy, disclaimers, or revenue sharing agreement, please contact us.
          </p>
          <p className="text-green-400 mb-2">
            Email: support@bodigi-digital.com
          </p>
          <p className="text-xs text-gray-500 mt-4">
            © 2024 BoDiGi™ by Bobbie Digital. All rights reserved.<br/>
            BoDiGi™ and the BoDiGi™ logo are trademarks of Bobbie Digital. Patent Pending.
          </p>
          <p className="text-xs text-red-400 mt-3 font-bold">
            BY USING BODIGI™, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO ALL TERMS, 
            DISCLAIMERS, AND LIMITATIONS STATED ABOVE.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
