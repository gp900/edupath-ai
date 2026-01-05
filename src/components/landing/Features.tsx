import { BookOpen, Video, ClipboardCheck, Award, TrendingUp, Brain } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Roadmaps",
    description: "Paste your syllabus and watch AI transform it into a structured learning plan with units, topics, and schedules."
  },
  {
    icon: Video,
    title: "Curated Video Lessons",
    description: "Each topic comes with embedded YouTube videos carefully selected to match your curriculum content."
  },
  {
    icon: ClipboardCheck,
    title: "Practice Questions",
    description: "Test your understanding with auto-generated practice questions and assignments for every topic."
  },
  {
    icon: BookOpen,
    title: "Mock Tests",
    description: "Prepare for exams with comprehensive mock tests that simulate real exam conditions."
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your learning journey with detailed analytics and progress visualizations."
  },
  {
    icon: Award,
    title: "Completion Certificates",
    description: "Earn certificates upon completing courses to showcase your achievements."
  }
];

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform provides all the tools to transform your university syllabus into an effective learning experience.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-card border border-border rounded-xl p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="w-7 h-7 text-accent-foreground group-hover:text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
