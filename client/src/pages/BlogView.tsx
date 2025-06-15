import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, MessageCircle, Edit3, Trash2 } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Blog, User } from "@shared/schema";

export default function BlogView() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blog, isLoading } = useQuery({
    queryKey: [`/api/blogs/${id}`],
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/blogs/${id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/blogs/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/blogs/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      setLocation("/");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <Skeleton className="h-4 w-16 mb-4" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex space-x-2 mb-8">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Blog not found</h1>
          <p className="text-secondary mb-8">The blog post you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const isAuthor = currentUser?.id === blog.authorId;
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'A';
  };

  const fullName = blog.author 
    ? [blog.author.firstName, blog.author.lastName].filter(Boolean).join(' ') || 'Anonymous'
    : 'Anonymous';

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <article className="max-w-4xl mx-auto p-8">
        {/* Navigation */}
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Title */}
          <h1 className="text-4xl font-bold text-primary mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Author and Meta */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={blog.author?.profileImageUrl || undefined} alt={fullName} />
                <AvatarFallback className="text-xs">
                  {getInitials(blog.author?.firstName, blog.author?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center space-x-2 text-sm text-secondary">
                <button 
                  className="font-medium text-primary hover:text-accent cursor-pointer"
                  onClick={() => setLocation(`/profile/${blog.authorId}`)}
                >
                  {fullName}
                </button>
                <span>·</span>
                <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
                <span>·</span>
                <span>{blog.readTime} min read</span>
              </div>
            </div>

            {/* Author Actions */}
            {isAuthor && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation(`/edit/${blog.id}`)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            )}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="mb-8">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none mb-12 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-8 border-t border-border">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className="flex items-center space-x-2 text-secondary hover:text-accent transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span>{blog.likes}</span>
            </button>
            <div className="flex items-center space-x-2 text-secondary">
              <MessageCircle className="w-5 h-5" />
              <span>0</span>
            </div>
          </div>

          <div className="text-sm text-secondary">
            Published on {new Date(blog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Author Bio */}
        {blog.author && (
          <div className="mt-12 p-6 bg-light-gray rounded-lg">
            <div className="flex items-start space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={blog.author.profileImageUrl || undefined} alt={fullName} />
                <AvatarFallback>
                  {getInitials(blog.author.firstName, blog.author.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-primary mb-2">{fullName}</h3>
                {blog.author.bio && (
                  <p className="text-secondary text-sm mb-3">{blog.author.bio}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation(`/profile/${blog.authorId}`)}
                >
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
