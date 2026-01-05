import { useState, useEffect } from "react";
import { BookOpen, Target, Clock, Flame, TrendingUp, CheckCircle2, Loader2, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalSubjects: number;
  completedTopics: number;
  totalTopics: number;
  totalHours: number;
  highPriorityPending: number;
  recentSubjects: { id: string; name: string; progress: number }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch subjects with learning plans
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select(`
            id,
            name,
            total_estimated_hours,
            learning_plans (plan_data)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (subjectsError) throw subjectsError;

        // Fetch all topic progress
        const { data: progressData, error: progressError } = await supabase
          .from('topic_progress')
          .select('subject_id, topic_id')
          .eq('user_id', user.id)
          .eq('completed', true);

        if (progressError) throw progressError;

        // Calculate stats
        let totalTopics = 0;
        let totalHours = 0;
        let highPriorityPending = 0;
        const completedTopicIds = new Set(progressData?.map(p => p.topic_id) || []);

        subjectsData?.forEach(subject => {
          totalHours += subject.total_estimated_hours || 0;
          const plan = subject.learning_plans?.[0]?.plan_data as any;
          const units = plan?.units || [];
          
          units.forEach((unit: any) => {
            unit.topics?.forEach((topic: any) => {
              totalTopics++;
              if (topic.importance === 'high' && !completedTopicIds.has(topic.id)) {
                highPriorityPending++;
              }
            });
          });
        });

        // Calculate progress per subject
        const recentSubjects = subjectsData?.map(subject => {
          const plan = subject.learning_plans?.[0]?.plan_data as any;
          const units = plan?.units || [];
          let subjectTotalTopics = 0;
          let subjectCompletedTopics = 0;

          units.forEach((unit: any) => {
            unit.topics?.forEach((topic: any) => {
              subjectTotalTopics++;
              if (completedTopicIds.has(topic.id)) {
                subjectCompletedTopics++;
              }
            });
          });

          return {
            id: subject.id,
            name: subject.name,
            progress: subjectTotalTopics > 0 ? Math.round((subjectCompletedTopics / subjectTotalTopics) * 100) : 0
          };
        }) || [];

        setStats({
          totalSubjects: subjectsData?.length || 0,
          completedTopics: completedTopicIds.size,
          totalTopics,
          totalHours,
          highPriorityPending,
          recentSubjects
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const overallProgress = stats && stats.totalTopics > 0 
    ? Math.round((stats.completedTopics / stats.totalTopics) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Academic Dashboard</h1>
          <p className="text-muted-foreground">Track your exam readiness and academic performance</p>
        </div>
        <Link to="/dashboard/syllabus">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Subject
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.totalSubjects || 0}</p>
              <p className="text-sm text-muted-foreground">Subjects</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats?.completedTopics || 0}/{stats?.totalTopics || 0}
              </p>
              <p className="text-sm text-muted-foreground">Topics Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.totalHours || 0}h</p>
              <p className="text-sm text-muted-foreground">Total Study Time</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.highPriorityPending || 0}</p>
              <p className="text-sm text-muted-foreground">High Priority Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Overall Exam Readiness</h3>
              <p className="text-sm text-muted-foreground">Across all subjects</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
      </div>

      {/* Recent Subjects */}
      {stats && stats.recentSubjects.length > 0 ? (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Your Subjects
            </h3>
            <Link to="/dashboard/subjects">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentSubjects.map((subject) => (
              <Link 
                key={subject.id}
                to={`/dashboard/learning-plan/${subject.id}`}
                className="flex items-center justify-between p-4 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{subject.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={subject.progress} className="w-24 h-2" />
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {subject.progress}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Get Started</h3>
          <p className="text-muted-foreground mb-6">
            Add your first subject by pasting your university syllabus
          </p>
          <Link to="/dashboard/syllabus">
            <Button>Paste Your Syllabus</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
