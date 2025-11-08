import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Play,
  CheckCircle,
  Lock
} from "lucide-react";

export default function Training() {
  const courses = [
    {
      title: "BoDigi Fundamentals",
      level: "Beginner",
      duration: "30 mins",
      lessons: [
        "Introduction to BoDigi",
        "Meet Aura and Boltz",
        "Understanding the Platform",
        "Your First Brand",
        "Subscription Tiers Explained"
      ],
      unlocked: true
    },
    {
      title: "Brand Building Mastery",
      level: "Beginner",
      duration: "1 hour",
      lessons: [
        "The Psychology of Branding",
        "Defining Your Target Audience",
        "Creating a Brand Personality",
        "Color Theory for Brands",
        "Logo Design Principles",
        "Building Brand Consistency"
      ],
      unlocked: true
    },
    {
      title: "MVP Development 101",
      level: "Intermediate",
      duration: "1.5 hours",
      lessons: [
        "What is an MVP?",
        "Identifying Market Problems",
        "Feature Prioritization",
        "Monetization Strategies",
        "Legal Agreements Explained",
        "Launch Checklist"
      ],
      unlocked: true
    },
    {
      title: "Digital Marketing Foundations",
      level: "Intermediate",
      duration: "2 hours",
      lessons: [
        "Marketing Fundamentals",
        "Social Media Strategy",
        "Content Marketing Basics",
        "Email Marketing 101",
        "SEO Essentials",
        "Paid Advertising Overview",
        "Analytics and Metrics"
      ],
      unlocked: true
    },
    {
      title: "Learn & Earn Loop Strategy",
      level: "Advanced",
      duration: "1 hour",
      lessons: [
        "Understanding Sales Funnels",
        "Gamification Principles",
        "Creating Educational Content",
        "Incentive Design",
        "Conversion Optimization",
        "Loop Analytics"
      ],
      unlocked: true
    },
    {
      title: "Scaling Your Business",
      level: "Advanced",
      duration: "2 hours",
      lessons: [
        "Growth Strategies",
        "Building Your Team",
        "Automating Processes",
        "Customer Retention",
        "Raising Investment",
        "Exit Strategies"
      ],
      unlocked: false
    }
  ];

  const getLevelColor = (level) => {
    const colors = {
      Beginner: "bg-green-600",
      Intermediate: "bg-yellow-600",
      Advanced: "bg-purple-600"
    };
    return colors[level] || "bg-gray-600";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card className="border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-purple-400">Training Center</h1>
              <p className="text-lg text-gray-300">
                Master digital business with our comprehensive courses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((course, index) => (
          <Card key={index} className={`border-2 ${course.unlocked ? 'border-yellow-500/30 bg-gray-900' : 'border-gray-700 bg-gray-950'}`}>
            <CardHeader>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                    {course.duration}
                  </Badge>
                </div>
                {!course.unlocked && (
                  <Lock className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <CardTitle className={course.unlocked ? "text-yellow-400" : "text-gray-600"}>
                {course.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {course.lessons.map((lesson, lessonIndex) => (
                  <div key={lessonIndex} className="flex items-center gap-2 text-sm">
                    {course.unlocked ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-600" />
                    )}
                    <span className={course.unlocked ? "text-gray-300" : "text-gray-600"}>
                      {lesson}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                disabled={!course.unlocked}
                className={course.unlocked 
                  ? "w-full gold-gradient text-black hover:opacity-90" 
                  : "w-full bg-gray-800 text-gray-600 cursor-not-allowed"}
              >
                {course.unlocked ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Course
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Coming Soon
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}