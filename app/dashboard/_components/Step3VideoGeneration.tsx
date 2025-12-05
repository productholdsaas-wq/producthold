"use client";

import { useState } from "react";
import { ChevronLeft, Loader2, Sparkles } from "lucide-react";

interface Step3Props {
  taskRecordId: string;
  selectedImageId: string;
  selectedImageUrl: string;
  onComplete: (data: { videoRecordId: string; finishedVideoUrl: string }) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

// Mock voices - in production, fetch from TopView
const mockVoices = [
  { id: "voice1", name: "Sarah - American Female", accent: "US" },
  { id: "voice2", name: "James - British Male", accent: "UK" },
  { id: "voice3", name: "Emma - Australian Female", accent: "AU" },
];

export default function Step3VideoGeneration({
  taskRecordId,
  selectedImageId,
  selectedImageUrl,
  onComplete,
  onError,
  onBack,
}: Step3Props) {
  const [script, setScript] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(mockVoices[0].id);
  const [mode, setMode] = useState<"pro" | "standard">("pro");
  const [processing, setProcessing] = useState(false);
  const [videoRecordId, setVideoRecordId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!script.trim()) {
      onError("Please enter a script");
      return;
    }

    if (script.length < 10) {
      onError("Script must be at least 10 characters");
      return;
    }

    setProcessing(true);
    onError("");

    try {
      const response = await fetch("/api/topview/generate-video/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskRecordId,
          selectedImageId,
          script,
          voiceId: selectedVoice,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error("Insufficient credits. Please upgrade your plan.");
        }
        throw new Error(data.error || "Failed to start video generation");
      }

      setVideoRecordId(data.videoRecordId);

      // Poll for completion
      pollForVideo(data.videoRecordId);
    } catch (error) {
      setProcessing(false);
      onError(error instanceof Error ? error.message : "Failed to generate video");
    }
  };

  const pollForVideo = async (recordId: string) => {
    const maxAttempts = 180; // 6 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/topview/generate-video/status?videoRecordId=${recordId}`
        );
        const data = await response.json();

        if (data.status === "success" && data.finishedVideoUrl) {
          setProcessing(false);
          onComplete({
            videoRecordId: recordId,
            finishedVideoUrl: data.finishedVideoUrl,
          });
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setProcessing(false);
          onError("Video generation timed out. Please try again.");
        }
      } catch (error) {
        setProcessing(false);
        onError("Failed to check video status.");
      }
    };

    poll();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
          disabled={processing}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Generate Video</h2>
          <p className="text-muted-foreground">
            Add your script and choose a voice
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Selected Image Preview */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">
            Selected Image:
          </h3>
          <img
            src={selectedImageUrl}
            alt="Selected"
            className="w-full rounded-xl border border-border"
          />
        </div>

        {/* Right: Script and Options */}
        <div className="space-y-6">
          {/* Script Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Video Script *
            </label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Enter your video script here..."
              className="w-full h-32 px-4 py-3 bg-sidebar border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:outline-none resize-none"
              disabled={processing}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {script.length} / 500 characters
            </p>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Voice
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-4 py-3 bg-sidebar border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none"
              disabled={processing}
            >
              {mockVoices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Quality Mode
            </label>
            <div className="flex gap-3">
              {(["standard", "pro"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  disabled={processing}
                  className={`
                    flex-1 px-4 py-3 rounded-lg font-medium transition-all
                    ${
                      mode === m
                        ? "bg-brand-primary text-white"
                        : "bg-sidebar border border-border text-foreground hover:border-brand-primary/50"
                    }
                  `}
                >
                  {m === "pro" ? "Pro" : "Standard"}
                </button>
              ))}
            </div>
          </div>

          {/* Credit Cost */}
          <div className="p-4 bg-sidebar-accent border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credit Cost:</span>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                <span className="font-semibold text-foreground">1 Credit</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!script.trim() || processing}
            className="w-full px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing && <Loader2 className="w-5 h-5 animate-spin" />}
            {processing ? "Generating Video..." : "Generate Video"}
          </button>

          {processing && (
            <p className="text-xs text-center text-muted-foreground">
              This may take 2-3 minutes. Please do not close this page.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
