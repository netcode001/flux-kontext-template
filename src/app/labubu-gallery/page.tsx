import type { Metadata } from "next";
import { LabubuGalleryContent } from "@/components/labubu/LabubuGalleryContent";

export const metadata: Metadata = {
  title: "LabubuHub - Gallery | User Creations and AI Art",
  description: "Showcase of Labubu user creations, including AI-generated images, handmade works, and photography.",
  keywords: ["Labubu", "gallery", "AI art", "user creations", "photography"],
};

export default function LabubuGalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <LabubuGalleryContent />
    </div>
  )
} 