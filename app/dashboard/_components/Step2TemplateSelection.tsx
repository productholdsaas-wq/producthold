"use client";

import { useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import Image from "next/image";

interface Step2Props {
  taskRecordId: string;
  bgRemovedImageUrl: string;
  onComplete: (data: { selectedImageId: string; selectedImageUrl: string }) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

interface ReplaceProductResult {
  imageId: string;
  url: string;
}

// Mock templates - in production, fetch from TopView or your own library
const mockTemplates = [
  { id: "template1", name: "Template 1", fileId: "temp_template_1", preview: "/api/placeholder/200/300" },
  { id: "template2", name: "Template 2", fileId: "temp_template_2", preview: "/api/placeholder/200/300" },
  { id: "template3", name: "Template 3", fileId: "temp_template_3", preview: "/api/placeholder/200/300" },
  { id: "template4", name: "Template 4", fileId: "temp_template_4", preview: "/api/placeholder/200/300" },
];

export default function Step2TemplateSelection({
  taskRecordId,
  bgRemovedImageUrl,
  onComplete,
  onError,
  onBack,
}: Step2Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [mode] = useState<"auto" | "manual">("auto");
  const [results, setResults] = useState<ReplaceProductResult[] | null>(null);

  const handleSubmit = async () => {
    if (!selectedTemplate) {
      onError("Please select a template");
      return;
    }

    setProcessing(true);
    onError("");

    try {
      const template = mockTemplates.find((t) => t.id === selectedTemplate);

      const response = await fetch("/api/topview/replace-product/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskRecordId,
          templateImageFileId: template?.fileId,
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
      onError(error instanceof Error ? error.message : "Failed to process");
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
          onError("Image replacement timed out. Please try again.");
        }
      } catch (error) {
        setProcessing(false);
        onError("Failed to check status.");
      }
    };

    poll();
  };

  const handleSelectResult = (result: ReplaceProductResult) => {
    onComplete({
      selectedImageId: result.imageId,
      selectedImageUrl: result.url,
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Choose Template</h2>
          <p className="text-muted-foreground">
            Select a template to replace your product into
          </p>
        </div>
      </div>

      {/* Product Preview */}
      <div className="mb-8 p-4 bg-sidebar border border-sidebar-border rounded-lg">
        <p className="text-sm font-medium text-foreground mb-3">
          Your Product (Background Removed):
        </p>
        <div className="flex justify-center">
          <img
            src={bgRemovedImageUrl}
            alt="Product"
            className="max-h-40 rounded-lg"
          />
        </div>
      </div>

      {/* Show Results or Template Selection */}
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
          {/* Template Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {mockTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`
                  border-2 rounded-xl p-4 cursor-pointer transition-all
                  ${
                    selectedTemplate === template.id
                      ? "border-brand-primary bg-brand-primary/5"
                      : "border-border hover:border-brand-primary/50"
                  }
                `}
              >
                <div className="aspect-[3/4] bg-sidebar rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">
                    {template.name}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground text-center">
                  {template.name}
                </p>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedTemplate || processing}
            className="w-full px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing && <Loader2 className="w-5 h-5 animate-spin" />}
            {processing ? "Processing..." : "Generate Images"}
          </button>
        </>
      )}
    </div>
  );
}
