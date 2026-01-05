import { useState, useEffect } from "react";
import { 
  BookOpen, Clock, Target, CheckCircle2, Circle, 
  ChevronDown, ChevronRight, Play, FileText, Video,
  AlertTriangle, Flame, Minus, ArrowLeft, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [planData, setPlanData] = useState<LearningPlanData | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    
    const fetchLearningPlan = async () => {
      setLoading(true);
      try {
        // Fetch learning plan from database
        const { data: planResult, error: planError } = await supabase
          .from('learning_plans')
          .select('*, subjects(*)')
          .eq('subject_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (planError) throw planError;

        if (!planResult) {
          navigate("/dashboard/syllabus");
          return;
        }

        setSubjectId(id);
        const planDataParsed = planResult.plan_data as unknown as LearningPlanData;
        setPlanData(planDataParsed);
        
        // Expand first unit by default
        const units = planDataParsed.units;
        if (units?.length > 0) {
          setExpandedUnits([units[0].id]);
        }

        // Fetch topic progress
        const { data: progressData, error: progressError } = await supabase
          .from('topic_progress')
          .select('topic_id')
          .eq('subject_id', id)
          .eq('user_id', user.id)
          .eq('completed', true);

        if (progressError) throw progressError;

        const completedSet = new Set(progressData?.map(p => p.topic_id) || []);
        setCompletedTopics(completedSet);

      } catch (error) {
        console.error("Error fetching learning plan:", error);
        toast({
          title: "Error",
          description: "Failed to load learning plan.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLearningPlan();
  }, [id, user, navigate, toast]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const toggleTopicComplete = async (topicId: string) => {
    if (!user || !subjectId) return;

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
        // Delete progress
        await supabase
          .from('topic_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('subject_id', subjectId)
          .eq('topic_id', topicId);
      } else {
        // Upsert progress
        await supabase
          .from('topic_progress')
          .upsert({
            user_id: user.id,
            subject_id: subjectId,
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
          <h3 className="text-xl font-semibold text-foreground mb-2">No Learning Plan Found</h3>
          <p className="text-muted-foreground mb-6">
            Generate a learning plan from your syllabus to get started.
          </p>
          <Link to="/dashboard/syllabus">
            <Button>Paste Syllabus</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalTopics = planData.units.reduce((acc, unit) => acc + unit.topics.length, 0);
  const completedCount = completedTopics.size;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const highPriorityCount = planData.units.reduce(
    (acc, unit) => acc + unit.topics.filter(t => t.importance === "high").length,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to="/dashboard/subjects" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            My Subjects
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Learning Plan</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {planData.subjectName}
        </h1>
        <p className="text-muted-foreground">
          Personalized Learning Path {planData.universityName && `• ${planData.universityName} Curriculum`}
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
              <p className="text-2xl font-bold text-foreground">{completedCount}/{totalTopics}</p>
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
              <p className="text-2xl font-bold text-foreground">{planData.totalEstimatedHours}h</p>
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
        {planData.units.map((unit) => {
          const unitCompletedCount = unit.topics.filter(t => completedTopics.has(t.id)).length;
          const unitProgress = unit.topics.length > 0 ? Math.round((unitCompletedCount / unit.topics.length) * 100) : 0;
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
                    <span>{unitCompletedCount}/{unit.topics.length} completed</span>
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
                  {unit.topics.map((topic, index) => {
                    const isCompleted = completedTopics.has(topic.id);
                    
                    return (
                      <div 
                        key={topic.id}
                        className={`flex items-center gap-4 p-4 pl-8 hover:bg-accent/30 transition-colors ${
                          index !== unit.topics.length - 1 ? "border-b border-border/50" : ""
                        }`}
                      >
                        {/* Completion Status */}
                        <button 
                          onClick={() => toggleTopicComplete(topic.id)}
                          className="shrink-0"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-success" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>

                        {/* Topic Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
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
                        <Link to={`/dashboard/courses/${subjectId}?topic=${topic.id}`}>
                          <Button 
                            size="sm" 
                            variant={isCompleted ? "outline" : "default"}
                            className="gap-1"
                          >
                            <Play className="w-4 h-4" />
                            {isCompleted ? "Review" : "Start"}
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
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
