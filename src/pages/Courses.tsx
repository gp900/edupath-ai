import { useState, useEffect } from "react";
import { BookOpen, Clock, MoreVertical, Play, Target, Flame, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Subject {
  id: string;
  name: string;
  university: string | null;
  total_estimated_hours: number;
  created_at: string;
  progress: number;
  completedTopics: number;
  totalTopics: number;
  highPriorityPending: number;
}

export default function Courses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSubjects = async () => {
      try {
        // Fetch subjects with their learning plans
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select(`
            id,
            name,
            university,
            total_estimated_hours,
            created_at,
            learning_plans (plan_data)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (subjectsError) throw subjectsError;

        // Fetch topic progress for all subjects
        const { data: progressData, error: progressError } = await supabase
          .from('topic_progress')
          .select('subject_id, topic_id, completed')
          .eq('user_id', user.id)
          .eq('completed', true);

        if (progressError) throw progressError;

        // Calculate progress for each subject
        const subjectsWithProgress = subjectsData?.map(subject => {
          const plan = subject.learning_plans?.[0]?.plan_data as any;
          const units = plan?.units || [];
          
          let totalTopics = 0;
          let highPriorityCount = 0;
          
          units.forEach((unit: any) => {
            totalTopics += unit.topics?.length || 0;
            unit.topics?.forEach((topic: any) => {
              if (topic.importance === 'high') highPriorityCount++;
            });
          });

          const completedTopicIds = progressData
            ?.filter(p => p.subject_id === subject.id)
            .map(p => p.topic_id) || [];
          
          const completedTopics = completedTopicIds.length;
          const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
          
          // Count high priority pending
          let highPriorityPending = 0;
          units.forEach((unit: any) => {
            unit.topics?.forEach((topic: any) => {
              if (topic.importance === 'high' && !completedTopicIds.includes(topic.id)) {
                highPriorityPending++;
              }
            });
          });

          return {
            id: subject.id,
            name: subject.name,
            university: subject.university,
            total_estimated_hours: subject.total_estimated_hours,
            created_at: subject.created_at,
            progress,
            completedTopics,
            totalTopics,
            highPriorityPending
          };
        }) || [];

        setSubjects(subjectsWithProgress);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast({
          title: "Error",
          description: "Failed to load subjects.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [user, toast]);

  const handleDelete = async (subjectId: string) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setSubjects(prev => prev.filter(s => s.id !== subjectId));
      toast({
        title: "Subject deleted",
        description: "The subject and its learning plan have been removed.",
      });
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast({
        title: "Error",
        description: "Failed to delete subject.",
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
                      {subject.name}
                    </h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleDelete(subject.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Subject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {subject.university && (
                    <Badge variant="outline">{subject.university}</Badge>
                  )}
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {subject.completedTopics}/{subject.totalTopics} topics
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {subject.total_estimated_hours} hours
                  </span>
                  {subject.highPriorityPending > 0 && (
                    <span className="flex items-center gap-1 text-destructive">
                      <Flame className="w-4 h-4" />
                      {subject.highPriorityPending} high-priority pending
                    </span>
                  )}
                  {subject.progress === 100 && (
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
