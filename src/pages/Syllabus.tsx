import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, FileText, Loader2, GraduationCap, Target, BookOpen, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Syllabus() {
  const [subjectName, setSubjectName] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!subjectName.trim() || !syllabus.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter subject name and paste your university syllabus.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-learning-plan', {
        body: { subjectName, universityName, syllabus }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Store the learning plan in sessionStorage for the learning plan page
      sessionStorage.setItem('generatedLearningPlan', JSON.stringify(data.learningPlan));
      
      toast({
        title: "Learning Plan Generated!",
        description: "Your exam-oriented study roadmap is ready.",
      });
      
      navigate("/dashboard/learning-plan/generated");
    } catch (error) {
      console.error("Error generating learning plan:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate learning plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Target className="w-4 h-4" />
          Curriculum Mapping & Exam Preparation
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Transform Your Syllabus Into an
          <span className="text-primary"> Exam-Ready Study Plan</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Paste your official university curriculum below and let our AI create a personalized, 
          outcome-based learning path designed to maximize your academic performance.
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">Avoid Backlogs & ATKT</p>
          <p className="text-sm text-muted-foreground">
            Our AI analyzes your syllabus to identify high-weightage topics, previous year patterns, 
            and creates a strategic study schedule to ensure exam readiness.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 space-y-6 shadow-lg">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="subjectName" className="text-foreground font-medium">
              Subject / Course Name *
            </Label>
            <Input
              id="subjectName"
              placeholder="e.g., Data Structures and Algorithms"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="text-lg h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="universityName" className="text-foreground font-medium">
              University / College Name
            </Label>
            <Input
              id="universityName"
              placeholder="e.g., Mumbai University"
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              className="text-lg h-12"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="syllabus" className="text-foreground font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Paste Your University Syllabus / Curriculum *
          </Label>
          <Textarea
            id="syllabus"
            placeholder={`Paste your official university syllabus here...

Example Format:

UNIT I: Introduction to Data Structures (8 hours)
1.1 Abstract Data Types
1.2 Arrays and Array Operations
1.3 Time and Space Complexity Analysis

UNIT II: Linear Data Structures (10 hours)
2.1 Stacks - Implementation and Applications
2.2 Queues - Types and Applications
2.3 Linked Lists - Singly, Doubly, Circular

UNIT III: Non-Linear Data Structures (12 hours)
3.1 Trees - Binary Trees, BST, AVL Trees
3.2 Graphs - Representation and Traversals
3.3 Hashing Techniques

[Include unit names, topics, subtopics, and credit hours if available]`}
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            className="min-h-[350px] resize-none font-mono text-sm border-2 focus:border-primary"
          />
          <p className="text-sm text-muted-foreground">
            💡 Tip: Include unit names, topic lists, credit hours, and any learning objectives from your official curriculum document.
          </p>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleGenerate}
            disabled={loading}
            size="xl"
            variant="hero"
            className="w-full gap-3 text-lg h-14"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Analyzing Curriculum & Generating Study Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate Exam-Oriented Learning Plan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* What You Get Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Unit-wise Breakdown</h3>
          <p className="text-sm text-muted-foreground">
            Structured study plan aligned with your university curriculum mapping
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Exam Importance Tags</h3>
          <p className="text-sm text-muted-foreground">
            Topics marked by exam weightage - High, Medium, Low priority indicators
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">PYQ-Based Practice</h3>
          <p className="text-sm text-muted-foreground">
            Previous year question patterns and exam-style practice materials
          </p>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-accent/50 border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Tips for Best Results</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Copy the syllabus directly from your university's official curriculum document</li>
              <li>• Include unit numbers, topic names, and sub-topics for accurate curriculum mapping</li>
              <li>• Add credit hours or lecture hours if mentioned for realistic time estimation</li>
              <li>• Include any course outcomes or learning objectives for outcome-based learning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
