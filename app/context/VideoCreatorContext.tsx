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
  selectedImageId?: string;
  selectedImageUrl?: string;
  videoRecordId?: string;
  finishedVideoUrl?: string;
}

interface VideoCreatorContextValue {
  // State
  currentStep: WorkflowStep;
  workflowData: WorkflowData;
  error: string | null;

  // Actions
  setWorkflowData: (data: Partial<WorkflowData>) => void;
  goToStep: (step: WorkflowStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  setError: (error: string | null) => void;
  resetWorkflow: () => void;
}

const VideoCreatorContext = createContext<VideoCreatorContextValue | undefined>(
  undefined
);

interface VideoCreatorProviderProps {
  children: ReactNode;
}

export function VideoCreatorProvider({ children }: VideoCreatorProviderProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);
  const [workflowData, setWorkflowDataState] = useState<WorkflowData>({});
  const [error, setError] = useState<string | null>(null);

  const setWorkflowData = (data: Partial<WorkflowData>) => {
    setWorkflowDataState((prev) => ({ ...prev, ...data }));
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
  };

  const value: VideoCreatorContextValue = {
    currentStep,
    workflowData,
    error,
    setWorkflowData,
    goToStep,
    nextStep,
    previousStep,
    setError,
    resetWorkflow,
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
