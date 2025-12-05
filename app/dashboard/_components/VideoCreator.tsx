"use client";

import { VideoCreatorProvider, useVideoCreator } from "../../context/VideoCreatorContext";
import { CheckCircle2 } from "lucide-react";
import Step1ProductUpload from "./Step1ProductUpload";
import Step2TemplateSelection from "./Step2TemplateSelection";
import Step3VideoGeneration from "./Step3VideoGeneration";
import VideoResult from "./VideoResult";

function VideoCreatorContent() {
  const { currentStep, error } = useVideoCreator();

  const steps = [
    { number: 1, title: "Upload Product", description: "Remove background" },
    { number: 2, title: "Choose Template", description: "Replace product" },
    { number: 3, title: "Generate Video", description: "Add script & voice" },
    { number: 4, title: "Download", description: "Video ready" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-semibold
                    ${
                      currentStep > step.number
                        ? "bg-green-500/20 border-2 border-green-500"
                        : currentStep === step.number
                        ? "bg-brand-primary border-2 border-brand-primary-light"
                        : "bg-sidebar-accent border-2 border-border"
                    }
                  `}
                >
                  {currentStep > step.number ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <span
                      className={
                        currentStep === step.number
                          ? "text-white"
                          : "text-muted-foreground"
                      }
                    >
                      {step.number}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.number
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number
                      ? "bg-green-500"
                      : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[500px]">
        {currentStep === 1 && <Step1ProductUpload />}
        {currentStep === 2 && <Step2TemplateSelection />}
        {currentStep === 3 && <Step3VideoGeneration />}
        {currentStep === 4 && <VideoResult />}
      </div>
    </div>
  );
}

export default function VideoCreator() {
  return (
    <VideoCreatorProvider>
      <VideoCreatorContent />
    </VideoCreatorProvider>
  );
}
