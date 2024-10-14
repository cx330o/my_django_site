"use client";
import { useEffect, useState } from "react";

interface WorkItem {
  id: string;
  menu: string;
  imageUrl: string;
  date: string;
}

export default function GalleryPage() {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => setWorks(data.works || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-8">
        Our Work ✨
      </h1>
      {works.length === 0 ? (
        <p className="text-center text-gray-400">No portfolio items yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {works.map((w) => (
            <div key={w.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
              <img src={w.imageUrl} alt={w.menu} className="w-full h-48 object-cover" />
              <div className="p-3">
                <span className="text-sm font-medium text-purple-600">{w.menu}</span>
                <span className="text-xs text-gray-400 block">{w.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
