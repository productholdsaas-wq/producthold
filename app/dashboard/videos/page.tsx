import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserVideos } from "@/app/actions/get-user-videos";
import { Video, Calendar, Download, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";

export default async function MyVideosPage() {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!email) {
        redirect("/sign-in");
    }

    const videos = await getUserVideos(email);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Videos</h1>
                    <p className="text-muted-foreground">
                        Manage and download your generated videos
                    </p>
                </div>
                <Link
                    href="/dashboard/create"
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary-light transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2 w-fit"
                >
                    <Video className="w-4 h-4" />
                    Create New Video
                </Link>
            </div>

            {videos.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-card border border-border shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-sidebar-accent flex items-center justify-center mx-auto mb-4">
                        <Video className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        No videos yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        Create your first AI-powered product video today!
                    </p>
                    <Link
                        href="/dashboard/create"
                        className="px-6 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary-light transition-all"
                    >
                        Create Video
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className="group rounded-xl bg-card border border-border overflow-hidden hover:border-brand-primary/50 transition-all shadow-sm hover:shadow-md"
                        >
                            {/* Thumbnail / Video Preview */}
                            <div className="aspect-[9/16] relative bg-sidebar-accent group-hover:bg-sidebar-accent/80 transition-colors">
                                {video.videoCoverUrl ? (
                                    <img
                                        src={video.videoCoverUrl}
                                        alt={video.productName || "Video thumbnail"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                        <Video className="w-12 h-12 text-muted-foreground/50 mb-2" />
                                        {video.status === "processing" && (
                                            <span className="text-xs font-medium text-brand-primary animate-pulse">
                                                Generating...
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Overlay Status Badge */}
                                <div className="absolute top-3 right-3">
                                    {video.status === "completed" && (
                                        <div className="px-2 py-1 rounded-md bg-green-500/90 text-white text-xs font-medium backdrop-blur-sm shadow-sm">
                                            Completed
                                        </div>
                                    )}
                                    {(video.status === "processing" || video.status === "pending") && (
                                        <div className="px-2 py-1 rounded-md bg-amber-500/90 text-white text-xs font-medium backdrop-blur-sm shadow-sm flex items-center gap-1">
                                            <RefreshCw className="w-3 h-3 animate-spin" />
                                            Processing
                                        </div>
                                    )}
                                    {video.status === "failed" && (
                                        <div className="px-2 py-1 rounded-md bg-red-500/90 text-white text-xs font-medium backdrop-blur-sm shadow-sm">
                                            Failed
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-3">
                                <div>
                                    <h3 className="font-semibold text-foreground truncate" title={video.productName || "Untitled Video"}>
                                        {video.productName || "Untitled Video"}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <Calendar className="w-3 h-3" />
                                        {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Unknown date'}
                                    </div>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-2 py-2 border-t border-border/50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</span>
                                        <span className="text-xs font-medium text-foreground">{video.duration || "--:--"}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-2 flex items-center gap-2">
                                    {video.status === "completed" && video.videoUrl ? (
                                        <>
                                            <a
                                                href={video.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-brand-primary text-white text-xs font-medium hover:bg-brand-primary-light transition-all"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                View
                                            </a>
                                            <a
                                                href={video.videoUrl}
                                                download
                                                className="flex items-center justify-center p-2 rounded-lg bg-sidebar-accent text-sidebar-foreground border border-sidebar-border hover:bg-sidebar-accent/80 transition-all"
                                                title="Download"
                                            >
                                                <Download className="w-3 h-3" />
                                            </a>
                                        </>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent text-muted-foreground text-xs font-medium opacity-50 cursor-not-allowed"
                                        >
                                            {video.status === "failed" ? "Generation Failed" : "Processing..."}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
