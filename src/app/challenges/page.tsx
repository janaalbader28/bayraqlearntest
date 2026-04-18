import Link from "next/link";
import { Terminal, ShieldAlert, Cpu, ChevronLeft, Lock } from "lucide-react";

export default function ChallengesPage() {
    return (
        <main className="min-h-screen mesh-gradient cyber-grid p-6 md:p-20">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-accent text-sm mb-12 hover:gap-3 transition-all">
                    <ChevronLeft className="w-4 h-4" /> Back to Terminal
                </Link>

                <div className="glass-card p-10 border-red-500/20 bg-red-500/5">
                    <div className="flex items-center gap-4 mb-4">
                        <Terminal className="w-12 h-12 text-red-500 animate-pulse" />
                        <h1 className="text-4xl font-bold font-heading">Tactical <span className="text-red-500">CTF</span> Environment</h1>
                    </div>
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-[0.3em] mb-10">Access Status: Restricted // Simulation Pending</div>

                    <div className="p-20 border border-dashed border-red-500/20 rounded-2xl flex flex-col items-center text-center">
                        <Lock className="w-20 h-20 text-red-500/20 mb-6" />
                        <h2 className="text-2xl font-bold mb-2">Area Locked</h2>
                        <p className="text-white/30 text-sm max-w-sm">
                            The Capture The Flag (CTF) challenges are currently in defensive configuration. Full deployment is scheduled for the next operation window.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mt-12">
                        {[
                            { title: "Binary Pwn", icon: Cpu },
                            { title: "Web Infiltration", icon: ShieldAlert },
                            { title: "Steganography", icon: Terminal }
                        ].map((c, i) => (
                            <div key={i} className="glass-card p-6 border-white/5 opacity-50 flex flex-col items-center">
                                <c.icon className="w-8 h-8 mb-4 text-white/20" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{c.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
