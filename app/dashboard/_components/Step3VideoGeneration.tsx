"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { useVideoCreator } from "../../context/VideoCreatorContext";
import { toast } from "sonner";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Voice {
  voiceId: string;
  voiceName: string;
  bestSupportLanguage?: string;
  accent?: string;
  gender?: string;
  style?: string;
}

interface CaptionStyle {
  captionId: string;
  thumbnail: string;
  name?: string;
}

const languageList = [
  "English",
  "Spanish",
  "French",
  "Italian",
  "Portuguese",
  "Dutch",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Russian",
  "Vietnamese",
  "Thai",
];

const MAX_CHARS = 2000;

export default function Step3VideoGeneration() {
  const {
    workflowData,
    setWorkflowData,
    previousStep,
    nextStep,
    setError,
    cachedResources,
    setCachedResources,
    isCacheValid,
  } = useVideoCreator();

  const taskRecordId = workflowData.taskRecordId!;
  const selectedImageId = workflowData.selectedImageId!;
  const selectedImageUrl = workflowData.selectedImageUrl!;

  const [saving, setSaving] = useState(false);
  const [allVoices, setAllVoices] = useState<Voice[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<Voice[]>([]);
  const [captionStyles, setCaptionStyles] = useState<CaptionStyle[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [loadingCaptionStyles, setLoadingCaptionStyles] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiDuration, setAiDuration] = useState("30-60s");
  const [isGenerating, setIsGenerating] = useState(false);
  const [maxDuration, setMaxDuration] = useState<number>(90);
  const captionScrollRef = useRef<HTMLDivElement>(null);

  // Scroll state for caption carousel
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Initialize form data with defaults
  const script = workflowData.script || "";
  const language = workflowData.language || "";
  const voiceId = workflowData.voiceId || "";
  const captionStyleId = workflowData.captionStyleId || "";
  const videoOrientation = workflowData.videoOrientation || "9:16";
  const videoLength = workflowData.videoLength || "15-30s";
  const mode = workflowData.mode || "pro";

  /* ------------------------------------------ */
  /*       FETCH PLAN LIMITS                    */
  /* ------------------------------------------ */
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await fetch("/api/user/plan");
        const planData = await response.json();

        const planLimits: Record<string, { maxDuration: number }> = {
          starter: { maxDuration: 30 },
          professional: { maxDuration: 60 },
          business: { maxDuration: 90 },
          scale: { maxDuration: 90 },
          none: { maxDuration: 30 },
        };

        const tier = planData.tier || "none";
        setMaxDuration(planLimits[tier]?.maxDuration || 30);
      } catch (error) {
        setMaxDuration(30);
      }
    };

    fetchUserPlan();
  }, []);

  /* ------------------------------------------ */
  /*         LOAD VOICES & CAPTION STYLES       */
  /* ------------------------------------------ */
  useEffect(() => {
    fetchVoices();
    fetchCaptionStyles();
  }, []);

  useEffect(() => {
    if (!language) {
      setFilteredVoices(allVoices);
      return;
    }

    const filtered = allVoices.filter(
      (v) => v.bestSupportLanguage?.toLowerCase() === language.toLowerCase()
    );

    setFilteredVoices(filtered);

    // Auto-select first available voice
    if (filtered.length > 0 && !voiceId) {
      setWorkflowData({ voiceId: filtered[0].voiceId });
    }
  }, [language, allVoices]);

  const fetchVoices = async () => {
    // Check if we have valid cached voices
    if (isCacheValid('voices')) {
      console.log('📦 Using cached voices');
      const cache = cachedResources.voices!;
      setAllVoices(cache.data);
      setFilteredVoices(cache.data);
      return;
    }

    // Fetch fresh data if cache is invalid or empty
    try {
      setLoadingVoices(true);
      console.log('🔄 Fetching fresh voices from API');
      const response = await fetch("/api/topview/voices-with-filters");
      const result = await response.json();

      if (result.success) {
        setAllVoices(result.voices);
        setFilteredVoices(result.voices);

        // Cache the results
        setCachedResources({
          voices: {
            data: result.voices,
            filters: result.filters,
            timestamp: Date.now(),
          },
        });
      }
    } catch (error) {
      toast.error("Failed to load voices");
    } finally {
      setLoadingVoices(false);
    }
  };

  const fetchCaptionStyles = async () => {
    // Check if we have valid cached caption styles
    if (isCacheValid('captionStyles')) {
      console.log('📦 Using cached caption styles');
      const cache = cachedResources.captionStyles!;
      setCaptionStyles(cache.data);
      // Auto-select first caption style if none selected
      if (cache.data.length > 0 && !captionStyleId) {
        setWorkflowData({ captionStyleId: cache.data[0].captionId });
      }
      return;
    }

    // Fetch fresh data if cache is invalid or empty
    try {
      setLoadingCaptionStyles(true);
      console.log('🔄 Fetching fresh caption styles from API');
      const response = await fetch("/api/topview/caption-styles");
      const result = await response.json();

      if (result.success) {
        setCaptionStyles(result.captionStyles);
        // Auto-select first caption style if none selected
        if (result.captionStyles.length > 0 && !captionStyleId) {
          setWorkflowData({ captionStyleId: result.captionStyles[0].captionId });
        }

        // Cache the results
        setCachedResources({
          captionStyles: {
            data: result.captionStyles,
            timestamp: Date.now(),
          },
        });
      }
    } catch (error) {
      toast.error("Failed to load caption styles");
    } finally {
      setLoadingCaptionStyles(false);
    }
  };

  // Check scroll position for caption carousel
  const checkScroll = () => {
    if (captionScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = captionScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Update scroll state when caption styles load
  useEffect(() => {
    if (captionStyles.length > 0) {
      setTimeout(checkScroll, 100);
    }
  }, [captionStyles]);

  const scrollCaptionStyles = (dir: "left" | "right") => {
    if (captionScrollRef.current) {
      const amt = 300;
      captionScrollRef.current.scrollTo({
        left:
          captionScrollRef.current.scrollLeft +
          (dir === "right" ? amt : -amt),
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  const handleGenerateScript = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Enter a prompt");
      return;
    }

    setIsGenerating(true);

    const selectedLanguage = language || "English";

    try {
      const response = await axios.post(
        "/api/topview/generate-script",
        {
          prompt: aiPrompt.trim(),
          duration: aiDuration,
          language: selectedLanguage,
        },
        {
          responseType: "text",
        }
      );

      const generatedScript = response.data?.trim();

      if (generatedScript) {
        setWorkflowData({ script: generatedScript });
        setIsDialogOpen(false);
        toast.success(`Script generated in ${selectedLanguage}!`);
      } else {
        toast.error("Empty script received");
      }
    } catch (err) {
      console.error("Script error:", err);
      toast.error("Script generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!voiceId) {
      setError("Please select a voice");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      console.log("📤 Submitting video generation task...");

      const response = await fetch("/api/topview/generate-video/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskRecordId,
          selectedImageId,
          script,
          voiceId,
          mode,
          captionStyleId,
          videoOrientation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error("Insufficient credits. Please upgrade your plan.");
        }
        throw new Error(data.error || "Failed to start video generation");
      }

      console.log("✅ Video generation task submitted, taskId:", data.taskId);

      // Store video record ID and task ID
      setWorkflowData({
        videoRecordId: data.videoRecordId,
        videoTaskId: data.taskId,
      });

      // Start polling for video completion using taskId
      pollForVideoCompletion(data.taskId, data.videoRecordId);
    } catch (error) {
      setSaving(false);
      setError(
        error instanceof Error ? error.message : "Failed to generate video"
      );
    }
  };

  const pollForVideoCompletion = async (taskId: string, videoRecordId: string) => {
    const maxAttempts = 200; // 10 minutes max (200 * 3s = 600s)
    let attempts = 0;

    const poll = async () => {
      try {
        console.log(`🔍 Polling video status (attempt ${attempts + 1}/${maxAttempts})...`);

        const response = await fetch(
          `/api/topview/generate-video/status?taskId=${taskId}`
        );
        const data = await response.json();

        console.log(`  Status: ${data.status}`);
        console.log(`  Has finishedVideoUrl: ${!!data.finishedVideoUrl}`);
        console.log(`  Credits deducted: ${data.creditsDeducted}`);

        if (data.status === "success" && data.finishedVideoUrl) {
          console.log("✅ Video generation completed successfully!");
          console.log(`  Video URL: ${data.finishedVideoUrl}`);

          // Store the finished video URL in workflow data
          setWorkflowData({
            finishedVideoUrl: data.finishedVideoUrl,
            videoRecordId
          });

          setSaving(false);
          toast.success("Video generated successfully!");

          // Move to next step (VideoResult)
          nextStep();
        } else if (data.status === "failed" || data.status === "error") {
          console.error("❌ Video generation failed:", data);
          setSaving(false);
          setError(data.message || "Video generation failed. Please try again.");
        } else if (data.status === "running" || data.status === "processing" || data.status === "pending") {
          // Task is still processing
          console.log(`⏳ Video still ${data.status}, continuing to poll...`);
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(poll, 3000); // Poll every 3 seconds
          } else {
            console.error("⏰ Polling timeout after", maxAttempts, "attempts");
            setSaving(false);
            setError("Video generation timed out. Please check your videos page or contact support.");
          }
        } else {
          // Unknown status, continue polling
          console.warn(`⚠️ Unknown status '${data.status}', continuing to poll...`);
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(poll, 3000);
          } else {
            console.error("⏰ Polling timeout - status:", data.status);
            setSaving(false);
            setError("Video generation timed out. Please check your videos page.");
          }
        }
      } catch (error) {
        console.error("❌ Polling error:", error);
        setSaving(false);
        setError("Failed to check video status. Please try again.");
      }
    };

    poll();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configure Your Video</h2>
          <p className="text-muted-foreground mt-1">
            Customize voice, captions, and script
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN - Selected Image Preview */}
        <div className="space-y-4">
          <div className="bg-sidebar border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Selected Image</h3>
            <div className="relative aspect-square rounded-lg overflow-hidden bg-black/20">
              <img
                src={selectedImageUrl}
                alt="Selected product"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-3 p-3 bg-sidebar-accent rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 This image will be used in your video generation
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Form Controls */}
        <div className="space-y-6">
          {/* Script Input */}
          <div className="space-y-3">
            <div className="flex justify-between text-foreground">
              <h3 className="text-sm font-semibold">Your Script</h3>
              <span className="text-xs text-muted-foreground">
                {script.length}/{MAX_CHARS}
              </span>
            </div>

            <div className="relative">
              <textarea
                value={script}
                onChange={(e) => setWorkflowData({ script: e.target.value })}
                maxLength={MAX_CHARS}
                className="w-full min-h-[140px] bg-sidebar border border-border text-foreground rounded-lg p-4 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none resize-none"
                placeholder="Enter your video script here..."
              />

              <button
                onClick={() => setIsDialogOpen(true)}
                className="absolute bottom-6 left-3 bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 transition-all text-sm"
              >
                <Sparkles className="w-4 h-4" />
                AI Script Writer
              </button>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Video Orientation */}
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium mb-2 block">
                Video Orientation
              </label>
              <Select
                value={videoOrientation}
                onValueChange={(value) =>
                  setWorkflowData({
                    videoOrientation: value as typeof videoOrientation,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                  <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                  <SelectItem value="1:1">Square (1:1)</SelectItem>
                  <SelectItem value="4:3">Standard (4:3)</SelectItem>
                  <SelectItem value="3:4">Vertical (3:4)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Video Length */}
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium mb-2 block">
                Video Length
              </label>
              <Select
                value={videoLength}
                onValueChange={(value) => setWorkflowData({ videoLength: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <SelectItem value="15-30s">Short (15–30s)</SelectItem>
                  {maxDuration >= 60 && (
                    <SelectItem value="30-60s">Medium (30–60s)</SelectItem>
                  )}
                  {maxDuration >= 90 && (
                    <SelectItem value="60-90s">Long (60–90s)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium mb-2 block">
                Language
              </label>
              <Select
                value={language}
                onValueChange={(value) => {
                  setWorkflowData({ language: value, voiceId: "" });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {languageList.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Voice */}
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium mb-2 block">Voice</label>
              <Select
                value={voiceId}
                onValueChange={(value) => setWorkflowData({ voiceId: value })}
                disabled={!language}
              >
                <SelectTrigger className="w-full" disabled={!language}>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {filteredVoices.length === 0 && language ? (
                    <SelectItem value="no-voices" disabled>
                      No voices available for this language
                    </SelectItem>
                  ) : (
                    filteredVoices.map((voice) => (
                      <SelectItem key={voice.voiceId} value={voice.voiceId}>
                        {voice.voiceName} — {voice.gender}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Caption Styles */}
          <div className="space-y-3">
            <label className="text-foreground text-sm font-medium mb-2 block">
              Caption Style
            </label>

            <div className="relative">
              {/* Left fade gradient */}
              {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
              )}

              {/* Right fade gradient */}
              {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
              )}

              {canScrollLeft && (
                <button
                  onClick={() => scrollCaptionStyles("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg p-2 rounded-full z-20 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <div
                ref={captionScrollRef}
                onScroll={checkScroll}
                className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {loadingCaptionStyles ? (
                  // Shimmer loading skeletons
                  <>
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 w-32 p-2.5 rounded-lg border border-border bg-sidebar relative overflow-hidden"
                      >
                        <div className="w-full h-20 bg-muted rounded" />
                        <div className="absolute inset-0 shimmer" />
                      </div>
                    ))}
                  </>
                ) : (
                  captionStyles.map((style) => (
                    <button
                      key={style.captionId}
                      onClick={() =>
                        setWorkflowData({ captionStyleId: style.captionId })
                      }
                      className={`flex-shrink-0 w-32 rounded border transition-all shadow-sm ${captionStyleId === style.captionId
                        ? "border-brand-primary bg-brand-primary/10 shadow-brand-primary/20"
                        : "border-border bg-sidebar hover:border-brand-primary/50"
                        }`}
                    >
                      <img
                        src={style.thumbnail}
                        alt={style.name || "Caption style"}
                        className="w-full h-20 rounded border border-border"
                      />
                    </button>
                  ))
                )}
              </div>

              {canScrollRight && (
                <button
                  onClick={() => scrollCaptionStyles("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg p-2 rounded-full z-20 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quality Mode */}
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium mb-2 block">
              Quality Mode
            </label>
            <div className="flex gap-3">
              {(["standard", "pro"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setWorkflowData({ mode: m })}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${mode === m
                    ? "bg-brand-primary text-white shadow-lg"
                    : "bg-sidebar border border-border text-foreground hover:border-brand-primary/50"
                    }`}
                >
                  {m === "pro" ? "Pro" : "Standard"}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={previousStep}
          disabled={saving}
          className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-border text-foreground hover:bg-sidebar-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || !voiceId}
          className="px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />}
          <span className="hidden sm:inline">{saving ? "Generating Video... (This may take a few minutes)" : "Generate Video"}</span>
          <span className="inline sm:hidden">{saving ? "Generating..." : "Generate Video"}</span>
        </button>
      </div>

      {/* AI Script Generation Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="sm:max-w-[500px] w-full bg-card border border-border backdrop-blur-xl shadow-xl text-foreground rounded-xl p-6 relative">
            {/* Close X button */}
            <button
              onClick={() => setIsDialogOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-sidebar-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>

            <div className="mb-4">
              <h3 className="text-2xl font-semibold text-foreground">
                Generate Script with AI
              </h3>
            </div>

            <div className="space-y-6 mt-4">
              {/* Duration Select */}
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium mb-2 block">
                  Video Duration
                </label>
                <Select
                  value={aiDuration}
                  onValueChange={(value) => setAiDuration(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    <SelectItem value="0-15s">Short (0-15s)</SelectItem>
                    {maxDuration > 15 && (
                      <SelectItem value="15-30s">Short (15–30s)</SelectItem>
                    )}
                    {maxDuration >= 30 && (
                      <SelectItem value="30-60s">Medium (30–60s)</SelectItem>
                    )}
                    {maxDuration >= 60 && (
                      <SelectItem value="60-90s">Long (60–90s)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">
                  Your Prompt
                </label>
                <textarea
                  className="w-full bg-sidebar border border-border text-foreground rounded-lg min-h-[120px] p-4 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none resize-none"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the video you want. Ex: 'AI avatar explaining benefits of a skincare product'"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateScript}
                disabled={isGenerating}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg rounded-lg px-6 py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Script"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add shimmer effect styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
    
    .shimmer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.05) 20%,
        rgba(255, 255, 255, 0.1) 50%,
        rgba(255, 255, 255, 0.05) 80%,
        rgba(255, 255, 255, 0) 100%
      );
      background-size: 1000px 100%;
      animation: shimmer 2s infinite;
    }
  `;
  if (!document.querySelector('#step3-shimmer-styles')) {
    style.id = 'step3-shimmer-styles';
    document.head.appendChild(style);
  }
}
