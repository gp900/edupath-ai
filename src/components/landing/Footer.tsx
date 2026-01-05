import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold">ExamPath</span>
              <p className="text-xs opacity-60">Avoid Backlogs</p>
            </div>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-8 text-sm">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/auth" className="hover:text-primary transition-colors">Login</Link>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          </nav>
          
          <p className="text-sm opacity-60">
            © {new Date().getFullYear()} ExamPath. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
