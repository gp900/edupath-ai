import { BookOpen, Video, ClipboardCheck, Award, TrendingUp, Brain, Target, FileQuestion } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Curriculum Mapping",
    description: "Paste your university syllabus and watch AI transform it into a structured, exam-oriented learning plan with units, topics, and priority indicators."
  },
  {
    icon: Target,
    title: "Exam Importance Indicators",
    description: "Every topic is tagged with exam importance (High/Medium/Low) based on previous year patterns and frequently asked questions."
  },
  {
    icon: Video,
    title: "Curated Video Lessons",
    description: "Each topic comes with handpicked YouTube videos that match your university curriculum for effective outcome-based learning."
  },
  {
    icon: FileQuestion,
    title: "Previous Year Questions",
    description: "Practice with PYQs, important theory questions, numerical problems, and MCQs based on actual university exam patterns."
  },
  {
    icon: ClipboardCheck,
    title: "Mock Tests",
    description: "Assess your exam readiness with university-pattern mock tests that simulate real exam conditions and time limits."
  },
  {
    icon: TrendingUp,
    title: "Academic Performance Tracking",
    description: "Monitor your exam readiness with detailed analytics showing weak areas, topic-wise progress, and improvement suggestions."
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything for Academic Excellence
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform provides all the tools to transform your university syllabus into an effective, exam-oriented learning experience.
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
