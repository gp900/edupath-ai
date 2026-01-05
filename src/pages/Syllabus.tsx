import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Syllabus() {
  const [courseName, setCourseName] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!courseName.trim() || !syllabus.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both a course name and syllabus content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate AI processing (will be replaced with actual AI call)
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Coming soon!",
        description: "AI course generation will be available soon. Stay tuned!",
      });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Create New Course</h1>
        <p className="text-muted-foreground">
          Paste your university syllabus and let AI generate a structured learning roadmap.
        </p>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="courseName" className="text-foreground">Course Name</Label>
          <Input
            id="courseName"
            placeholder="e.g., Introduction to Computer Science"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="syllabus" className="text-foreground">
            Paste Your Syllabus
          </Label>
          <Textarea
            id="syllabus"
            placeholder={`Paste your course curriculum here...

Example:
Unit 1: Introduction to Programming
- Variables and Data Types
- Control Structures
- Functions and Modules

Unit 2: Object-Oriented Programming
- Classes and Objects
- Inheritance
- Polymorphism
...`}
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            className="min-h-[300px] resize-none font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Include unit names, topic lists, and any additional course details for best results.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleGenerate}
            disabled={loading}
            size="lg"
            className="gap-2 flex-1 sm:flex-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Roadmap...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Learning Roadmap
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-accent/50 border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Tips for Best Results</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Include clear unit and topic names from your official syllabus</li>
              <li>• Add any learning objectives or outcomes if available</li>
              <li>• Mention recommended books or resources for better video suggestions</li>
              <li>• Include the number of credits or expected study hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
