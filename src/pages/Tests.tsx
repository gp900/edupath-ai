import { FileQuestion, Clock, CheckCircle2, Play, Trophy, Target, GraduationCap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const mockTests = [
  {
    id: 1,
    title: "Data Structures - Unit I & II Mock Test",
    subject: "Data Structures & Algorithms",
    pattern: "University Pattern",
    duration: "90 mins",
    questions: 40,
    marks: 80,
    status: "available",
    attempts: 0,
    maxAttempts: 3,
    difficulty: "Moderate"
  },
  {
    id: 2,
    title: "DBMS - Mid-Semester Mock",
    subject: "Database Management Systems",
    pattern: "Mid-Sem Pattern",
    duration: "60 mins",
    questions: 30,
    marks: 50,
    status: "available",
    attempts: 1,
    maxAttempts: 3,
    lastScore: 38,
    lastPercentage: 76,
    difficulty: "Moderate"
  },
  {
    id: 3,
    title: "Operating Systems - Full Syllabus Test",
    subject: "Operating Systems",
    pattern: "End-Sem Pattern",
    duration: "120 mins",
    questions: 50,
    marks: 100,
    status: "completed",
    attempts: 2,
    maxAttempts: 3,
    bestScore: 88,
    bestPercentage: 88,
    difficulty: "Challenging"
  },
  {
    id: 4,
    title: "DSA - Quick Revision Test",
    subject: "Data Structures & Algorithms",
    pattern: "MCQ Only",
    duration: "30 mins",
    questions: 30,
    marks: 30,
    status: "completed",
    attempts: 1,
    maxAttempts: 3,
    bestScore: 27,
    bestPercentage: 90,
    difficulty: "Easy"
  },
];

const getDifficultyStyle = (difficulty: string) => {
  switch (difficulty) {
    case "Easy": return "bg-success/10 text-success";
    case "Moderate": return "bg-warning/10 text-warning";
    case "Challenging": return "bg-destructive/10 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function Tests() {
  const availableTests = mockTests.filter(t => t.status === "available");
  const completedTests = mockTests.filter(t => t.status === "completed");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mock Tests</h1>
        <p className="text-muted-foreground">
          University exam pattern tests to assess your exam readiness and academic performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <FileQuestion className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockTests.length}</p>
              <p className="text-sm text-muted-foreground">Total Tests</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedTests.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">89%</p>
              <p className="text-sm text-muted-foreground">Best Score</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">82%</p>
              <p className="text-sm text-muted-foreground">Avg. Performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Readiness Alert */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <GraduationCap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">Academic Performance Improvement</p>
          <p className="text-sm text-muted-foreground">
            Based on your mock test performance, focus on Unit II topics in Data Structures. 
            Your weakest areas are Graph Traversals and AVL Tree rotations.
          </p>
        </div>
      </div>

      {/* Available Tests */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Available Tests ({availableTests.length})
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {availableTests.map((test) => (
            <div 
              key={test.id}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center shrink-0">
                  <FileQuestion className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{test.title}</h3>
                  <p className="text-sm text-muted-foreground">{test.subject}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                <Badge variant="outline">{test.pattern}</Badge>
                <Badge className={getDifficultyStyle(test.difficulty)}>{test.difficulty}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {test.duration}
                </span>
                <span className="flex items-center gap-1">
                  <FileQuestion className="w-4 h-4" />
                  {test.questions} questions
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {test.marks} marks
                </span>
              </div>

              {test.lastPercentage && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Last Attempt</span>
                    <span className="font-medium text-foreground">{test.lastPercentage}%</span>
                  </div>
                  <Progress value={test.lastPercentage} className="h-2" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {test.attempts}/{test.maxAttempts} attempts used
                </span>
                <Button className="gap-2">
                  <Play className="w-4 h-4" />
                  {test.attempts > 0 ? "Retake Test" : "Start Test"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Tests */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          Completed Tests ({completedTests.length})
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {completedTests.map((test) => (
            <div 
              key={test.id}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-success/10 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{test.title}</h3>
                  <p className="text-sm text-muted-foreground">{test.subject}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="outline">{test.pattern}</Badge>
                <Badge className="bg-success/10 text-success">
                  Best: {test.bestScore}/{test.marks} ({test.bestPercentage}%)
                </Badge>
              </div>

              <div className="mb-4">
                <Progress value={test.bestPercentage} className="h-2" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {test.attempts}/{test.maxAttempts} attempts used
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Review Answers</Button>
                  {test.attempts < test.maxAttempts && (
                    <Button variant="ghost" size="sm">Retake</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-accent/50 border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Exam Readiness Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Take mock tests in exam-like conditions - no distractions, strict time limits</li>
              <li>• Review incorrect answers thoroughly to understand your weak areas</li>
              <li>• Aim for 80%+ consistently before your actual university exam</li>
              <li>• Focus on high-priority topics that appear frequently in previous years</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
