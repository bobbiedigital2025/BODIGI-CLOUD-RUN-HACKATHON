import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Sparkles, 
  Rocket, 
  TrendingUp, 
  Repeat,
  Shield,
  CreditCard,
  HelpCircle
} from "lucide-react";

export default function Documentation() {
  const sections = [
    {
      title: "Getting Started",
      icon: BookOpen,
      color: "from-blue-600 to-cyan-600",
      items: [
        {
          title: "Welcome to BoDigi",
          content: "BoDigi helps you build, launch, and grow your digital business with AI-powered tools. Work with Aura and Boltz, our AI agents, to create your brand and MVP."
        },
        {
          title: "How It Works",
          content: "1. Sign up for a 3-day free trial\n2. Build your brand with Aura\n3. Create your MVP with Boltz\n4. Learn marketing strategies\n5. Build your Learn & Earn Loop\n6. Launch and grow!"
        },
        {
          title: "Subscription Tiers",
          content: "Basic ($19.99/mo): 1 brand, 1 MVP, 2 logos, 50 AI messages\nPro ($49.99/mo): 3 brands, 3 MVPs, 10 logos, 200 AI messages\nElite ($99.99/mo): Unlimited everything!"
        }
      ]
    },
    {
      title: "Brand Builder with Aura",
      icon: Sparkles,
      color: "from-green-600 to-emerald-600",
      items: [
        {
          title: "What is Brand Builder?",
          content: "Aura, our AI brand expert, helps you create a complete brand identity including name, slogan, personality, target audience, and colors."
        },
        {
          title: "How to Use",
          content: "1. Chat with Aura about your business idea\n2. Answer her questions about your vision\n3. She'll auto-save your progress\n4. Click 'Generate Logo' when ready\n5. Your brand is complete!"
        },
        {
          title: "Best Practices",
          content: "• Be specific about your target audience\n• Share your business values and personality\n• Describe problems you want to solve\n• Think about your brand's unique value"
        }
      ]
    },
    {
      title: "MVP Creator with Boltz",
      icon: Rocket,
      color: "from-yellow-600 to-orange-600",
      items: [
        {
          title: "What is MVP Creator?",
          content: "Boltz, our AI coding agent, helps you design a Minimum Viable Product (MVP) - a digital solution with 5 core features valued at $10 each ($50 total)."
        },
        {
          title: "How to Use",
          content: "1. Tell Boltz your niche and industry\n2. Discuss problems your MVP will solve\n3. Review 3 MVP ideas at a time\n4. Select your favorite\n5. Accept legal agreement (10% revenue year 1)\n6. Your MVP is ready!"
        },
        {
          title: "Legal Agreement",
          content: "By accepting an MVP, you agree that Bobbie Gray (BoDigi founder) receives 10% of revenue/royalties for the FIRST YEAR only. After year 1, you keep 100%."
        }
      ]
    },
    {
      title: "Marketing Hub",
      icon: TrendingUp,
      color: "from-purple-600 to-pink-600",
      items: [
        {
          title: "Marketing Strategies",
          content: "Learn proven strategies including social media marketing, email marketing, content marketing, and paid advertising."
        },
        {
          title: "Quick Wins",
          content: "Get actionable tasks you can complete today to start attracting customers, including setting up profiles, creating content, and building your email list."
        }
      ]
    },
    {
      title: "Learn & Earn Loop Builder",
      icon: Repeat,
      color: "from-indigo-600 to-purple-600",
      items: [
        {
          title: "What is a Loop?",
          content: "A gamified marketing funnel that educates customers about your MVP while offering your 5 premium features as rewards and incentives."
        },
        {
          title: "How to Build",
          content: "1. Chat with Boltz about marketing goals\n2. He'll create educational content\n3. Add gamification (points, badges)\n4. Include your 5 features\n5. Publish your loop\n6. Share with customers!"
        }
      ]
    },
    {
      title: "Billing & Subscriptions",
      icon: CreditCard,
      color: "from-green-600 to-teal-600",
      items: [
        {
          title: "Free Trial",
          content: "All plans include a 3-day free trial. You'll be automatically charged after the trial ends unless you cancel."
        },
        {
          title: "Pay-Per-Use Options",
          content: "Don't want a subscription? Buy features individually:\n• Brand Builder: $20\n• MVP Creator: $30\n• Logo Generation: $12\n• 100 AI Messages: $15"
        },
        {
          title: "Cancellation",
          content: "Cancel anytime before your trial ends to avoid charges. You keep everything you've built!"
        }
      ]
    },
    {
      title: "Legal & Policies",
      icon: Shield,
      color: "from-red-600 to-orange-600",
      items: [
        {
          title: "Terms of Service",
          content: "By using BoDigi, you agree to our terms including the revenue sharing agreement for MVPs and subscription auto-renewal."
        },
        {
          title: "Privacy Policy",
          content: "We protect your data and never share personal information without consent. Your projects and content belong to you."
        },
        {
          title: "Revenue Sharing",
          content: "MVPs created through BoDigi include a 10% revenue share to Bobbie Gray for the first year only. This is disclosed before you accept any MVP."
        }
      ]
    },
    {
      title: "FAQ",
      icon: HelpCircle,
      color: "from-gray-600 to-gray-400",
      items: [
        {
          title: "Can I cancel anytime?",
          content: "Yes! Cancel anytime during or after your free trial. You keep everything you've created."
        },
        {
          title: "Do I own my brand and MVP?",
          content: "Yes! You own 100% of your brand and MVP. The revenue sharing only applies to first-year revenue."
        },
        {
          title: "How do I contact support?",
          content: "Use the feedback button in the sidebar or email support@bodigi.com"
        },
        {
          title: "Can I upgrade/downgrade?",
          content: "Yes! Change your subscription tier anytime from your Profile page."
        }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card className="border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-900/30 to-orange-900/30">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-yellow-400">Documentation</h1>
              <p className="text-lg text-gray-300">
                Everything you need to know about BoDigi
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center`}>
              <section.icon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-yellow-400">{section.title}</h2>
          </div>
          
          <div className="space-y-4">
            {section.items.map((item, itemIndex) => (
              <Card key={itemIndex} className="border-2 border-yellow-500/30 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-lg text-green-400">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 whitespace-pre-line">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}