import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  PlayCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Flame,
  AlertTriangle,
  Minus,
  Loader2,
  FileText,
  Youtube,
  ExternalLink,
  Save,
  PenLine
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface VideoRecommendation {
  title: string;
  searchQuery: string;
  description: string;
  embedUrl?: string;
  videoId?: string;
}

type ImportanceLevel = "high" | "medium" | "low";

interface Topic {
  id: string;
  name: string;
  duration: string;
  importance: ImportanceLevel;
  hasVideo: boolean;
  hasPractice: boolean;
}

interface Unit {
  id: string;
  name: string;
  topics: Topic[];
  estimatedHours: number;
}

interface LearningPlanData {
  subjectName: string;
  universityName: string;
  totalEstimatedHours: number;
  units: Unit[];
}

const getImportanceBadge = (importance: ImportanceLevel) => {
  switch (importance) {
    case "high":
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
          <Flame className="w-3 h-3" />
          High
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

export default function CourseDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [planData, setPlanData] = useState<LearningPlanData | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [openUnits, setOpenUnits] = useState<string[]>([]);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [topicNotes, setTopicNotes] = useState<Record<string, string>>({});
  const [currentNote, setCurrentNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [videoRecommendations, setVideoRecommendations] = useState<VideoRecommendation[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch learning plan
        const { data: planResult, error: planError } = await supabase
          .from('learning_plans')
          .select('*, subjects(*)')
          .eq('subject_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (planError) throw planError;

        if (!planResult) {
          toast({
            title: "Not found",
            description: "Learning plan not found.",
            variant: "destructive",
          });
          return;
        }

        const planDataParsed = planResult.plan_data as unknown as LearningPlanData;
        setPlanData(planDataParsed);

        // Open first unit and select topic from URL or first topic
        if (planDataParsed.units?.length > 0) {
          const topicIdFromUrl = searchParams.get('topic');
          let foundTopic: Topic | null = null;
          let foundUnitId: string | null = null;

          // Find topic from URL param
          if (topicIdFromUrl) {
            for (const unit of planDataParsed.units) {
              const topic = unit.topics.find(t => t.id === topicIdFromUrl);
              if (topic) {
                foundTopic = topic;
                foundUnitId = unit.id;
                break;
              }
            }
          }

          // Default to first topic
          if (!foundTopic && planDataParsed.units[0].topics.length > 0) {
            foundTopic = planDataParsed.units[0].topics[0];
            foundUnitId = planDataParsed.units[0].id;
          }

          if (foundTopic) setSelectedTopic(foundTopic);
          if (foundUnitId) setOpenUnits([foundUnitId]);
        }

        // Fetch topic progress with notes
        const { data: progressData, error: progressError } = await supabase
          .from('topic_progress')
          .select('topic_id, completed, notes')
          .eq('subject_id', id)
          .eq('user_id', user.id);

        if (progressError) throw progressError;
        setCompletedTopics(new Set(progressData?.filter(p => p.completed).map(p => p.topic_id) || []));
        
        // Build notes map
        const notesMap: Record<string, string> = {};
        progressData?.forEach(p => {
          if ((p as any).notes) {
            notesMap[(p as any).topic_id] = (p as any).notes;
          }
        });
        setTopicNotes(notesMap);

      } catch (error) {
        console.error("Error fetching course data:", error);
        toast({
          title: "Error",
          description: "Failed to load course data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, searchParams, toast]);

  const toggleUnit = (unitId: string) => {
    setOpenUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(uid => uid !== unitId)
        : [...prev, unitId]
    );
  };

  const toggleTopicComplete = async (topicId: string) => {
    if (!user || !id) return;

    const isCurrentlyCompleted = completedTopics.has(topicId);

    // Optimistic update
    setCompletedTopics(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyCompleted) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });

    try {
      if (isCurrentlyCompleted) {
        await supabase
          .from('topic_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('subject_id', id)
          .eq('topic_id', topicId);
      } else {
        await supabase
          .from('topic_progress')
          .upsert({
            user_id: user.id,
            subject_id: id,
            topic_id: topicId,
            completed: true,
            completed_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,subject_id,topic_id'
          });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      // Revert on error
      setCompletedTopics(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyCompleted) {
          newSet.add(topicId);
        } else {
          newSet.delete(topicId);
        }
        return newSet;
      });
      toast({
        title: "Error",
        description: "Failed to update progress.",
        variant: "destructive",
      });
    }
  };

  // Load note when topic changes
  useEffect(() => {
    if (selectedTopic) {
      setCurrentNote(topicNotes[selectedTopic.id] || "");
    }
  }, [selectedTopic, topicNotes]);

  // Fetch video recommendations when topic changes
  useEffect(() => {
    if (!selectedTopic || !planData) return;
    
    const fetchVideos = async () => {
      setLoadingVideos(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-video-recommendations', {
          body: { topicName: selectedTopic.name, subjectName: planData.subjectName }
        });
        
        if (error) throw error;
        if (data?.recommendations) {
          setVideoRecommendations(data.recommendations);
        }
      } catch (error) {
        console.error("Error fetching video recommendations:", error);
        // Fallback recommendations
        setVideoRecommendations([
          { title: "Lecture", searchQuery: `${selectedTopic.name} ${planData.subjectName} lecture`, description: "University lecture" },
          { title: "Tutorial", searchQuery: `${selectedTopic.name} tutorial explained`, description: "Step-by-step tutorial" },
          { title: "Examples", searchQuery: `${selectedTopic.name} solved examples`, description: "Practice problems" }
        ]);
      } finally {
        setLoadingVideos(false);
      }
    };
    
    fetchVideos();
  }, [selectedTopic?.id, planData?.subjectName]);

  const saveNote = async () => {
    if (!user || !id || !selectedTopic) return;
    
    setSavingNote(true);
    try {
      await supabase
        .from('topic_progress')
        .upsert({
          user_id: user.id,
          subject_id: id,
          topic_id: selectedTopic.id,
          notes: currentNote,
          completed: completedTopics.has(selectedTopic.id)
        }, {
          onConflict: 'user_id,subject_id,topic_id'
        });
      
      setTopicNotes(prev => ({ ...prev, [selectedTopic.id]: currentNote }));
      toast({
        title: "Saved",
        description: "Your notes have been saved.",
      });
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save notes.",
        variant: "destructive",
      });
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Course Not Found</h3>
          <p className="text-muted-foreground mb-6">
            This course doesn't exist or you don't have access.
          </p>
          <Link to="/dashboard/subjects">
            <Button>Back to Subjects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalTopics = planData.units.reduce((acc, unit) => acc + unit.topics.length, 0);
  const completedCount = completedTopics.size;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/dashboard/learning-plan/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{planData.subjectName}</h1>
          <p className="text-muted-foreground">
            {planData.universityName && `${planData.universityName} • `}
            {planData.units.length} Units • {totalTopics} Topics
          </p>
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
              <p className="font-semibold text-foreground">{completedCount}/{totalTopics} Topics</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
          <div className="flex-1">
            <Progress value={progressPercent} className="h-3" />
          </div>
          <p className="text-lg font-bold text-primary">{progressPercent}%</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTopic ? (
            <>
              {/* Topic Details */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">{selectedTopic.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selectedTopic.duration}
                      </span>
                      {getImportanceBadge(selectedTopic.importance)}
                    </div>
                  </div>
                  <Button 
                    onClick={() => toggleTopicComplete(selectedTopic.id)}
                    variant={completedTopics.has(selectedTopic.id) ? "outline" : "default"}
                  >
                    {completedTopics.has(selectedTopic.id) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      "Mark Complete"
                    )}
                  </Button>
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
                  <p className="text-muted-foreground mb-4">
                    Study {selectedTopic.name} thoroughly. This is a{" "}
                    <span className={
                      selectedTopic.importance === "high" ? "text-destructive font-medium" :
                      selectedTopic.importance === "medium" ? "text-warning font-medium" : "text-muted-foreground"
                    }>
                      {selectedTopic.importance} priority
                    </span>{" "}
                    topic for your exams.
                  </p>
                  <div className="flex gap-2">
                    {selectedTopic.hasVideo && (
                      <Badge variant="outline" className="gap-1">
                        <PlayCircle className="w-3 h-3" />
                        Video Available
                      </Badge>
                    )}
                    {selectedTopic.hasPractice && (
                      <Badge variant="outline" className="gap-1">
                        <FileText className="w-3 h-3" />
                        Practice Problems
                      </Badge>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="resources" className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Youtube className="w-5 h-5 text-destructive" />
                      YouTube Videos
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI-verified embeddable educational videos for this topic.
                    </p>
                  </div>
                  
                  {/* Video Content */}
                  {loadingVideos ? (
                    <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-sm">Finding verified playable videos...</span>
                      </div>
                    </div>
                  ) : videoRecommendations.length > 0 && videoRecommendations[0].embedUrl ? (
                    <>
                      {/* Verified Embedded YouTube Video */}
                      <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                        <iframe
                          src={videoRecommendations[0].embedUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={videoRecommendations[0].title || `Video for ${selectedTopic.name}`}
                        />
                      </div>
                      
                      {/* Video Info */}
                      <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                        <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                          <Youtube className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {videoRecommendations[0].title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ✓ Verified embeddable • Educational content
                          </p>
                        </div>
                        <a
                          href={`https://www.youtube.com/watch?v=${videoRecommendations[0].videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-background rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      </div>
                    </>
                  ) : (
                    /* No verified video available */
                    <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground text-center p-6">
                        <Youtube className="w-12 h-12 opacity-30" />
                        <div>
                          <p className="font-medium">No playable video available</p>
                          <p className="text-sm mt-1">
                            We couldn't find a verified embeddable video for this topic.
                          </p>
                        </div>
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedTopic.name + " " + planData.subjectName + " lecture tutorial")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline mt-2"
                        >
                          <span>Search on YouTube</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="notes" className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <PenLine className="w-5 h-5" />
                      Your Notes
                    </h3>
                    <Button 
                      onClick={saveNote} 
                      size="sm" 
                      disabled={savingNote}
                    >
                      {savingNote ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Write your study notes here... Include key points, formulas, and concepts to remember."
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    className="min-h-[300px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Notes are saved per topic and will be available when you return.
                  </p>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Select a topic from the sidebar to start studying</p>
            </div>
          )}
        </div>

        {/* Sidebar - Course Content */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Course Content</h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {planData.units.map((unit) => (
              <Collapsible 
                key={unit.id} 
                open={openUnits.includes(unit.id)}
                onOpenChange={() => toggleUnit(unit.id)}
              >
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between bg-muted/50 border-b border-border hover:bg-muted transition-colors">
                  <span className="font-medium text-foreground text-left text-sm">{unit.name}</span>
                  {openUnits.includes(unit.id) ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {unit.topics.map((topic) => {
                    const isCompleted = completedTopics.has(topic.id);
                    const isSelected = selectedTopic?.id === topic.id;
                    
                    return (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic)}
                        className={`w-full p-4 flex items-center gap-3 border-b border-border hover:bg-accent/50 transition-colors text-left ${
                          isSelected ? "bg-accent" : ""
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                        ) : isSelected ? (
                          <PlayCircle className="w-5 h-5 text-primary shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${
                            isSelected ? "text-primary font-medium" : "text-foreground"
                          }`}>
                            {topic.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{topic.duration}</p>
                        </div>
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
