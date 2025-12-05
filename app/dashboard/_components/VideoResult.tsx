"use client";

import { useState } from "react";
import { Download, Share2, Video, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useVideoCreator } from "../../context/VideoCreatorContext";

export default function VideoResult() {
  const { workflowData, resetWorkflow } = useVideoCreator();
  const [downloading, setDownloading] = useState(false);
  
  const videoUrl = workflowData.finishedVideoUrl!;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `product-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Video downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download video");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(videoUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="bg-card border border-border rounded-xl p-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Video Ready! 🎉
        </h2>
        <p className="text-muted-foreground">
          Your AI-powered UGC video has been generated successfully
        </p>
      </div>

      {/* Video Player */}
      <div className="mb-8">
        <div className="aspect-video bg-sidebar rounded-xl overflow-hidden border border-border">
          <video
            src={videoUrl}
            controls
            className="w-full h-full"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-light transition-all disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          {downloading ? "Downloading..." : "Download Video"}
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-sidebar border border-border text-foreground rounded-lg font-semibold hover:border-brand-primary/50 transition-all"
        >
          <Share2 className="w-5 h-5" />
          Copy Link
        </button>

        <button
          onClick={resetWorkflow}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-sidebar border border-border text-foreground rounded-lg font-semibold hover:border-brand-primary/50 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          Create Another
        </button>
      </div>

      {/* Stats/Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-sidebar border border-sidebar-border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Format</p>
              <p className="text-sm font-semibold text-foreground">MP4 Video</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-sidebar border border-sidebar-border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Credits Used</p>
              <p className="text-sm font-semibold text-foreground">1 Credit</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-sidebar border border-sidebar-border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quality</p>
              <p className="text-sm font-semibold text-foreground">Pro Mode</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-400">
          💡 <strong>Tip:</strong> Share this video on your social media or use it
          in your marketing campaigns to boost engagement!
        </p>
      </div>
    </div>
  );
}
