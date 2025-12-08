"use client";

import { VideoCreatorProvider, useVideoCreator } from "../../context/VideoCreatorContext";
import { CheckCircle2 } from "lucide-react";
import Step1ProductUpload from "./Step1ProductUpload";
import Step2TemplateSelection from "./Step2TemplateSelection";
import Step3VideoGeneration from "./Step3VideoGeneration";
import VideoResult from "./VideoResult";

function QuickNavButton({ stepNumber }: { stepNumber: 1 | 2 | 3 | 4 }) {
  const { currentStep, goToStep } = useVideoCreator();

  return (
    <button
      onClick={() => goToStep(stepNumber)}
      className={`px-3 py-1 text-xs rounded border transition-all ${currentStep === stepNumber
        ? "bg-brand-primary text-white border-brand-primary"
        : "bg-sidebar border-border text-muted-foreground hover:bg-sidebar-accent"
        }`}
    >
      Go to Step {stepNumber}
    </button>
  );
}

import { useEffect } from "react";
import { toast } from "sonner";

function VideoCreatorContent() {
  const { currentStep, error, setError } = useVideoCreator();

  // Show toast when global error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
      // Clear error from context after showing toast
      setError(null);
    }
  }, [error, setError]);

  const steps = [
    { number: 1, title: "Upload Product", description: "Remove background" },
    { number: 2, title: "Choose Template", description: "Replace product" },
    { number: 3, title: "Generate Video", description: "Add script & voice" },
    { number: 4, title: "Download Video", description: "Video ready" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <div className="bg-gradient-to-br from-card via-card to-sidebar-accent/30 border border-border rounded-xl p-6 sm:p-8 shadow-lg overflow-hidden relative">
        <div className="w-full max-w-4xl mx-auto">
          <div className="relative">
            {/* ✅ FIXED CONTAINER */}
            <div className="flex items-start justify-between gap-6 sm:gap-10 relative pb-2">
              {steps.map((step, index) => {
                const isCompleted = currentStep > step.number;
                const isActive = currentStep === step.number;

                return (
                  <div key={step.number} className="flex-1 flex flex-col items-center relative">

                    {/* ✅ PERFECTLY CONNECTED LINE (CENTER → CENTER) */}
                    {index < steps.length - 1 && (
                      <div className="absolute sm:top-7 top-5 left-[calc(50%+26px)] right-[-60%] h-0.5 z-0 pointer-events-none">

                        {isCompleted && (
                          <div
                            className="absolute inset-0 border-t-2 border-dashed border-[#03AC13] right-[5%]"
                            style={{ animation: "progressFill 0.4s ease-out forwards" }}
                          />
                        )}

                        {/* ✅ DASHED ONLY FOR ACTIVE & FUTURE */}
                        {!isCompleted && (
                          <div className="absolute inset-0 border-t-2 border-dashed border-border opacity-70" />
                        )}
                      </div>
                    )}

                    {/* ✅ STEP CIRCLE (ALWAYS ABOVE LINE) */}
                    <div className="relative z-10 mb-3">

                      {/* Glow */}
                      {currentStep >= step.number && (
                        <div
                          className={`absolute inset-0 rounded-full blur-lg ${isCompleted ? "bg-[#03AC13]/40" : "bg-brand-primary/40"
                            }`}
                        />
                      )}

                      <div
                        className={`
              relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full 
              flex items-center justify-center font-bold text-sm sm:text-base md:text-lg
              transition-all duration-300
              ${isCompleted
                            ? "bg-[#03AC13]/20 border-2 border-[#03AC13]"
                            : isActive
                              ? "bg-sidebar-accent border-2 border-brand-primary ring-4 ring-brand-primary/20 shadow-lg"
                              : "bg-sidebar-accent/80 border-2 border-border/60"
                          }
            `}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-[#03AC13] drop-shadow-lg" />
                        ) : (
                          <span
                            className={
                              isActive
                                ? "text-brand-primary font-bold"
                                : "text-muted-foreground/70"
                            }
                          >
                            {step.number}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ✅ STEP INFO */}
                    <div className="text-center px-1 max-w-[90px] md:max-w-none">
                      <p
                        className={`text-[11px] sm:text-xs md:text-sm font-semibold leading-tight transition-all duration-300 ${currentStep >= step.number
                          ? "text-foreground"
                          : "text-muted-foreground/60"
                          }`}
                      >
                        {step.title}
                      </p>
                      <p
                        className={`hidden md:block text-xs mt-1.5 transition-all duration-300 ${currentStep >= step.number
                          ? "text-muted-foreground"
                          : "text-muted-foreground/50"
                          }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* ✅ Quick Navigation */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground/80 mb-3 text-center">
            Quick Navigation (Testing Only)
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {steps.map((step) => (
              <QuickNavButton
                key={step.number}
                stepNumber={step.number as 1 | 2 | 3 | 4}
              />
            ))}
          </div>
        </div>

        {/* Animations */}
        <style jsx>{`
          @keyframes progressFill {
            0% {
              transform: scaleX(0);
              transform-origin: left;
              opacity: 0;
            }
            100% {
              transform: scaleX(1);
              transform-origin: left;
              opacity: 1;
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: scale(1.1);
            }
            50% {
              transform: scale(1.15);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.7;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
          }
        `}</style>
      </div>


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
