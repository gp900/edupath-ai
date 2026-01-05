import { BookOpen, Clock, Trophy, TrendingUp, Plus, Target, AlertTriangle, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const stats = [
  { label: "Active Subjects", value: "3", icon: BookOpen, color: "text-primary" },
  { label: "Study Hours", value: "47", icon: Clock, color: "text-success" },
  { label: "Certificates", value: "2", icon: Trophy, color: "text-warning" },
  { label: "Exam Readiness", value: "68%", icon: TrendingUp, color: "text-primary" },
];

const activeSubjects = [
  { 
    title: "Data Structures & Algorithms", 
    progress: 75, 
    topics: 20, 
    completed: 15,
    lastAccessed: "2 hours ago",
    highPriority: 8
  },
  { 
    title: "Database Management Systems", 
    progress: 45, 
    topics: 18, 
    completed: 8,
    lastAccessed: "Yesterday",
    highPriority: 6
  },
  { 
    title: "Operating Systems", 
    progress: 90, 
    topics: 15, 
    completed: 14,
    lastAccessed: "3 days ago",
    highPriority: 5
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Academic Dashboard</h1>
          <p className="text-muted-foreground">Track your exam readiness and academic performance</p>
        </div>
        <Link to="/dashboard/syllabus">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Subject
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-accent flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Priority Alert */}
      <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">Focus on High-Priority Topics</p>
          <p className="text-sm text-muted-foreground">
            You have 19 high-priority topics pending across your subjects. These are frequently asked in university exams.
          </p>
        </div>
        <Link to="/dashboard/subjects">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </div>

      {/* Active Subjects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Continue Your Preparation</h2>
          <Link to="/dashboard/subjects">
            <Button variant="ghost" size="sm">View All Subjects</Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSubjects.map((subject, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{subject.lastAccessed}</span>
              </div>
              
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                {subject.title}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <span>{subject.completed}/{subject.topics} topics</span>
              </div>

              <div className="flex items-center gap-2 text-sm mb-4">
                <Flame className="w-4 h-4 text-destructive" />
                <span className="text-destructive font-medium">{subject.highPriority} high-priority pending</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Exam Readiness</span>
                  <span className="font-medium text-foreground">{subject.progress}%</span>
                </div>
                <Progress value={subject.progress} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-accent/50 border border-border rounded-xl p-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <Target className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Start Your Exam Preparation
            </h2>
            <p className="text-muted-foreground mb-4">
              Paste your university syllabus and let our AI create a personalized, exam-oriented study roadmap 
              with curriculum mapping, topic prioritization, and outcome-based learning materials.
            </p>
            <Link to="/dashboard/syllabus">
              <Button variant="hero" size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Add New Subject
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
