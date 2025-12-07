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
  const [selectedScrapedImage, setSelectedScrapedImage] = useState<ScrapedImage | null>(null);

  // Check if we already have completed data and restore previous state
  useEffect(() => {
    // Restore active tab
    if (workflowData.activeTab) {
      setActiveTab(workflowData.activeTab);
    }

    if (workflowData.bgRemovedImageUrl && workflowData.taskRecordId) {
      setPreview(workflowData.bgRemovedImageUrl);
      setIsCompleted(true);
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
    if (!productUrl.trim()) {
      setError("Please enter a product URL");
      toast.error("Please enter a product URL");
      return;
    }

    const loadingToast = toast.loading("Fetching product data...");
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
      await pollScraperTask(taskId, loadingToast);
    } catch (error) {
      setFetchingUrl(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch product data";
      setError(errorMessage);
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  const pollScraperTask = async (taskId: string, toastId: string | number) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/topview/scraper/query?taskId=${taskId}`);
        const data = await response.json();

        if (data.status === "success" && data.productImages && data.productImages.length > 0) {
          setFetchingUrl(false);
          setScrapedImages(data.productImages);
          toast.success(`Found ${data.productImages.length} product images!`, { id: toastId });

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
          toast.error(errorMsg, { id: toastId });
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setFetchingUrl(false);
          setError("Scraping timed out. Please try again.");
          toast.error("Scraping timed out. Please try again.", { id: toastId });
        }
      } catch (error) {
        setFetchingUrl(false);
        setError("Failed to check scraper status");
        toast.error("Failed to check scraper status", { id: toastId });
      }
    };

    poll();
  };

  const handleSelectScrapedImage = async (image: ScrapedImage) => {
    setSelectedScrapedImage(image);
    const loadingToast = toast.loading("Removing background...");
    setProcessing(true);
    setError(null);

    // Save selected image to workflow context
    setWorkflowData({
      selectedScrapedImage: image,
    });

    try {
      // Submit background removal with the scraped image fileId
      const response = await fetch("/api/topview/remove-background/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productImageFileId: image.fileId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start background removal");
      }

      pollForCompletion(data.taskRecordId, loadingToast);
    } catch (error) {
      setProcessing(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to process image";
      setError(errorMessage);
      toast.error(errorMessage, { id: loadingToast });
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

      const uploadToast = toast.loading("Uploading image...");
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
        toast.success("Image uploaded successfully!", { id: uploadToast });

        const bgRemovalToast = toast.loading("Removing background...");
        setProcessing(true);

        pollForCompletion(data.taskRecordId, bgRemovalToast);
      } catch (error) {
        setUploading(false);
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setError(errorMessage);
        toast.error(errorMessage, { id: uploadToast });
      }
    },
    [setError]
  );

  const pollForCompletion = async (recordId: string, toastId: string | number) => {
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

          setPreview(data.bgRemovedImageUrl);
          toast.success("Background removed successfully!", { id: toastId });
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setProcessing(false);
          setError("Background removal timed out. Please try again.");
          toast.error("Background removal timed out. Please try again.", { id: toastId });
        }
      } catch (error) {
        setProcessing(false);
        setError("Failed to check status. Please try again.");
        toast.error("Failed to check status. Please try again.", { id: toastId });
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
      <p className="text-muted-foreground mb-8">
        Fetch product images from URL or upload your own
      </p>

      {/* Premium Tabs */}
      <div className="flex gap-3 mb-8 p-1 bg-sidebar rounded-lg">
        <button
          onClick={() => {
            setActiveTab("url");
            setWorkflowData({ activeTab: "url" });
          }}
          className={`flex-1 px-6 py-3 font-medium rounded-md transition-all ${activeTab === "url"
            ? "bg-gradient-to-r from-brand-primary to-brand-primary-light text-white shadow-lg shadow-brand-primary/30"
            : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            }`}
        >
          <div className="flex items-center justify-center gap-2">
            <LinkIcon className="w-5 h-5" />
            <span>Product URL</span>
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab("upload");
            setWorkflowData({ activeTab: "upload" });
          }}
          className={`flex-1 px-6 py-3 font-medium rounded-md transition-all ${activeTab === "upload"
            ? "bg-gradient-to-r from-brand-primary to-brand-primary-light text-white shadow-lg shadow-brand-primary/30"
            : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ImageIcon className="w-5 h-5" />
            <span>Upload Image</span>
          </div>
        </button>
      </div>

      {/* URL Tab Content */}
      {activeTab === "url" && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="Paste product URL (Amazon, etc.)..."
              className="flex-1 px-4 py-3 bg-sidebar border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
              disabled={fetchingUrl}
            />
            <button
              onClick={handleFetchUrl}
              disabled={fetchingUrl || !productUrl.trim()}
              className="px-8 py-3 btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {fetchingUrl && <Loader2 className="w-5 h-5 animate-spin" />}
              {fetchingUrl ? "Fetching..." : "Fetch"}
            </button>
          </div>

          {/* Scraped Images Grid */}
          {scrapedImages.length > 0 && (
            <div className="p-6 bg-gradient-to-br from-sidebar to-sidebar-accent rounded-xl border border-border">
              <p className="text-sm font-semibold text-foreground mb-4">
                Select a product image:
              </p>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {scrapedImages.map((image) => (
                  <div
                    key={image.fileId}
                    onClick={() => !processing && handleSelectScrapedImage(image)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 h-[120px] ${selectedScrapedImage?.fileId === image.fileId
                      ? "border-brand-primary shadow-xl shadow-brand-primary/40 scale-105"
                      : "border-border hover:border-brand-primary/50 hover:shadow-lg"
                      } ${processing && selectedScrapedImage?.fileId === image.fileId ? "pointer-events-none" : ""}`}
                  >
                    <img
                      src={image.fileUrl}
                      alt={image.fileName}
                      className="w-full h-full object-cover"
                    />
                    {processing && selectedScrapedImage?.fileId === image.fileId && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                        <span className="text-xs text-white font-medium">Processing...</span>
                      </div>
                    )}
                    {!processing && selectedScrapedImage?.fileId === image.fileId && (
                      <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
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
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary-light/20 flex items-center justify-center mx-auto">
                  <Upload className="w-10 h-10 text-brand-primary" />
                </div>
                <div>
                  <p className="text-foreground font-semibold mb-1 text-lg">
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

            {uploading && !preview && (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary-light/20 flex items-center justify-center mx-auto">
                  <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                </div>
                <div>
                  <p className="text-foreground font-semibold mb-1 text-lg">
                    Uploading your image...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we process your file
                  </p>
                </div>
              </div>
            )}

            {preview && (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-xl"
                />
              </div>
            )}
          </div>

          {/* Tip - Only in Upload Tab */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-foreground">
              💡 <strong>Tip:</strong> For best results, use a clear product image
              with good lighting and minimal background clutter.
            </p>
          </div>
        </div>
      )}

      {/* Next Button */}
      {isCompleted && (
        <div className="flex justify-end mt-8">
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-primary-light text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-brand-primary/40 transition-all"
          >
            Continue to Choose Avatar
          </button>
        </div>
      )}


    </div>
  );
}
