import { FileText, Sparkles, BookOpen, Trophy, Target } from "lucide-react";

const steps = [
  {
    icon: FileText,
    step: "01",
    title: "Paste Your Syllabus",
    description: "Copy and paste your official university curriculum or syllabus document into our platform."
  },
  {
    icon: Sparkles,
    step: "02",
    title: "AI Maps Your Curriculum",
    description: "Our AI analyzes the syllabus, identifies units and topics, and assigns exam importance indicators."
  },
  {
    icon: Target,
    step: "03",
    title: "Follow Personalized Learning Path",
    description: "Study with curated videos, PYQs, and practice materials aligned to your university's exam pattern."
  },
  {
    icon: Trophy,
    step: "04",
    title: "Achieve Exam Readiness",
    description: "Take mock tests, track your performance, and achieve the confidence to clear your exams."
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-accent/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Your Path to Academic Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with our simple 4-step process for exam preparation
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-border" />
              )}
              
              <div className="relative bg-card border border-border rounded-xl p-8 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full">
                  {item.step}
                </div>
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mt-4 mb-6">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
