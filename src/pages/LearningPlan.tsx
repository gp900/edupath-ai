import { useState } from "react";
import { 
  BookOpen, Clock, Target, CheckCircle2, Circle, 
  ChevronDown, ChevronRight, Play, FileText, Video,
  AlertTriangle, Flame, Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

type ImportanceLevel = "high" | "medium" | "low";

interface Topic {
  id: string;
  name: string;
  duration: string;
  importance: ImportanceLevel;
  completed: boolean;
  hasVideo: boolean;
  hasPractice: boolean;
}

interface Unit {
  id: string;
  name: string;
  topics: Topic[];
  estimatedHours: number;
}

const samplePlan: Unit[] = [
  {
    id: "1",
    name: "Unit I: Introduction to Data Structures",
    estimatedHours: 8,
    topics: [
      { id: "1-1", name: "Abstract Data Types and Their Importance", duration: "45 min", importance: "medium", completed: true, hasVideo: true, hasPractice: true },
      { id: "1-2", name: "Arrays - Declaration, Initialization, Operations", duration: "1.5 hrs", importance: "high", completed: true, hasVideo: true, hasPractice: true },
      { id: "1-3", name: "Time Complexity Analysis - Big O Notation", duration: "2 hrs", importance: "high", completed: false, hasVideo: true, hasPractice: true },
      { id: "1-4", name: "Space Complexity Analysis", duration: "1 hr", importance: "medium", completed: false, hasVideo: true, hasPractice: false },
    ]
  },
  {
    id: "2",
    name: "Unit II: Linear Data Structures",
    estimatedHours: 10,
    topics: [
      { id: "2-1", name: "Stacks - Implementation using Arrays", duration: "1.5 hrs", importance: "high", completed: false, hasVideo: true, hasPractice: true },
      { id: "2-2", name: "Stack Applications - Infix, Prefix, Postfix", duration: "2 hrs", importance: "high", completed: false, hasVideo: true, hasPractice: true },
      { id: "2-3", name: "Queues - Types (Simple, Circular, Priority)", duration: "2 hrs", importance: "high", completed: false, hasVideo: true, hasPractice: true },
      { id: "2-4", name: "Linked Lists - Singly Linked List Operations", duration: "2 hrs", importance: "high", completed: false, hasVideo: true, hasPractice: true },
      { id: "2-5", name: "Doubly and Circular Linked Lists", duration: "1.5 hrs", importance: "medium", completed: false, hasVideo: true, hasPractice: false },
    ]
  },
  {
    id: "3",
    name: "Unit III: Non-Linear Data Structures",
    estimatedHours: 12,
    topics: [
      { id: "3-1", name: "Binary Trees - Terminology and Properties", duration: "1 hr", importance: "medium", completed: false, hasVideo: true, hasPractice: true },
      { id: "3-2", name: "Tree Traversals - Inorder, Preorder, Postorder", duration: "2 hrs", importance: "high", completed: false, hasVideo: true, hasPractice: true },
      { id: "3-3", name: "Binary Search Trees - Operations", duration: "2.5 hrs", importance: "high", completed: false, hasVideo: true, hasPractice: true },
      { id: "3-4", name: "AVL Trees - Rotations and Balancing", duration: "2.5 hrs", importance: "high", completed: false, hasVideo: true, hasPractice: true },
      { id: "3-5", name: "Graph Representation - Adjacency Matrix/List", duration: "1.5 hrs", importance: "medium", completed: false, hasVideo: true, hasPractice: true },
      { id: "3-6", name: "Graph Traversals - BFS and DFS", duration: "2.5 hrs", importance: "high", completed: false, hasVideo: true, hasPractice: true },
    ]
  },
  {
    id: "4",
    name: "Unit IV: Sorting and Searching",
    estimatedHours: 10,
    topics: [
      { id: "4-1", name: "Linear and Binary Search", duration: "1.5 hrs", importance: "high", completed: false, hasVideo: true, hasPractice: true },
      { id: "4-2", name: "Bubble, Selection, Insertion Sort", duration: "2 hrs", importance: "medium", completed: false, hasVideo: true, hasPractice: true },
      { id: "4-3", name: "Merge Sort - Divide and Conquer", duration: "2 hrs", importance: "high", completed: false, hasVideo: true, hasPractice: true },
      { id: "4-4", name: "Quick Sort - Partitioning Techniques", duration: "2 hrs", importance: "high", completed: false, hasVideo: true, hasPractice: true },
      { id: "4-5", name: "Heap Sort and Heapify", duration: "2 hrs", importance: "medium", completed: false, hasVideo: true, hasPractice: true },
    ]
  },
];

const getImportanceBadge = (importance: ImportanceLevel) => {
  switch (importance) {
    case "high":
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
          <Flame className="w-3 h-3" />
          High Priority
        </Badge>
      );
    case "medium":
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20 gap-1">
          <AlertTriangle className="w-3 h-3" />
          Medium
        </Badge>
      );
    case "low":
      return (
        <Badge className="bg-muted text-muted-foreground border-border gap-1">
          <Minus className="w-3 h-3" />
          Low
        </Badge>
      );
  }
};

export default function LearningPlan() {
  const [expandedUnits, setExpandedUnits] = useState<string[]>(["1"]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const totalTopics = samplePlan.reduce((acc, unit) => acc + unit.topics.length, 0);
  const completedTopics = samplePlan.reduce(
    (acc, unit) => acc + unit.topics.filter(t => t.completed).length, 
    0
  );
  const totalHours = samplePlan.reduce((acc, unit) => acc + unit.estimatedHours, 0);
  const progressPercent = Math.round((completedTopics / totalTopics) * 100);

  const highPriorityCount = samplePlan.reduce(
    (acc, unit) => acc + unit.topics.filter(t => t.importance === "high").length,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to="/dashboard/subjects" className="hover:text-primary">My Subjects</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Learning Plan</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Data Structures and Algorithms
        </h1>
        <p className="text-muted-foreground">
          Personalized Learning Path • Mumbai University Curriculum
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{progressPercent}%</p>
              <p className="text-sm text-muted-foreground">Exam Readiness</p>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedTopics}/{totalTopics}</p>
              <p className="text-sm text-muted-foreground">Topics Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
              <p className="text-sm text-muted-foreground">Estimated Study Time</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{highPriorityCount}</p>
              <p className="text-sm text-muted-foreground">High Priority Topics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-muted-foreground">Exam Importance:</span>
        <div className="flex items-center gap-1">
          <Flame className="w-4 h-4 text-destructive" />
          <span>High Priority (Frequently Asked)</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span>Medium (Important)</span>
        </div>
        <div className="flex items-center gap-1">
          <Minus className="w-4 h-4 text-muted-foreground" />
          <span>Low (Basics)</span>
        </div>
      </div>

      {/* Units and Topics */}
      <div className="space-y-4">
        {samplePlan.map((unit) => {
          const unitCompleted = unit.topics.filter(t => t.completed).length;
          const unitProgress = Math.round((unitCompleted / unit.topics.length) * 100);
          const isExpanded = expandedUnits.includes(unit.id);

          return (
            <div 
              key={unit.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {/* Unit Header */}
              <button
                onClick={() => toggleUnit(unit.id)}
                className="w-full flex items-center gap-4 p-6 hover:bg-accent/50 transition-colors text-left"
              >
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {unit.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{unit.topics.length} topics</span>
                    <span>•</span>
                    <span>{unit.estimatedHours} hours</span>
                    <span>•</span>
                    <span>{unitCompleted}/{unit.topics.length} completed</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={unitProgress} className="h-2" />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {unitProgress}%
                  </span>
                </div>

                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Topics List */}
              {isExpanded && (
                <div className="border-t border-border">
                  {unit.topics.map((topic, index) => (
                    <div 
                      key={topic.id}
                      className={`flex items-center gap-4 p-4 pl-8 hover:bg-accent/30 transition-colors ${
                        index !== unit.topics.length - 1 ? "border-b border-border/50" : ""
                      }`}
                    >
                      {/* Completion Status */}
                      <div className="shrink-0">
                        {topic.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-success" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* Topic Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${topic.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {topic.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {topic.duration}
                          </span>
                          {topic.hasVideo && (
                            <span className="text-sm text-primary flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              Video
                            </span>
                          )}
                          {topic.hasPractice && (
                            <span className="text-sm text-success flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Practice
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Importance Badge */}
                      <div className="hidden sm:block">
                        {getImportanceBadge(topic.importance)}
                      </div>

                      {/* Action */}
                      <Link to={`/dashboard/courses/1?topic=${topic.id}`}>
                        <Button 
                          size="sm" 
                          variant={topic.completed ? "outline" : "default"}
                          className="gap-1"
                        >
                          <Play className="w-4 h-4" />
                          {topic.completed ? "Review" : "Start"}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-accent/50 border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Ready to Test Your Knowledge?</h3>
            <p className="text-sm text-muted-foreground">
              Practice with previous year questions and exam-pattern mock tests.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard/exam-practice">
              <Button variant="outline">Exam Practice</Button>
            </Link>
            <Link to="/dashboard/tests">
              <Button>Take Mock Test</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
