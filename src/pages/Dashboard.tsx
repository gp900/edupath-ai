import { BookOpen, Clock, Trophy, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const stats = [
  { label: "Active Courses", value: "3", icon: BookOpen, color: "text-primary" },
  { label: "Hours Learned", value: "47", icon: Clock, color: "text-success" },
  { label: "Certificates", value: "2", icon: Trophy, color: "text-warning" },
  { label: "Progress", value: "68%", icon: TrendingUp, color: "text-primary" },
];

const recentCourses = [
  { 
    title: "Data Structures & Algorithms", 
    progress: 75, 
    topics: 12, 
    completed: 9,
    lastAccessed: "2 hours ago"
  },
  { 
    title: "Machine Learning Fundamentals", 
    progress: 45, 
    topics: 15, 
    completed: 7,
    lastAccessed: "Yesterday"
  },
  { 
    title: "Web Development with React", 
    progress: 90, 
    topics: 10, 
    completed: 9,
    lastAccessed: "3 days ago"
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your learning overview.</p>
        </div>
        <Link to="/dashboard/syllabus">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Course
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

      {/* Recent Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Continue Learning</h2>
          <Link to="/dashboard/courses">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentCourses.map((course, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{course.lastAccessed}</span>
              </div>
              
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                {course.title}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span>{course.completed}/{course.topics} topics</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-accent/50 border border-border rounded-xl p-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">Start a New Learning Journey</h2>
        <p className="text-muted-foreground mb-6">
          Paste your university syllabus and let AI create a personalized study roadmap for you.
        </p>
        <Link to="/dashboard/syllabus">
          <Button variant="hero" size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create New Course
          </Button>
        </Link>
      </div>
    </div>
  );
}
