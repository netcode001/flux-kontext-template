"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (term: string) => void;
}

export function SearchBar({ 
  placeholder = "搜索Labubu内容...", 
  className = "",
  onSearch 
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = useDebouncedCallback((term: string) => {
    // 如果有自定义搜索处理函数，使用它
    if (onSearch) {
      onSearch(term);
      return;
    }

    // 否则使用默认的URL参数搜索
    const params = new URLSearchParams(searchParams.toString());

    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }, 300);

  return (
    <div className={`relative mx-auto max-w-2xl ${className}`}>
      <div className="relative">
        <input
          type="text"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-pink-200 p-3 pl-10 shadow-sm outline-none 
                     focus:border-pink-400 focus:ring-2 focus:ring-pink-300 focus:ring-opacity-50
                     bg-white/90 backdrop-blur-sm
                     placeholder:text-gray-500
                     transition-all duration-200"
        />

        <Search className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-pink-400" />

        {isPending && (
          <div className="absolute right-3 top-3">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-pink-500"></div>
          </div>
        )}
      </div>
    </div>
  );
} 