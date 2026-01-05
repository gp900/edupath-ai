import { FileQuestion, Clock, CheckCircle2, Play, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const tests = [
  {
    id: 1,
    title: "Data Structures Midterm Mock",
    course: "Data Structures & Algorithms",
    duration: "90 mins",
    questions: 40,
    status: "available",
    attempts: 0,
    maxAttempts: 3
  },
  {
    id: 2,
    title: "Machine Learning Concepts Quiz",
    course: "Machine Learning Fundamentals",
    duration: "45 mins",
    questions: 25,
    status: "available",
    attempts: 1,
    maxAttempts: 3,
    lastScore: 72
  },
  {
    id: 3,
    title: "React Fundamentals Test",
    course: "Web Development with React",
    duration: "60 mins",
    questions: 30,
    status: "completed",
    attempts: 2,
    maxAttempts: 3,
    bestScore: 88
  },
  {
    id: 4,
    title: "Arrays and Strings Quiz",
    course: "Data Structures & Algorithms",
    duration: "30 mins",
    questions: 20,
    status: "completed",
    attempts: 1,
    maxAttempts: 3,
    bestScore: 95
  },
];

export default function Tests() {
  const availableTests = tests.filter(t => t.status === "available");
  const completedTests = tests.filter(t => t.status === "completed");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mock Tests</h1>
        <p className="text-muted-foreground">Practice exams to prepare for your university tests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <FileQuestion className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{tests.length}</p>
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
              <p className="text-2xl font-bold text-foreground">92%</p>
              <p className="text-sm text-muted-foreground">Best Score</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">5.2h</p>
              <p className="text-sm text-muted-foreground">Time Spent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Tests */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Available Tests</h2>
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
                  <p className="text-sm text-muted-foreground">{test.course}</p>
                </div>
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
                <Badge variant="outline">
                  {test.attempts}/{test.maxAttempts} attempts
                </Badge>
              </div>

              {test.lastScore && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Last Score</span>
                    <span className="font-medium text-foreground">{test.lastScore}%</span>
                  </div>
                  <Progress value={test.lastScore} className="h-2" />
                </div>
              )}

              <Button className="w-full gap-2">
                <Play className="w-4 h-4" />
                {test.attempts > 0 ? "Retake Test" : "Start Test"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Tests */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Completed Tests</h2>
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
                  <p className="text-sm text-muted-foreground">{test.course}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-warning" />
                  Best: {test.bestScore}%
                </span>
                <Badge variant="outline">
                  {test.attempts}/{test.maxAttempts} attempts
                </Badge>
              </div>

              <div className="mb-4">
                <Progress value={test.bestScore} className="h-2" />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">Review Answers</Button>
                {test.attempts < test.maxAttempts && (
                  <Button variant="ghost" className="flex-1">Retake</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
