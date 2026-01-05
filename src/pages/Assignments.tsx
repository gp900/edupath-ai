import { ClipboardCheck, Clock, CheckCircle2, AlertCircle, Flame, FileQuestion, Calculator, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const examPractice = [
  {
    id: 1,
    title: "Previous Year Questions - Arrays & Linked Lists",
    subject: "Data Structures & Algorithms",
    type: "pyq",
    questions: 15,
    status: "pending",
    importance: "High",
    year: "2023-24"
  },
  {
    id: 2,
    title: "Important Theory Questions - Tree Traversals",
    subject: "Data Structures & Algorithms",
    type: "theory",
    questions: 10,
    status: "pending",
    importance: "High"
  },
  {
    id: 3,
    title: "Numerical Practice - Sorting Algorithms",
    subject: "Data Structures & Algorithms",
    type: "numerical",
    questions: 8,
    status: "pending",
    importance: "Medium"
  },
  {
    id: 4,
    title: "MCQs - Database Normalization",
    subject: "Database Management Systems",
    type: "mcq",
    questions: 25,
    status: "pending",
    importance: "High"
  },
];

const completedPractice = [
  {
    id: 5,
    title: "Previous Year Questions - SQL Queries",
    subject: "Database Management Systems",
    type: "pyq",
    questions: 12,
    status: "completed",
    score: "10/12",
    importance: "High",
    year: "2022-23"
  },
  {
    id: 6,
    title: "MCQs - Stack Operations",
    subject: "Data Structures & Algorithms",
    type: "mcq",
    questions: 20,
    status: "completed",
    score: "18/20",
    importance: "Medium"
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "pyq": return FileQuestion;
    case "theory": return BookOpen;
    case "numerical": return Calculator;
    case "mcq": return ClipboardCheck;
    default: return ClipboardCheck;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "pyq": return "Previous Year Questions";
    case "theory": return "Theory Questions";
    case "numerical": return "Numerical Problems";
    case "mcq": return "MCQ Practice";
    default: return "Practice";
  }
};

const getImportanceStyle = (importance: string) => {
  switch (importance) {
    case "High": return "bg-destructive/10 text-destructive";
    case "Medium": return "bg-warning/10 text-warning";
    case "Low": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function Assignments() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Exam Practice</h1>
        <p className="text-muted-foreground">
          Previous year questions, important theory, numericals, and MCQs based on university exam patterns
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <FileQuestion className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">24</p>
              <p className="text-xs text-muted-foreground">PYQ Sets</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">18</p>
              <p className="text-xs text-muted-foreground">Theory Sets</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">15</p>
              <p className="text-xs text-muted-foreground">Numerical Sets</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">82%</p>
              <p className="text-xs text-muted-foreground">Avg. Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <AlertCircle className="w-4 h-4" />
            Pending ({examPractice.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Completed ({completedPractice.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {examPractice.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <div 
                key={item.id}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center shrink-0">
                    <TypeIcon className="w-7 h-7 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      {item.importance === "High" && (
                        <Badge className={getImportanceStyle(item.importance)}>
                          <Flame className="w-3 h-3 mr-1" />
                          {item.importance} Priority
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.subject}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline">{getTypeLabel(item.type)}</Badge>
                      <span className="flex items-center gap-1">
                        <ClipboardCheck className="w-4 h-4" />
                        {item.questions} questions
                      </span>
                      {item.year && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {item.year}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button>Start Practice</Button>
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedPractice.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <div 
                key={item.id}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-14 h-14 bg-success/10 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-success" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <Badge className="bg-success/10 text-success">
                        Score: {item.score}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.subject}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline">{getTypeLabel(item.type)}</Badge>
                      <span className="flex items-center gap-1">
                        <ClipboardCheck className="w-4 h-4" />
                        {item.questions} questions
                      </span>
                    </div>
                  </div>

                  <Button variant="outline">Review Answers</Button>
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <div className="bg-accent/50 border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Exam-Oriented Practice Strategy</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>PYQs:</strong> Previous year questions help you understand exam patterns and frequently asked topics</li>
              <li>• <strong>Theory:</strong> Important definitions, concepts, and descriptive answers for written exams</li>
              <li>• <strong>Numericals:</strong> Step-by-step problem solving practice for calculation-based questions</li>
              <li>• <strong>MCQs:</strong> Quick revision and concept clarity for objective-type questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
