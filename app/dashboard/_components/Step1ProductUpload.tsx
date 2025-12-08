"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, Loader2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useVideoCreator } from "../../context/VideoCreatorContext";
import { toast } from "sonner";

type TabType = "url" | "upload";

interface ScrapedImage {
  fileId: string;
  fileName: string;
  fileUrl: string;
}

// Image card component with loading state
function ImageCard({ image, isSelected, isProcessing, onClick }: {
  image: ScrapedImage;
  isSelected: boolean;
  isProcessing: boolean;
  onClick: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 h-[120px] ${isSelected
        ? "border-brand-primary shadow-xl shadow-brand-primary/40 scale-105"
        : "border-border hover:border-brand-primary/50 hover:shadow-lg"
        } ${isProcessing ? "pointer-events-none" : ""}`}
    >
      {/* Image with shimmer loading */}
      <div className="relative w-full h-full">
        <img
          src={image.fileUrl}
          alt={image.fileName}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
        {/* Shimmer effect while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-sidebar">
            <div className="shimmer" />
          </div>
        )}
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
          <span className="text-xs text-white font-medium">Processing...</span>
        </div>
      )}

      {/* Selected checkmark */}
      {!isProcessing && isSelected && (
        <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function Step1ProductUpload() {
  const { workflowData, setWorkflowData, nextStep, setError } = useVideoCreator();

  const [activeTab, setActiveTab] = useState<TabType>("url");
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // URL scraper states
  const [productUrl, setProductUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [scrapedImages, setScrapedImages] = useState<ScrapedImage[]>([]);
  const [selectedScrapedImage, setSelectedScrapedImage] = useState<{
    fileId: string;
    fileName: string;
    fileUrl: string;
  } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if we already have completed data and restore previous state
  useEffect(() => {
    // Restore active tab
    if (workflowData.activeTab) {
      setActiveTab(workflowData.activeTab);
    }

    if (workflowData.bgRemovedImageUrl && workflowData.taskRecordId) {
      setPreview(workflowData.bgRemovedImageUrl);
      setIsCompleted(true);
      setImageLoaded(true); // Image already loaded from context
      if (workflowData.productName) {
        setProductName(workflowData.productName);
      }
    }

    // Restore URL scraper state
    if (workflowData.productUrl) {
      setProductUrl(workflowData.productUrl);
    }
    if (workflowData.scrapedImages) {
      setScrapedImages(workflowData.scrapedImages);
    }
    if (workflowData.selectedScrapedImage) {
      setSelectedScrapedImage(workflowData.selectedScrapedImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFetchUrl = async () => {
    setFetchingUrl(true);
    setError(null);

    try {
      // Submit scraper task
      const submitResponse = await fetch("/api/topview/scraper/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productLink: productUrl }),
      });

      const submitData = await submitResponse.json();

      if (!submitResponse.ok) {
        throw new Error(submitData.error || "Failed to submit scraper task");
      }

      const taskId = submitData.taskId;

      // Poll for scraper results
      await pollScraperTask(taskId);
    } catch (error) {
      setFetchingUrl(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch product data";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const pollScraperTask = async (taskId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/topview/scraper/query?taskId=${taskId}`);
        const data = await response.json();

        if (data.status === "success" && data.productImages && data.productImages.length > 0) {
          setFetchingUrl(false);
          setScrapedImages(data.productImages);
          toast.success(`Found ${data.productImages.length} product images!`);

          // Save to workflow context
          setWorkflowData({
            productUrl,
            scrapedImages: data.productImages,
            productName: data.productName || undefined,
          });

          // Auto-fill product name if available
          if (data.productName && !productName) {
            setProductName(data.productName);
          }
        } else if (data.status === "failed") {
          setFetchingUrl(false);
          const errorMsg = data.errorMsg || "Failed to scrape product data";
          setError(errorMsg);
          toast.error(errorMsg);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setFetchingUrl(false);
          setError("Scraping timed out. Please try again.");
          toast.error("Scraping timed out. Please try again.");
        }
      } catch {
        setFetchingUrl(false);
        setError("Failed to check scraper status");
        toast.error("Failed to check scraper status");
      }
    };

    poll();
  };

  const handleSelectScrapedImage = (image: ScrapedImage) => {
    setSelectedScrapedImage(image);
    // Reset states when selection changes
    setIsCompleted(false);
    setPreview(null);
    setError(null);

    // Save selected image to workflow context
    setWorkflowData({
      selectedScrapedImage: image,
    });
  };

  const handleRemoveBackground = async () => {
    if (!selectedScrapedImage) return;

    setProcessing(true);
    setError(null);

    try {
      // Submit background removal with the scraped image fileId
      const response = await fetch("/api/topview/remove-background/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productImageFileId: selectedScrapedImage.fileId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start background removal");
      }

      pollForCompletion(data.taskRecordId);
    } catch (error) {
      setProcessing(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to process image";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

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
        const credResponse = await fetch("/api/topview/upload/credentials");
        const credData = await credResponse.json();

        if (!credResponse.ok || credData.code !== "200") {
          throw new Error("Failed to get upload credentials");
        }

        const { uploadUrl, fileId } = credData.result;

        // Step 2: Upload file to S3
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

        // Step 3: Submit background removal
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
        toast.success("Image uploaded successfully!");

        setProcessing(true);

        pollForCompletion(data.taskRecordId);
      } catch (error) {
        setUploading(false);
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
    [setError]
  );

  const pollForCompletion = async (recordId: string) => {
    const maxAttempts = 60;
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
            productName: productName || undefined,
          });

          setImageLoaded(false); // Start loading animation
          setPreview(data.bgRemovedImageUrl);
          toast.success("Background removed successfully!");
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setProcessing(false);
          setError("Background removal timed out. Please try again.");
          toast.error("Background removal timed out. Please try again.");
        }
      } catch {
        setProcessing(false);
        setError("Failed to check status. Please try again.");
        toast.error("Failed to check status. Please try again.");
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
    <div className="bg-card border border-border rounded-xl p-4 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
        Upload Product Image
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-8">
        Fetch product images from URL or upload your own
      </p>

      {/* Premium Tabs */}
      <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-8 p-1 bg-sidebar rounded-lg">
        <button
          onClick={() => {
            setActiveTab("url");
            setWorkflowData({ activeTab: "url" });
          }}
          className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 font-medium rounded-md transition-all ${activeTab === "url"
            ? "bg-gradient-to-r from-brand-primary to-brand-primary-light text-white shadow-lg shadow-brand-primary/30"
            : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Product URL</span>
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab("upload");
            setWorkflowData({ activeTab: "upload" });
          }}
          className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 font-medium rounded-md transition-all ${activeTab === "upload"
            ? "bg-gradient-to-r from-brand-primary to-brand-primary-light text-white shadow-lg shadow-brand-primary/30"
            : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Upload Image</span>
          </div>
        </button>
      </div>

      {/* URL Tab Content */}
      {activeTab === "url" && (
        <div className="space-y-3 sm:space-y-6">
          <div className="flex gap-1 sm:gap-3">
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="Paste product URL (Amazon, etc.)..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-sidebar border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
              disabled={fetchingUrl}
            />
            <button
              onClick={handleFetchUrl}
              disabled={fetchingUrl || !productUrl.trim()}
              className="px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-brand-primary rounded-lg disabled:bg-brand-primary/50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {fetchingUrl && <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />}
              {fetchingUrl ? "Fetching..." : "Fetch"}
            </button>
          </div>

          {/* Scraped Images Grid */}
          {scrapedImages.length > 0 && (
            <div className="p-6 bg-gradient-to-br from-sidebar to-sidebar-accent rounded-xl border border-border">
              <p className="text-sm font-semibold text-foreground mb-4">
                Select a product image:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {scrapedImages.map((image) => (
                  <ImageCard
                    key={image.fileId}
                    image={image}
                    isSelected={selectedScrapedImage?.fileId === image.fileId}
                    isProcessing={false} // Removed processing overlay from individual cards
                    onClick={() => !processing && handleSelectScrapedImage(image)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Tab Content */}
      {activeTab === "upload" && (
        <div className="space-y-6">
          {/* Product Name Field - Only in Upload Tab */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Product Name (Optional)
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name..."
              className="w-full px-4 py-3 bg-sidebar border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
              disabled={processing || uploading}
            />
          </div>

          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
              ${isDragActive
                ? "border-brand-primary bg-gradient-to-br from-brand-primary/5 to-brand-primary/10"
                : "border-border hover:border-brand-primary/50 hover:bg-sidebar/50"
              }
              ${(uploading || processing) && "opacity-50 cursor-not-allowed"}
            `}
          >
            <input {...getInputProps()} />

            {!preview && !uploading && (
              <div className="space-y-3 sm:space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary-light/20 flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-brand-primary" />
                </div>
                <div>
                  <p className="text-foreground font-semibold mb-1 text-base sm:text-lg">
                    {isDragActive
                      ? "Drop your image here"
                      : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    PNG, JPG, JPEG or WEBP (max 10MB)
                  </p>
                </div>
              </div>
            )}

            {uploading && !preview && (
              <div className="space-y-3 sm:space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary-light/20 flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-brand-primary animate-spin" />
                </div>
                <div>
                  <p className="text-foreground font-semibold mb-1 text-base sm:text-lg">
                    Uploading your image...
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Please wait while we process your file
                  </p>
                </div>
              </div>
            )}
            {/* Preview image with fade-in animation */}
            {preview && (
              <div className={`space-y-4 transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}>
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-xl"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            )}
          </div>

          {/* Tip - Only in Upload Tab */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs sm:text-sm text-foreground">
              💡 <strong>Tip:</strong> For best results, use a clear product image
              with good lighting and minimal background clutter.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end mt-6 sm:mt-8">
        {/* Show Remove Background button when image is selected but not completed */}
        {activeTab === "url" && selectedScrapedImage && !isCompleted && (
          <button
            onClick={handleRemoveBackground}
            disabled={processing}
            className="px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Removing Background...
              </>
            ) : (
              "Remove Background"
            )}
          </button>
        )}

        {/* Show Continue button only when completed */}
        {isCompleted && (
          <button
            onClick={handleNext}
            className="px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
          >
            Continue to Choose Avatar
          </button>
        )}
      </div>


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
  if (!document.querySelector('#step1-shimmer-styles')) {
    style.id = 'step1-shimmer-styles';
    document.head.appendChild(style);
  }
}
