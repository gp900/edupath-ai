import { Award, Download, Share2, Calendar, GraduationCap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const certificates = [
  {
    id: 1,
    title: "Data Structures & Algorithms",
    university: "Mumbai University",
    completedDate: "Dec 15, 2024",
    credentialId: "CERT-DSA-2024-001",
    examReadiness: "92%",
    hours: 40
  },
  {
    id: 2,
    title: "Database Management Systems",
    university: "Mumbai University",
    completedDate: "Nov 28, 2024",
    credentialId: "CERT-DBMS-2024-042",
    examReadiness: "88%",
    hours: 35
  },
];

export default function Certificates() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Completion Certificates</h1>
        <p className="text-muted-foreground">Your academic achievements and course completion credentials</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{certificates.length}</p>
              <p className="text-sm text-muted-foreground">Certificates Earned</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">75</p>
              <p className="text-sm text-muted-foreground">Study Hours</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">90%</p>
              <p className="text-sm text-muted-foreground">Avg. Exam Readiness</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div 
            key={cert.id}
            className="bg-card border-2 border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all"
          >
            {/* Certificate Preview */}
            <div className="bg-gradient-to-br from-primary/5 via-accent to-primary/10 p-8">
              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="text-center">
                  <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-10 h-10 text-warning" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Certificate of Academic Completion
                  </p>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{cert.university}</p>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>Exam Readiness: <strong className="text-success">{cert.examReadiness}</strong></span>
                    <span>•</span>
                    <span>{cert.hours} hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Info */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Completed on</p>
                  <p className="font-medium text-foreground">{cert.completedDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Credential ID</p>
                  <p className="font-mono text-sm text-foreground">{cert.credentialId}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {certificates.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No certificates yet</h3>
          <p className="text-muted-foreground mb-6">
            Complete a subject's learning plan to earn your first certificate
          </p>
          <Link to="/dashboard/subjects">
            <Button>View My Subjects</Button>
          </Link>
        </div>
      )}

      {/* Earn More Section */}
      <div className="bg-accent/50 border border-border rounded-xl p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <Award className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Continue Your Academic Journey
            </h3>
            <p className="text-muted-foreground">
              Complete more subjects to earn certificates and demonstrate your exam readiness.
            </p>
          </div>
          <Link to="/dashboard/subjects">
            <Button size="lg">View Active Subjects</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
