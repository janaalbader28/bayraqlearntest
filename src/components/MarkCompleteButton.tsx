"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function MarkCompleteButton({ lessonId }: { lessonId: number }) {
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/courses/progress", {
                method: "POST",
                body: JSON.stringify({ lessonId, isCompleted: !completed }),
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                setCompleted(!completed);
            }
        } catch (error) {
            console.error("Failed to update progress", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`px-6 py-2 glass-card transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${completed ? "bg-accent/20 border-accent text-accent" : "hover:bg-white/5 border-white/10 text-white/60"
                }`}
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                    {completed ? "Completed" : "Mark Complete"}
                    {completed && <CheckCircle2 className="w-4 h-4" />}
                </>
            )}
        </button>
    );
}
