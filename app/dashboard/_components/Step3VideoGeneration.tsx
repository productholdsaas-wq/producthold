"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useVideoCreator } from "../../context/VideoCreatorContext";
import { toast } from "sonner";
import axios from "axios";

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

  const scrollCaptionStyles = (dir: "left" | "right") => {
    if (captionScrollRef.current) {
      const amt = 300;
      captionScrollRef.current.scrollTo({
        left:
          captionScrollRef.current.scrollLeft +
          (dir === "right" ? amt : -amt),
        behavior: "smooth",
      });
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
    if (!script.trim()) {
      setError("Please enter a script");
      return;
    }

    if (script.length < 10) {
      setError("Script must be at least 10 characters");
      return;
    }

    if (!voiceId) {
      setError("Please select a voice");
      return;
    }

    setSaving(true);
    setError(null);

    try {
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

      setWorkflowData({
        videoRecordId: data.videoRecordId,
      });

      // Move to next step
      nextStep();
    } catch (error) {
      setSaving(false);
      setError(
        error instanceof Error ? error.message : "Failed to generate video"
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                           PREMIUM UI                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="p-6 md:p-10 rounded-2xl border border-[#8E40FF]/30 bg-[#0D0D12]/80 backdrop-blur-xl shadow-[0_0_25px_rgba(142,64,255,0.25)]">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <button
            onClick={previousStep}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={saving}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-white">Write Your Script</h2>
            <p className="text-gray-400 mt-1">
              Customize voice, captions, and script.
            </p>
          </div>
        </div>

        {/* ----------------------------------- */}
        {/*            SETTINGS PANEL            */}
        {/* ----------------------------------- */}
        <div className="space-y-6 bg-white/[0.03] border border-[#8E40FF]/20 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_15px_rgba(142,64,255,0.1)]">
          <h3 className="text-lg font-semibold text-white">Video Settings</h3>

          {/* SETTINGS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ------------------------------------- */}
            {/*        SCRIPT INPUT - FULL WIDTH      */}
            {/* ------------------------------------- */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex justify-between text-gray-300">
                <h3 className="text-lg font-medium">Your Script</h3>
                <span className="text-xs opacity-70">
                  {script.length}/{MAX_CHARS}
                </span>
              </div>

              <div className="relative">
                <textarea
                  value={script}
                  onChange={(e) =>
                    setWorkflowData({ script: e.target.value })
                  }
                  maxLength={MAX_CHARS}
                  className="w-full min-h-[180px] bg-black/40 border border-[#8E40FF]/30 text-white rounded-2xl p-4 focus:ring-2 focus:ring-[#8E40FF] focus:border-transparent outline-none resize-none"
                  placeholder="Enter your video script here..."
                />

                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="absolute bottom-4 left-4 bg-[#8E40FF] hover:bg-[#7a34db] text-white shadow-lg rounded-xl px-4 py-2 flex items-center gap-2 transition-all"
                >
                  🪄 AI Prompt Writer
                </button>
              </div>
            </div>

            {/* ORIENTATION */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">
                Video Orientation
              </label>
              <select
                value={videoOrientation}
                onChange={(e) =>
                  setWorkflowData({
                    videoOrientation: e.target.value as typeof videoOrientation,
                  })
                }
                className="w-full bg-black/40 border border-[#8E40FF]/40 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8E40FF] focus:border-transparent outline-none"
              >
                <option value="9:16">Portrait (9:16)</option>
                <option value="16:9">Landscape (16:9)</option>
                <option value="1:1">Square (1:1)</option>
                <option value="4:3">Standard (4:3)</option>
                <option value="3:4">Vertical (3:4)</option>
              </select>
            </div>

            {/* LENGTH */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">
                Video Length
              </label>
              <select
                value={videoLength}
                onChange={(e) =>
                  setWorkflowData({ videoLength: e.target.value })
                }
                className="w-full bg-black/40 border border-[#8E40FF]/40 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8E40FF] focus:border-transparent outline-none"
              >
                <option value="15-30s">Short (15–30s)</option>
                {maxDuration >= 60 && (
                  <option value="30-60s">Medium (30–60s)</option>
                )}
                {maxDuration >= 90 && (
                  <option value="60-90s">Long (60–90s)</option>
                )}
              </select>
            </div>

            {/* LANGUAGE */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => {
                  setWorkflowData({ language: e.target.value, voiceId: "" });
                }}
                className="w-full bg-black/40 border border-[#8E40FF]/40 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8E40FF] focus:border-transparent outline-none"
              >
                <option value="">Select language</option>
                {languageList.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* VOICE */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">Voice</label>
              <select
                value={voiceId}
                onChange={(e) => setWorkflowData({ voiceId: e.target.value })}
                disabled={!language}
                className="w-full bg-black/40 border border-[#8E40FF]/40 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8E40FF] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select voice</option>
                {filteredVoices.length === 0 && language && (
                  <option disabled>No voices available for this language</option>
                )}
                {filteredVoices.map((voice) => (
                  <option key={voice.voiceId} value={voice.voiceId}>
                    {voice.voiceName} — {voice.gender}
                  </option>
                ))}
              </select>
            </div>

            {/* ------------------------------------- */}
            {/*        CAPTION STYLES SCROLLER         */}
            {/* ------------------------------------- */}
            <div className="space-y-3 md:col-span-2">
              <label className="text-gray-300 text-sm font-medium">
                Caption Style
              </label>

              <div className="relative">
                <button
                  onClick={() => scrollCaptionStyles("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#8E40FF] hover:bg-[#7a34db] text-white shadow-lg p-2 rounded-full z-10 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div
                  ref={captionScrollRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide px-10 pb-3"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {loadingCaptionStyles ? (
                    <p className="text-gray-400">Loading...</p>
                  ) : (
                    captionStyles.map((style) => (
                      <button
                        key={style.captionId}
                        onClick={() =>
                          setWorkflowData({ captionStyleId: style.captionId })
                        }
                        className={`flex-shrink-0 w-36 p-3 rounded-xl border transition-all shadow-md 
                                            ${captionStyleId === style.captionId
                            ? "border-[#8E40FF] bg-[#8E40FF]/10 shadow-[0_0_10px_rgba(142,64,255,0.3)]"
                            : "border-white/10 bg-white/[0.03] hover:border-[#8E40FF]"
                          }
                                        `}
                      >
                        <img
                          src={style.thumbnail}
                          alt={style.name || "Caption style"}
                          className="w-full h-24 object-cover rounded-lg border border-white/10"
                        />
                      </button>
                    ))
                  )}
                </div>

                <button
                  onClick={() => scrollCaptionStyles("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#8E40FF] hover:bg-[#7a34db] text-white shadow-lg p-2 rounded-full z-10 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MODE SELECTION */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">
                Quality Mode
              </label>
              <div className="flex gap-3">
                {(["standard", "pro"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setWorkflowData({ mode: m })}
                    className={`
                                            flex-1 px-4 py-3 rounded-lg font-medium transition-all
                                            ${mode === m
                        ? "bg-[#8E40FF] text-white shadow-lg"
                        : "bg-black/40 border border-[#8E40FF]/40 text-white hover:border-[#8E40FF]"
                      }
                                        `}
                  >
                    {m === "pro" ? "Pro" : "Standard"}
                  </button>
                ))}
              </div>
            </div>

            {/* CREDIT COST */}
            <div className="p-4 bg-white/5 border border-[#8E40FF]/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Credit Cost:</span>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8E40FF]" />
                  <span className="font-semibold text-white">1 Credit</span>
                </div>
              </div>
            </div>

            {/* CONTINUE BUTTON */}
            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={saving || !voiceId || !script.trim()}
                className="w-full sm:w-56 bg-[#8E40FF] hover:bg-[#7a34db] text-white shadow-lg px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Generating..." : "Generate Video"}
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------ */}
        {/*         AI SCRIPT GENERATION DIALOG         */}
        {/* ------------------------------------------ */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="sm:max-w-[500px] w-full bg-[#0D0D12]/95 border border-[#8E40FF]/40 backdrop-blur-xl shadow-[0_0_30px_rgba(142,64,255,0.3)] text-white rounded-2xl p-6">
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-white">
                  Generate Script with AI
                </h3>
              </div>

              <div className="space-y-6 mt-4">
                {/* DURATION SELECT */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">
                    Video Duration
                  </label>
                  <select
                    value={aiDuration}
                    onChange={(e) => setAiDuration(e.target.value)}
                    className="w-full bg-black/40 border border-[#8E40FF]/40 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8E40FF] focus:border-transparent outline-none"
                  >
                    <option value="0-15s">Short (0-15s)</option>
                    {maxDuration > 15 && (
                      <option value="15-30s">Short (15–30s)</option>
                    )}
                    {maxDuration >= 30 && (
                      <option value="30-60s">Medium (30–60s)</option>
                    )}
                    {maxDuration >= 60 && (
                      <option value="60-90s">Long (60–90s)</option>
                    )}
                  </select>
                </div>

                {/* PROMPT INPUT */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">
                    Your Prompt
                  </label>
                  <textarea
                    className="w-full bg-black/40 border border-[#8E40FF]/40 text-white rounded-xl min-h-[120px] p-4 focus:ring-2 focus:ring-[#8E40FF] focus:border-transparent outline-none resize-none"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe the video you want. Ex: 'AI avatar explaining benefits of a skincare product'"
                  />
                </div>

                {/* GENERATE BUTTON */}
                <button
                  onClick={handleGenerateScript}
                  disabled={isGenerating}
                  className="w-full bg-[#8E40FF] hover:bg-[#7a34db] text-white shadow-lg rounded-xl px-6 py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

                {/* CLOSE BUTTON */}
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl px-6 py-3 font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
