import { BookOpen, Clock, MoreVertical, Play, Target, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const subjects = [
  { 
    id: 1,
    title: "Data Structures & Algorithms", 
    description: "Arrays, Linked Lists, Trees, Graphs, Sorting, and Searching algorithms",
    university: "Mumbai University",
    progress: 75, 
    topics: 20, 
    completed: 15,
    estimatedHours: 40,
    highPriority: 8,
    status: "in-progress"
  },
  { 
    id: 2,
    title: "Database Management Systems", 
    description: "ER Diagrams, Normalization, SQL, Transactions, and Concurrency Control",
    university: "Mumbai University",
    progress: 45, 
    topics: 18, 
    completed: 8,
    estimatedHours: 35,
    highPriority: 6,
    status: "in-progress"
  },
  { 
    id: 3,
    title: "Operating Systems", 
    description: "Process Management, Memory Management, File Systems, and Scheduling",
    university: "Mumbai University",
    progress: 90, 
    topics: 15, 
    completed: 14,
    estimatedHours: 32,
    highPriority: 5,
    status: "in-progress"
  },
  { 
    id: 4,
    title: "Computer Networks", 
    description: "OSI Model, TCP/IP, Routing Protocols, and Network Security",
    university: "Mumbai University",
    progress: 100, 
    topics: 12, 
    completed: 12,
    estimatedHours: 28,
    highPriority: 0,
    status: "completed"
  },
];

export default function Courses() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Subjects</h1>
          <p className="text-muted-foreground">Track your curriculum-mapped learning progress and exam readiness</p>
        </div>
        <Link to="/dashboard/syllabus">
          <Button>Add New Subject</Button>
        </Link>
      </div>

      {/* Subjects List */}
      <div className="space-y-4">
        {subjects.map((subject) => (
          <div 
            key={subject.id}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Subject Icon */}
              <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>

              {/* Subject Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {subject.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {subject.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="outline">{subject.university}</Badge>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {subject.completed}/{subject.topics} topics
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {subject.estimatedHours} hours
                  </span>
                  {subject.highPriority > 0 && (
                    <span className="flex items-center gap-1 text-destructive">
                      <Flame className="w-4 h-4" />
                      {subject.highPriority} high-priority pending
                    </span>
                  )}
                  {subject.status === "completed" && (
                    <Badge className="bg-success/10 text-success">
                      Exam Ready
                    </Badge>
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Exam Readiness
                    </span>
                    <span className="font-medium text-foreground">{subject.progress}%</span>
                  </div>
                  <Progress value={subject.progress} className="h-2" />
                </div>
              </div>

              {/* Action */}
              <div className="lg:ml-4">
                <Link to={`/dashboard/learning-plan/${subject.id}`}>
                  <Button variant={subject.progress === 100 ? "outline" : "default"} className="gap-2 w-full lg:w-auto">
                    <Play className="w-4 h-4" />
                    {subject.progress === 100 ? "Review" : "Continue"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No subjects yet</h3>
          <p className="text-muted-foreground mb-6">
            Add your first subject by pasting your university syllabus
          </p>
          <Link to="/dashboard/syllabus">
            <Button>Add Your First Subject</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
