import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import BlogCard from "@/components/BlogCard";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Blog } from "@shared/schema";

export default function Home() {
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: blogs, isLoading } = useQuery({
    queryKey: ["/api/blogs", { page: currentPage, tag: selectedTag !== "all" ? selectedTag : undefined }],
  });

  const { data: tags } = useQuery({
    queryKey: ["/api/tags"],
  });

  const handleTagFilter = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-8">
              
              {/* Tag Filter Bar */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTag === "all" ? "default" : "secondary"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleTagFilter("all")}
                  >
                    All
                  </Button>
                  {tags?.map((tag: string) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "secondary"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => handleTagFilter(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Blog Feed */}
              <div className="space-y-8">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border-b border-border pb-8">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <div className="flex space-x-4">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : blogs?.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-secondary text-lg">No blogs found</p>
                    <p className="text-secondary text-sm mt-2">
                      {selectedTag !== "all" 
                        ? "Try selecting a different tag or view all posts" 
                        : "Be the first to write a blog post!"}
                    </p>
                  </div>
                ) : (
                  blogs?.map((blog: Blog & { author: any }) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))
                )}
              </div>

              {/* Pagination - Simple for now */}
              {blogs && blogs.length > 0 && (
                <div className="mt-12 flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 mt-12 lg:mt-0">
              <Sidebar />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
