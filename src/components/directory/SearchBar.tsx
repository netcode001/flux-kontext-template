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
          className="w-full rounded-xl border-2 border-pink-200 p-4 pl-12  outline-none 
                     focus:border-pink-400 focus:ring-4 focus:ring-pink-100 focus:ring-opacity-60
                     bg-white/95 backdrop-blur-sm
                     placeholder:text-gray-500 placeholder:font-medium
                     transition-all duration-300 hover:
                     text-gray-700 font-medium"
        />

        <Search className="absolute inset-y-0 left-4 my-auto h-5 w-5 text-pink-500" />

        {isPending && (
          <div className="absolute right-4 top-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-pink-200 border-t-pink-500"></div>
          </div>
        )}
      </div>
    </div>
  );
} 