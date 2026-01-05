import { ClipboardCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const assignments = [
  {
    id: 1,
    title: "Arrays and Linked Lists Practice",
    course: "Data Structures & Algorithms",
    dueDate: "Jan 15, 2025",
    questions: 10,
    status: "pending",
    difficulty: "Medium"
  },
  {
    id: 2,
    title: "Linear Regression Implementation",
    course: "Machine Learning Fundamentals",
    dueDate: "Jan 18, 2025",
    questions: 5,
    status: "pending",
    difficulty: "Hard"
  },
  {
    id: 3,
    title: "React Component Architecture",
    course: "Web Development with React",
    dueDate: "Jan 10, 2025",
    questions: 8,
    status: "completed",
    score: "8/8",
    difficulty: "Easy"
  },
  {
    id: 4,
    title: "Stack Implementation Challenge",
    course: "Data Structures & Algorithms",
    dueDate: "Jan 8, 2025",
    questions: 6,
    status: "completed",
    score: "5/6",
    difficulty: "Medium"
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy": return "bg-success/10 text-success";
    case "Medium": return "bg-warning/10 text-warning";
    case "Hard": return "bg-destructive/10 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function Assignments() {
  const pendingAssignments = assignments.filter(a => a.status === "pending");
  const completedAssignments = assignments.filter(a => a.status === "completed");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
        <p className="text-muted-foreground">Practice questions and assignments for your courses</p>
      </div>

      {/* Pending Assignments */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-warning" />
          Pending ({pendingAssignments.length})
        </h2>
        <div className="space-y-4">
          {pendingAssignments.map((assignment) => (
            <div 
              key={assignment.id}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-7 h-7 text-primary" />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                    <Badge variant="outline" className={getDifficultyColor(assignment.difficulty)}>
                      {assignment.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{assignment.course}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ClipboardCheck className="w-4 h-4" />
                      {assignment.questions} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Due: {assignment.dueDate}
                    </span>
                  </div>
                </div>

                <Button>Start Assignment</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Assignments */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          Completed ({completedAssignments.length})
        </h2>
        <div className="space-y-4">
          {completedAssignments.map((assignment) => (
            <div 
              key={assignment.id}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 bg-success/10 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-success" />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                    <Badge variant="outline" className={getDifficultyColor(assignment.difficulty)}>
                      {assignment.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{assignment.course}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ClipboardCheck className="w-4 h-4" />
                      Score: {assignment.score}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Completed: {assignment.dueDate}
                    </span>
                  </div>
                </div>

                <Button variant="outline">Review</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <ClipboardCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No assignments yet</h3>
          <p className="text-muted-foreground">
            Start a course to get practice questions and assignments
          </p>
        </div>
      )}
    </div>
  );
}
