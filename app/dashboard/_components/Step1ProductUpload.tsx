"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useVideoCreator } from "../../context/VideoCreatorContext";

export default function Step1ProductUpload() {
  const { workflowData, setWorkflowData, nextStep, setError } = useVideoCreator();
  
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Check if we already have completed data
  useEffect(() => {
    if (workflowData.bgRemovedImageUrl && workflowData.taskRecordId) {
      setPreview(workflowData.bgRemovedImageUrl);
      setIsCompleted(true);
    }
  }, [workflowData.bgRemovedImageUrl, workflowData.taskRecordId]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Reset completed state if re-uploading
      setIsCompleted(false);

      // Show preview
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      setUploading(true);
      setError(null);

      try {
        // Step 1: Get upload credentials from TopView
        console.log("🔑 Getting upload credentials...");
        const credResponse = await fetch("/api/topview/upload/credentials");
        const credData = await credResponse.json();

        if (!credResponse.ok || credData.code !== "200") {
          throw new Error("Failed to get upload credentials");
        }

        const { uploadUrl, fileId } = credData.result;
        console.log("✅ Got credentials, fileId:", fileId);

        // Step 2: Upload file to S3
        console.log("⬆️  Uploading to S3...");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("uploadUrl", uploadUrl);
        formData.append("fileId", fileId);

        const uploadResponse = await fetch("/api/topview/upload/image", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "Failed to upload image");
        }

        console.log("✅ Image uploaded successfully");

        // Step 3: Submit background removal with the valid fileId
        console.log("🔄 Submitting background removal...");
        const response = await fetch("/api/topview/remove-background/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productImageFileId: fileId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to start background removal");
        }

        setUploading(false);
        setProcessing(true);

        // Poll for completion
        pollForCompletion(data.taskRecordId);
      } catch (error) {
        setUploading(false);
        console.error("❌ Upload error:", error);
        setError(error instanceof Error ? error.message : "Upload failed");
      }
    },
    [setError]
  );

  const pollForCompletion = async (recordId: string) => {
    const maxAttempts = 60; // 2 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/topview/remove-background/status?taskRecordId=${recordId}`
        );
        const data = await response.json();

        if (data.status === "success" && data.bgRemovedImageFileId) {
          setProcessing(false);
          setIsCompleted(true);
          
          // Update context with workflow data
          setWorkflowData({
            taskRecordId: recordId,
            bgRemovedImageFileId: data.bgRemovedImageFileId,
            bgRemovedImageUrl: data.bgRemovedImageUrl,
          });

          setPreview(data.bgRemovedImageUrl);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          setProcessing(false);
          setError("Background removal timed out. Please try again.");
        }
      } catch (error) {
        setProcessing(false);
        setError("Failed to check status. Please try again.");
      }
    };

    poll();
  };

  const handleNext = () => {
    if (isCompleted) {
      nextStep();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    disabled: uploading || processing,
  });

  return (
    <div className="bg-card border border-border rounded-xl p-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Upload Product Image
      </h2>
      <p className="text-muted-foreground mb-6">
        Upload your product image to remove the background automatically
      </p>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
          ${
            isDragActive
              ? "border-brand-primary bg-brand-primary/5"
              : "border-border hover:border-brand-primary/50 hover:bg-sidebar/50"
          }
          ${(uploading || processing) && "opacity-50 cursor-not-allowed"}
        `}
      >
        <input {...getInputProps()} />

        {!preview && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-sidebar-accent flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-brand-primary" />
            </div>
            <div>
              <p className="text-foreground font-medium mb-1">
                {isDragActive
                  ? "Drop your image here"
                  : "Drag & drop or click to upload"}
              </p>
              <p className="text-sm text-muted-foreground">
                PNG, JPG, JPEG or WEBP (max 10MB)
              </p>
            </div>
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg"
            />
            {uploading && (
              <div className="flex items-center justify-center gap-2 text-brand-primary">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Uploading...</span>
              </div>
            )}
            {processing && (
              <div className="flex items-center justify-center gap-2 text-brand-primary">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Removing background...</span>
              </div>
            )}
            {isCompleted && (
              <div className="flex items-center justify-center gap-2 text-green-500 animate-celebration">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Background removed successfully!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next Button */}
      {isCompleted && (
        <div className="flex justify-end mt-6">
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 transition-all animate-fade-in"
          >
          Continue to Choose Avatar
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-sidebar border border-sidebar-border rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> For best results, use a clear product image
          with good lighting and minimal background clutter.
        </p>
      </div>
      
      <style>{`
        @keyframes celebration {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-celebration {
          animation: celebration 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}
