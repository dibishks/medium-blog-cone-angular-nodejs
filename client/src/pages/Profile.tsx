import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Blog, User } from "@shared/schema";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === id;

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: [`/api/users/${id}`],
  });

  const { data: userBlogs, isLoading: blogsLoading } = useQuery({
    queryKey: [`/api/users/${id}/blogs`],
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex items-start space-x-8 mb-12">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">User not found</h1>
          <p className="text-secondary">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Anonymous User';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto p-8">
        {/* Profile Header */}
        <div className="flex items-start space-x-8 mb-12">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.profileImageUrl || undefined} alt={fullName} />
            <AvatarFallback className="text-xl">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-primary">{fullName}</h1>
              {isOwnProfile && (
                <Button variant="outline">
                  Edit Profile
                </Button>
              )}
            </div>
            
            {user.bio && (
              <p className="text-secondary mb-4 leading-relaxed">
                {user.bio}
              </p>
            )}
            
            <div className="flex items-center space-x-6 text-sm text-secondary">
              <span>
                <strong className="text-primary">{userBlogs?.length || 0}</strong> Posts
              </span>
              <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <div>
          <h2 className="text-xl font-semibold text-primary mb-6">
            {isOwnProfile ? 'Your Posts' : `Posts by ${fullName}`}
          </h2>
          
          {blogsLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-b border-border pb-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex space-x-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : userBlogs?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary text-lg">
                {isOwnProfile ? "You haven't written any posts yet" : `${fullName} hasn't written any posts yet`}
              </p>
              {isOwnProfile && (
                <Button className="mt-4" onClick={() => window.location.href = '/write'}>
                  Write your first post
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {userBlogs?.map((blog: Blog & { author: User }) => (
                <BlogCard key={blog.id} blog={blog} showAuthor={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
