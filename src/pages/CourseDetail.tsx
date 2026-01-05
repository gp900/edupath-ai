import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  BookOpen, 
  Video, 
  CheckCircle2, 
  Circle, 
  PlayCircle,
  Clock,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Mock course data
const courseData = {
  id: 1,
  title: "Data Structures & Algorithms",
  description: "Master fundamental data structures and algorithmic problem solving",
  progress: 75,
  units: [
    {
      id: 1,
      title: "Introduction to Data Structures",
      topics: [
        { id: 1, title: "What are Data Structures?", completed: true, duration: "15 min", videoId: "8hly31xKli0" },
        { id: 2, title: "Arrays and Their Operations", completed: true, duration: "25 min", videoId: "8hly31xKli0" },
        { id: 3, title: "Linked Lists", completed: true, duration: "30 min", videoId: "8hly31xKli0" },
      ]
    },
    {
      id: 2,
      title: "Stacks and Queues",
      topics: [
        { id: 4, title: "Stack Data Structure", completed: true, duration: "20 min", videoId: "8hly31xKli0" },
        { id: 5, title: "Queue Data Structure", completed: true, duration: "20 min", videoId: "8hly31xKli0" },
        { id: 6, title: "Applications of Stacks & Queues", completed: false, duration: "25 min", videoId: "8hly31xKli0" },
      ]
    },
    {
      id: 3,
      title: "Trees and Graphs",
      topics: [
        { id: 7, title: "Binary Trees", completed: false, duration: "30 min", videoId: "8hly31xKli0" },
        { id: 8, title: "Binary Search Trees", completed: false, duration: "25 min", videoId: "8hly31xKli0" },
        { id: 9, title: "Graph Basics", completed: false, duration: "35 min", videoId: "8hly31xKli0" },
      ]
    },
  ]
};

export default function CourseDetail() {
  const { id } = useParams();
  const [selectedTopic, setSelectedTopic] = useState(courseData.units[0].topics[0]);
  const [openUnits, setOpenUnits] = useState<number[]>([1]);

  const toggleUnit = (unitId: number) => {
    setOpenUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const totalTopics = courseData.units.reduce((acc, unit) => acc + unit.topics.length, 0);
  const completedTopics = courseData.units.reduce(
    (acc, unit) => acc + unit.topics.filter(t => t.completed).length, 
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{courseData.title}</h1>
          <p className="text-muted-foreground">{courseData.description}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{completedTopics}/{totalTopics} Topics</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
          <div className="flex-1">
            <Progress value={courseData.progress} className="h-3" />
          </div>
          <p className="text-lg font-bold text-primary">{courseData.progress}%</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video & Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="aspect-video bg-foreground/5">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${selectedTopic.videoId}`}
                title={selectedTopic.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">{selectedTopic.title}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedTopic.duration}
                </span>
                {selectedTopic.completed && (
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs for Content */}
          <Tabs defaultValue="overview" className="bg-card border border-border rounded-xl">
            <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0">
              <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Overview
              </TabsTrigger>
              <TabsTrigger value="resources" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Resources
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Notes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="p-6">
              <h3 className="font-semibold text-foreground mb-3">About This Topic</h3>
              <p className="text-muted-foreground">
                Learn the fundamentals of {selectedTopic.title.toLowerCase()}. This lesson covers 
                key concepts, practical examples, and best practices to help you master this topic.
              </p>
            </TabsContent>
            <TabsContent value="resources" className="p-6">
              <p className="text-muted-foreground">Additional learning resources will appear here.</p>
            </TabsContent>
            <TabsContent value="notes" className="p-6">
              <p className="text-muted-foreground">Take notes as you learn. Your notes will be saved automatically.</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Course Content */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Course Content</h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {courseData.units.map((unit) => (
              <Collapsible 
                key={unit.id} 
                open={openUnits.includes(unit.id)}
                onOpenChange={() => toggleUnit(unit.id)}
              >
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between bg-muted/50 border-b border-border hover:bg-muted transition-colors">
                  <span className="font-medium text-foreground text-left">{unit.title}</span>
                  {openUnits.includes(unit.id) ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {unit.topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`w-full p-4 flex items-center gap-3 border-b border-border hover:bg-accent/50 transition-colors text-left ${
                        selectedTopic.id === topic.id ? "bg-accent" : ""
                      }`}
                    >
                      {topic.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      ) : selectedTopic.id === topic.id ? (
                        <PlayCircle className="w-5 h-5 text-primary shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${
                          selectedTopic.id === topic.id ? "text-primary font-medium" : "text-foreground"
                        }`}>
                          {topic.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{topic.duration}</p>
                      </div>
                    </button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
