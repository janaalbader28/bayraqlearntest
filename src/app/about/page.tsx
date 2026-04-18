import Link from "next/link";
import { GraduationCap, BookOpen, Users, Award, ChevronLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="mesh-gradient cyber-grid min-h-screen p-6 md:p-20">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-12 inline-flex items-center gap-2 text-sm text-accent transition-all hover:gap-3"
        >
          <ChevronLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="glass-card border-accent/20 p-10">
          <div className="mb-8 flex items-center gap-4">
            <GraduationCap className="h-12 w-12 text-accent" />
            <h1 className="font-heading text-4xl font-bold">
              About <span className="text-accent">BayraqLearn</span>
            </h1>
          </div>

          <p className="mb-10 text-xl italic leading-relaxed text-slate-700">
            BayraqLearn exists to make structured, high-quality learning accessible—so you can
            build real skills with clarity, support, and courses designed around outcomes.
          </p>

          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                <Users className="h-5 w-5 text-accent" /> Our mission
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Help learners progress with confidence through thoughtful instruction, practical
                projects, and a community that values growth over hype.
              </p>
            </div>
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                <Award className="h-5 w-5 text-accent" /> Quality
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                We focus on clear syllabi, useful feedback, and material that stays relevant to
                how people learn and work today.
              </p>
            </div>
          </div>

          <div className="mt-20 rounded-xl border border-accent/10 bg-accent/5 p-8 text-center">
            <h3 className="mb-2 text-lg font-bold uppercase tracking-widest">Start learning</h3>
            <p className="mb-8 text-xs text-slate-600">
              Create your account and explore courses at your own pace.
            </p>
            <Link href="/register" className="btn-primary inline-block px-10 py-3">
              Join BayraqLearn
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
