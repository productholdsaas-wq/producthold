"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Loader2, ChevronRight } from "lucide-react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useVideoCreator } from "../../context/VideoCreatorContext";

interface ReplaceProductResult {
  imageId: string;
  url: string;
}

interface Ethnicity {
  ethnicityId: string;
  ethnicityName: string;
}

interface FaceSquareConfig {
  y_f: number;
  w: number;
  h: number;
  x: number;
  y: number;
  h_f: number;
  x_f: number;
  w_f: number;
}

interface Avatar {
  aiavatarId: string;
  aiavatarName: string;
  gender?: string;
  coverUrl?: string;
  previewVideoUrl?: string;
  previewImageUrl?: string;
  ethnicities?: Ethnicity[];
  voiceoverIdDefault?: string;
  faceSquareConfig?: FaceSquareConfig;
  type?: number;
}

export default function Step2TemplateSelection() {
  const { workflowData, setWorkflowData, nextStep, previousStep, setError } = useVideoCreator();

  const taskRecordId = workflowData.taskRecordId!;
  const bgRemovedImageUrl = workflowData.bgRemovedImageUrl!;
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [processing, setProcessing] = useState(false);
  const [mode] = useState<"auto" | "manual">("auto");
  const [results, setResults] = useState<ReplaceProductResult[] | null>(null);

  // Avatar fetching states
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [filteredAvatars, setFilteredAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Filter states
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedEthnicity, setSelectedEthnicity] = useState("all");
  const [genderList, setGenderList] = useState<string[]>([]);
  const [ethnicityList, setEthnicityList] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15; // 5 cards x 3 rows

  const hasLoadedRef = useRef(false);

  // Load initial data
  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadInitialData();
      hasLoadedRef.current = true;
    }
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingFilters(true);
      setLoading(true);

      const { data } = await axios.get("/api/topview/avatars");

      if (data.success) {
        setAvatars(data.avatars);
        setFilteredAvatars(data.avatars);
        setGenderList(data.filters.gender || []);
        setEthnicityList(data.filters.ethnicity || []);
      }
    } catch (error) {
      console.error("Failed to load avatars", error);
      setError("Failed to load avatars");
    } finally {
      setLoadingFilters(false);
      setLoading(false);
    }
  };

  const fetchFilteredAvatars = async (genderValue: string, ethnicityValue: string) => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (genderValue !== "all") params.append("gender", genderValue);
      if (ethnicityValue !== "all") params.append("ethnicity", ethnicityValue);

      const url = params.toString()
        ? `/api/topview/avatars?${params.toString()}`
        : "/api/topview/avatars";

      const { data } = await axios.get(url);

      if (data.success) {
        setFilteredAvatars(data.avatars);
        setCurrentPage(1);
      }
    } catch {
      setError("Failed to filter avatars");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAvatar) {
      setError("Please select an avatar");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/topview/replace-product/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskRecordId,
          avatarId: selectedAvatar.aiavatarId,
          generateImageMode: mode,
          imageEditPrompt:
            "Replace the item in the hand of the person with the product. Keep composition unchanged.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start image replacement");
      }

      // Poll for results
      pollForResults(taskRecordId);
    } catch (error) {
      setProcessing(false);
      setError(error instanceof Error ? error.message : "Failed to process");
    }
  };

  const pollForResults = async (recordId: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/topview/replace-product/status?taskRecordId=${recordId}`
        );
        const data = await response.json();

        if (data.status === "success" && data.replaceProductResult) {
          setProcessing(false);
          setResults(data.replaceProductResult);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setProcessing(false);
          setError("Image replacement timed out. Please try again.");
        }
      } catch {
        setProcessing(false);
        setError("Failed to check status.");
      }
    };

    poll();
  };

  const handleSelectResult = (result: ReplaceProductResult) => {
    setWorkflowData({
      selectedImageId: result.imageId,
      selectedImageUrl: result.url,
    });
    nextStep();
  };

  const totalPages = Math.ceil(filteredAvatars.length / ITEMS_PER_PAGE);
  const currentAvatars = filteredAvatars.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.classList.add("fade-slide");
      setTimeout(() => {
        gridRef.current?.classList.remove("fade-slide");
      }, 250);
    }
  }, [currentPage, filteredAvatars]);

  return (
    <div className="bg-card border border-border rounded-xl p-8">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Choose Avatar</h2>
          <p className="text-muted-foreground">
            Select an AI avatar to showcase your product
          </p>
        </div>
      </div>

      {/* Show Results or Avatar Selection */}
      {results ? (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Select Generated Image:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.map((result) => (
              <div
                key={result.imageId}
                onClick={() => handleSelectResult(result)}
                className="border-2 border-border rounded-xl p-4 cursor-pointer hover:border-brand-primary transition-all group"
              >
                <img
                  src={result.url}
                  alt="Generated"
                  className="w-full rounded-lg mb-3"
                />
                <button className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg font-medium group-hover:bg-brand-primary-light transition-all">
                  Select This
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4 mb-6">

            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={loadingFilters ? "" : selectedGender}
                disabled={loadingFilters}
                onValueChange={(value) => {
                  setSelectedGender(value);
                  fetchFilteredAvatars(value, selectedEthnicity);
                }}
              >
                <SelectTrigger className="w-[180px] disabled:opacity-60 relative overflow-hidden">
                  <SelectValue
                    placeholder={loadingFilters ? "Loading..." : "Gender"}
                  />
                  {loadingFilters && (
                    <div className="absolute inset-0 shimmer" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  {genderList.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={loadingFilters ? "" : selectedEthnicity}
                disabled={loadingFilters}
                onValueChange={(value) => {
                  setSelectedEthnicity(value);
                  fetchFilteredAvatars(selectedGender, value);
                }}
              >
                <SelectTrigger className="w-[180px] disabled:opacity-60 relative overflow-hidden">
                  <SelectValue
                    placeholder={loadingFilters ? "Loading..." : "Ethnicity"}
                  />
                  {loadingFilters && (
                    <div className="absolute inset-0 shimmer" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ethnicities</SelectItem>
                  {ethnicityList.map((ethnicity) => (
                    <SelectItem key={ethnicity} value={ethnicity}>
                      {ethnicity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Avatar Grid */}
          <div className="relative">
            {totalPages > 1 && (
              <button
                className="absolute -left-2 top-1/2 -translate-y-1/2 bg-card border border-border p-2 rounded-full hover:bg-sidebar-accent transition z-10 disabled:opacity-30"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {totalPages > 1 && (
              <button
                className="absolute -right-2 top-1/2 -translate-y-1/2 bg-card border border-border p-2 rounded-full hover:bg-sidebar-accent transition z-10 disabled:opacity-30"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <div
              ref={gridRef}
              className={cn(
                "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 transition-all duration-300 min-h-[400px]"
              )}
            >
              {loading
                ? [...Array(15)].map((_, idx) => (
                  <div
                    key={idx}
                    className="h-[260px] bg-sidebar rounded-xl overflow-hidden relative"
                  >
                    <div className="shimmer" />
                  </div>
                ))
                : currentAvatars.map((avatar) => (
                  <div
                    key={avatar.aiavatarId}
                    className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 h-[260px]
                        ${selectedAvatar?.aiavatarId === avatar.aiavatarId
                        ? "border-brand-primary shadow-lg shadow-brand-primary/20 scale-105"
                        : "border-transparent hover:border-brand-primary/50 hover:shadow-md"
                      }`}
                    onClick={() => setSelectedAvatar(avatar)}
                  >
                    <img
                      src={avatar.coverUrl || avatar.previewImageUrl || ""}
                      alt={avatar.aiavatarName}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-sm font-medium truncate">
                        {avatar.aiavatarName}
                      </p>
                      {avatar.gender && (
                        <p className="text-white/70 text-xs">{avatar.gender}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Dot Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {(() => {
                const DOT_WINDOW = 6;
                let start = Math.max(1, currentPage - Math.floor(DOT_WINDOW / 2));
                const end = Math.min(totalPages, start + DOT_WINDOW - 1);

                if (end - start < DOT_WINDOW - 1) start = Math.max(1, end - DOT_WINDOW + 1);

                return [...Array(end - start + 1)].map((_, idx) => {
                  const page = start + idx;
                  return (
                    <div
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-3 h-3 rounded-full cursor-pointer transition-all",
                        page === currentPage
                          ? "bg-brand-primary scale-110"
                          : "bg-border hover:bg-border/70"
                      )}
                    ></div>
                  );
                });
              })()}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousStep}
              className="mt-6 px-6 py-3 rounded-lg border border-border text-sm text-foreground hover:bg-white/5 transition"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedAvatar || processing}
              className=" mt-6 px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing && <Loader2 className="w-5 h-5 animate-spin" />}
              {processing ? "Processing..." : "Generate Images"}
            </button>
          </div>
        </>
      )}

      <style>{`
        .fade-slide {
          opacity: 0;
          transform: translateY(10px);
        }
        
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
      `}</style>
    </div>
  );
}
