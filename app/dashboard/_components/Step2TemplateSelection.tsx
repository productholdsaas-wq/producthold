"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

interface AvatarEthnicity {
  ethnicityId: string;
  ethnicityName: string;
}

interface AvatarCategory {
  categoryId: string;
  categoryName: string;
}

interface Avatar {
  avatarId: string;
  avatarImagePath: string;
  voiceoverId: string;
  gender: string;
  avatarCategoryList: AvatarCategory[];
  objectMaskImageInfo: string;
  avatarEthnicityList: AvatarEthnicity[];
  minSubsType: string;
}

export default function Step2TemplateSelection() {
  const {
    workflowData,
    setWorkflowData,
    nextStep,
    previousStep,
    setError,
    cachedResources,
    setCachedResources,
    isCacheValid,
  } = useVideoCreator();

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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [genderList, setGenderList] = useState<string[]>([]);
  const [ethnicityList, setEthnicityList] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15; // 5 cards x 3 rows

  const hasLoadedRef = useRef(false);

  // Load initial data and restore state from context
  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadInitialData();

      // Restore results from context if they exist
      if (workflowData.replaceProductResults) {
        setResults(workflowData.replaceProductResults);
      }

      // Restore selected avatar page
      if (workflowData.selectedAvatarPage) {
        setCurrentPage(workflowData.selectedAvatarPage);
      }

      hasLoadedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore selected avatar when avatars are loaded
  useEffect(() => {
    if (avatars.length > 0 && workflowData.selectedAvatarId && !selectedAvatar) {
      const avatar = avatars.find(a => a.avatarId === workflowData.selectedAvatarId);
      if (avatar) {
        setSelectedAvatar(avatar);
      }
    }
  }, [avatars, workflowData.selectedAvatarId, selectedAvatar]);

  // Extract unique categories from avatars
  useEffect(() => {
    if (avatars.length > 0) {
      const categories = new Set<string>();
      avatars.forEach(avatar => {
        avatar.avatarCategoryList.forEach(cat => {
          if (cat.categoryName) {
            categories.add(cat.categoryName);
          }
        });
      });
      setCategoryList(Array.from(categories).sort());
    }
  }, [avatars]);

  // Save current page to workflow context
  useEffect(() => {
    if (currentPage > 1) {
      setWorkflowData({ selectedAvatarPage: currentPage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadInitialData = useCallback(async () => {
    // Check if we have valid cached avatars
    if (isCacheValid('avatars')) {
      console.log('📦 Using cached avatars');
      const cache = cachedResources.avatars!;
      setAvatars(cache.data);
      setFilteredAvatars(cache.data);
      setGenderList(cache.filters.gender || []);
      setEthnicityList(cache.filters.ethnicity || []);
      setCategoryList(cache.filters.category || []);
      return;
    }

    // Fetch fresh data if cache is invalid or empty
    try {
      setLoadingFilters(true);
      setLoading(true);

      console.log('🔄 Fetching fresh avatars from API');
      const { data } = await axios.get("/api/topview/avatars");

      if (data.success) {
        setAvatars(data.avatars);
        setFilteredAvatars(data.avatars);
        setGenderList(data.filters.gender || []);
        setEthnicityList(data.filters.ethnicity || []);
        setCategoryList(data.filters.category || []);

        // Cache the results
        setCachedResources({
          avatars: {
            data: data.avatars,
            filters: {
              gender: data.filters.gender || [],
              ethnicity: data.filters.ethnicity || [],
              category: data.filters.category || [],
            },
            timestamp: Date.now(),
          },
        });
      }
    } catch (error) {
      console.error("Failed to load avatars", error);
      setError("Failed to load avatars");
    } finally {
      setLoadingFilters(false);
      setLoading(false);
    }
  }, [setError, isCacheValid, cachedResources, setCachedResources]);

  const fetchFilteredAvatars = async (genderValue: string, ethnicityValue: string, categoryValue: string) => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (genderValue !== "all") params.append("gender", genderValue);
      if (ethnicityValue !== "all") params.append("ethnicity", ethnicityValue);
      if (categoryValue !== "all") params.append("category", categoryValue);

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

    console.log("🔍 Selected avatar:", selectedAvatar);
    console.log("🔍 Avatar ID being sent:", selectedAvatar.avatarId);

    setProcessing(true);
    setError("");

    try {
      const payload = {
        taskRecordId,
        productImageWithoutBackgroundFileId: workflowData.bgRemovedImageFileId!,
        avatarId: selectedAvatar.avatarId,
        generateImageMode: mode,
        imageEditPrompt:
          "Replace the item in the hand of the person in Picture 1 with the one in Picture 2. Keep the composition position and gesture of the person in Picture 1 unchanged, and ensure that the features, appearance and details of the item in Picture 2 remain exactly the same after the change.",
      };

      console.log("📤 Sending payload:", payload);

      const response = await fetch("/api/topview/replace-product/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start image replacement");
      }

      console.log("✅ Submit successful, taskId:", data.taskId);

      // Poll for results using the TopView taskId
      pollForResults(data.taskId);
    } catch (error) {
      setProcessing(false);
      setError(error instanceof Error ? error.message : "Failed to process");
    }
  };

  const pollForResults = async (taskId: string) => {
    const maxAttempts = 200;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/topview/replace-product/status?taskId=${taskId}`
        );
        const data = await response.json();

        console.log(`🔍 Poll attempt ${attempts + 1}/${maxAttempts}:`, data);
        console.log(`  Status: ${data.status}`);
        console.log(`  Has replaceProductResult: ${!!data.replaceProductResult}`);

        if (data.status === "success" && data.replaceProductResult) {
          console.log("✅ Image replacement completed successfully!");
          setProcessing(false);
          setResults(data.replaceProductResult);
          // Save results to context for persistence
          setWorkflowData({ replaceProductResults: data.replaceProductResult });
        } else if (data.status === "failed" || data.status === "error") {
          console.error("❌ Image replacement failed:", data);
          setProcessing(false);
          setError(data.message || data.errorMsg || "Image replacement failed. Please try again.");
        } else if (data.status === "running" || data.status === "processing" || data.status === "pending") {
          // Task is still processing
          console.log(`⏳ Task still ${data.status}, continuing to poll...`);
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(poll, 2000);
          } else {
            console.error("⏰ Polling timeout after", maxAttempts, "attempts");
            setProcessing(false);
            setError("Image replacement timed out. Please try again.");
          }
        } else if (attempts < maxAttempts) {
          // Unknown status, continue polling
          console.warn(`⚠️ Unknown status '${data.status}', continuing to poll...`);
          attempts++;
          setTimeout(poll, 2000);
        } else {
          console.error("⏰ Polling timeout - status:", data.status);
          setProcessing(false);
          setError("Image replacement timed out. Please try again.");
        }
      } catch (error) {
        console.error("❌ Polling error:", error);
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Select Generated Image:
            </h3>
            <button
              onClick={() => {
                setResults(null);
                setWorkflowData({ replaceProductResults: undefined });
              }}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-white/5 transition"
            >
              Back to Selection
            </button>
          </div>
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
                  fetchFilteredAvatars(value, selectedEthnicity, selectedCategory);
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
                  fetchFilteredAvatars(selectedGender, value, selectedCategory);
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

              <Select
                value={loadingFilters ? "" : selectedCategory}
                disabled={loadingFilters}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  fetchFilteredAvatars(selectedGender, selectedEthnicity, value);
                }}
              >
                <SelectTrigger className="w-[180px] disabled:opacity-60 relative overflow-hidden">
                  <SelectValue
                    placeholder={loadingFilters ? "Loading..." : "Category"}
                  />
                  {loadingFilters && (
                    <div className="absolute inset-0 shimmer" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryList.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
                : currentAvatars.length === 0
                  ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Avatars Found</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {selectedGender !== "all" || selectedEthnicity !== "all" || selectedCategory !== "all"
                          ? "No avatars match your current filters. Try adjusting your selection."
                          : "No avatars are currently available. Please try again later."}
                      </p>
                      {(selectedGender !== "all" || selectedEthnicity !== "all" || selectedCategory !== "all") && (
                        <button
                          onClick={() => {
                            setSelectedGender("all");
                            setSelectedEthnicity("all");
                            setSelectedCategory("all");
                            fetchFilteredAvatars("all", "all", "all");
                          }}
                          className="mt-4 px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-light transition"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  )
                  : currentAvatars.map((avatar) => (
                    <div
                      key={avatar.avatarId}
                      className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 h-[260px]
                        ${selectedAvatar?.avatarId === avatar.avatarId
                          ? "border-brand-primary shadow-lg shadow-brand-primary/20 scale-105"
                          : "border-transparent hover:border-brand-primary/50 hover:shadow-md"
                        }`}
                      onClick={() => {
                        setSelectedAvatar(avatar);
                        // Persist avatar selection
                        setWorkflowData({ selectedAvatarId: avatar.avatarId });
                      }}
                    >
                      <img
                        src={avatar.avatarImagePath}
                        alt={`Avatar ${avatar.avatarId}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />

                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-sm font-medium truncate">
                          {avatar.avatarCategoryList[0]?.categoryName || 'Avatar'}
                        </p>
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
              disabled={processing}
              className="mt-6 px-6 py-3 rounded-lg border border-border text-sm text-foreground hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
