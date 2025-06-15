import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle } from "lucide-react";
import type { Blog, User } from "@shared/schema";

interface BlogCardProps {
  blog: Blog & { author?: User };
  showAuthor?: boolean;
}

export default function BlogCard({ blog, showAuthor = true }: BlogCardProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'A';
  };

  const fullName = blog.author 
    ? [blog.author.firstName, blog.author.lastName].filter(Boolean).join(' ') || 'Anonymous'
    : 'Anonymous';

  return (
    <article className="border-b border-border pb-8 hover:bg-light-gray hover:bg-opacity-50 transition-colors rounded-lg p-4 -m-4">
      <div className="flex items-start space-x-4">
        {showAuthor && blog.author && (
          <Link href={`/profile/${blog.authorId}`}>
            <Avatar className="w-8 h-8 cursor-pointer">
              <AvatarImage src={blog.author.profileImageUrl || undefined} alt={fullName} />
              <AvatarFallback className="text-xs">
                {getInitials(blog.author.firstName, blog.author.lastName)}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}
        
        <div className="flex-1 min-w-0">
          {showAuthor && (
            <div className="flex items-center space-x-2 text-sm text-secondary mb-2">
              <Link href={`/profile/${blog.authorId}`}>
                <span className="font-medium text-primary hover:text-accent cursor-pointer transition-colors">
                  {fullName}
                </span>
              </Link>
              <span>·</span>
              <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>
          )}
          
          <div className="md:grid md:grid-cols-4 md:gap-6">
            <div className="md:col-span-3">
              <Link href={`/blog/${blog.id}`}>
                <h2 className="text-xl font-bold text-primary mb-2 hover:text-accent cursor-pointer transition-colors">
                  {blog.title}
                </h2>
              </Link>
              
              <p className="text-secondary mb-4 line-clamp-2">
                {blog.excerpt || (blog.content ? blog.content.substring(0, 200) + "..." : "")}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-secondary">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{blog.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>0</span>
                  </div>
                  <span>{blog.readTime} min read</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {blog.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {blog.tags && blog.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{blog.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {blog.featuredImage && (
              <div className="md:col-span-1 mt-4 md:mt-0">
                <Link href={`/blog/${blog.id}`}>
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="w-full h-20 md:h-16 object-cover rounded cursor-pointer"
                  />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
