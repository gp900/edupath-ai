import { BookOpen, Clock, MoreVertical, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const courses = [
  { 
    id: 1,
    title: "Data Structures & Algorithms", 
    description: "Master fundamental data structures and algorithmic problem solving",
    progress: 75, 
    topics: 12, 
    completed: 9,
    duration: "24 hours",
    status: "in-progress"
  },
  { 
    id: 2,
    title: "Machine Learning Fundamentals", 
    description: "Introduction to ML concepts, algorithms, and practical applications",
    progress: 45, 
    topics: 15, 
    completed: 7,
    duration: "32 hours",
    status: "in-progress"
  },
  { 
    id: 3,
    title: "Web Development with React", 
    description: "Build modern web applications using React and related technologies",
    progress: 90, 
    topics: 10, 
    completed: 9,
    duration: "20 hours",
    status: "in-progress"
  },
  { 
    id: 4,
    title: "Database Management Systems", 
    description: "Learn SQL, database design, and management principles",
    progress: 100, 
    topics: 8, 
    completed: 8,
    duration: "16 hours",
    status: "completed"
  },
];

export default function Courses() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground">Track and continue your learning progress</p>
        </div>
        <Link to="/dashboard/syllabus">
          <Button>Create New Course</Button>
        </Link>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {courses.map((course) => (
          <div 
            key={course.id}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Course Icon */}
              <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>

              {/* Course Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {course.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.completed}/{course.topics} topics
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                  {course.status === "completed" && (
                    <span className="px-2 py-0.5 bg-success/10 text-success rounded-full text-xs font-medium">
                      Completed
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              </div>

              {/* Action */}
              <div className="lg:ml-4">
                <Link to={`/dashboard/courses/${course.id}`}>
                  <Button variant={course.progress === 100 ? "outline" : "default"} className="gap-2 w-full lg:w-auto">
                    <Play className="w-4 h-4" />
                    {course.progress === 100 ? "Review" : "Continue"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first course by pasting your syllabus
          </p>
          <Link to="/dashboard/syllabus">
            <Button>Create Your First Course</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
