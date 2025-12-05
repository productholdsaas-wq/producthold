"use client";

import VideoCreator from "../_components/VideoCreator";

export default function CreateVideoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Create AI Video
        </h1>
        <p className="text-muted-foreground">
          Generate professional UGC videos in minutes with AI
        </p>
      </div>

      <VideoCreator />
    </div>
  );
}
