"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type WorkflowStep = 1 | 2 | 3 | 4;

interface WorkflowData {
  taskRecordId?: string;
  productImageFileId?: string;
  productName?: string;  // Added for product name
  scrapedImageFileId?: string;  // Added for scraped images
  bgRemovedImageFileId?: string;
  bgRemovedImageUrl?: string;

  // Step 1: URL Scraper state persistence
  productUrl?: string;
  scrapedImages?: Array<{
    fileId: string;
    fileName: string;
    fileUrl: string;
  }>;
  selectedScrapedImage?: {
    fileId: string;
    fileName: string;
    fileUrl: string;
  } | null;

  // Step 2: Avatar/Template Selection
  selectedImageId?: string;
  selectedImageUrl?: string;
  replaceProductResults?: Array<{
    imageId: string;
    url: string;
    faceExistence?: boolean;
    fileId?: string;
  }>;
  selectedAvatarId?: string; // Added to persist avatar selection

  // Step 3: Video Generation & Configuration
  videoRecordId?: string;
  videoTaskId?: string; // TopView task ID for polling
  finishedVideoUrl?: string;
  script?: string;
  language?: string;
  voiceId?: string;
  captionStyleId?: string;
  videoOrientation?: "9:16" | "16:9" | "1:1" | "4:3" | "3:4";
  videoLength?: string;
  mode?: "pro" | "lite";

  // UI State Persistence
  activeTab?: "url" | "upload";  // Step 1 tab state
  selectedAvatarPage?: number;    // Step 2 pagination state
}

// Type interfaces for cached resources
interface Avatar {
  avatarId: string;
  avatarImagePath: string;
  voiceoverId: string;
  gender: string;
  avatarCategoryList: Array<{
    categoryId: string;
    categoryName: string;
  }>;
  objectMaskImageInfo: string;
  avatarEthnicityList: Array<{
    ethnicityId: string;
    ethnicityName: string;
  }>;
  minSubsType: string;
}

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

// Cache interface for API data
interface CachedResources {
  avatars: {
    data: Avatar[];
    filters: {
      gender: string[];
      ethnicity: string[];
      category: string[];
    };
    timestamp: number;
  } | null;
  voices: {
    data: Voice[];
    filters: {
      language: string[];
      accent: string[];
      gender: string[];
      style: string[];
    };
    timestamp: number;
  } | null;
  captionStyles: {
    data: CaptionStyle[];
    timestamp: number;
  } | null;
}

interface VideoCreatorContextValue {
  // State
  currentStep: WorkflowStep;
  workflowData: WorkflowData;
  error: string | null;
  cachedResources: CachedResources;

  // Actions
  setWorkflowData: (data: Partial<WorkflowData>) => void;
  goToStep: (step: WorkflowStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  setError: (error: string | null) => void;
  resetWorkflow: () => void;
  setCachedResources: (resources: Partial<CachedResources>) => void;
  isCacheValid: (resourceType: keyof CachedResources, maxAge?: number) => boolean;
}

const VideoCreatorContext = createContext<VideoCreatorContextValue | undefined>(
  undefined
);

interface VideoCreatorProviderProps {
  children: ReactNode;
}

// Default cache expiration: 5 minutes
const DEFAULT_CACHE_EXPIRATION = 5 * 60 * 1000;

export function VideoCreatorProvider({ children }: VideoCreatorProviderProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);
  const [workflowData, setWorkflowDataState] = useState<WorkflowData>({});
  const [error, setError] = useState<string | null>(null);
  const [cachedResources, setCachedResourcesState] = useState<CachedResources>({
    avatars: null,
    voices: null,
    captionStyles: null,
  });

  const setWorkflowData = (data: Partial<WorkflowData>) => {
    setWorkflowDataState((prev) => ({ ...prev, ...data }));
  };

  const setCachedResources = (resources: Partial<CachedResources>) => {
    setCachedResourcesState((prev) => ({ ...prev, ...resources }));
  };

  const isCacheValid = (
    resourceType: keyof CachedResources,
    maxAge: number = DEFAULT_CACHE_EXPIRATION
  ): boolean => {
    const cache = cachedResources[resourceType];
    if (!cache) return false;

    const now = Date.now();
    return (now - cache.timestamp) < maxAge;
  };

  const goToStep = (step: WorkflowStep) => {
    setCurrentStep(step);
    setError(null);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as WorkflowStep);
      setError(null);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WorkflowStep);
      setError(null);
    }
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setWorkflowDataState({});
    setError(null);
    // Optionally keep cached resources on reset
  };

  const value: VideoCreatorContextValue = {
    currentStep,
    workflowData,
    error,
    cachedResources,
    setWorkflowData,
    goToStep,
    nextStep,
    previousStep,
    setError,
    resetWorkflow,
    setCachedResources,
    isCacheValid,
  };

  return (
    <VideoCreatorContext.Provider value={value}>
      {children}
    </VideoCreatorContext.Provider>
  );
}

export function useVideoCreator() {
  const context = useContext(VideoCreatorContext);
  if (context === undefined) {
    throw new Error("useVideoCreator must be used within VideoCreatorProvider");
  }
  return context;
}
