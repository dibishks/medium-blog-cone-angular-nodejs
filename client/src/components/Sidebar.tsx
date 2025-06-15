import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Sidebar() {
  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ["/api/tags"],
  });

  // Mock featured authors data - in a real app, this would come from an API
  const featuredAuthors = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe", 
      profileImageUrl: null,
      bio: "Tech enthusiast & writer"
    },
    {
      id: "2", 
      firstName: "Sarah",
      lastName: "Johnson",
      profileImageUrl: null,
      bio: "UX Designer & Blogger"
    },
    {
      id: "3",
      firstName: "Mike", 
      lastName: "Chen",
      profileImageUrl: null,
      bio: "Entrepreneur & Mentor"
    }
  ];

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="space-y-8">
      {/* Trending Topics */}
      <div className="bg-light-gray rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Trending Topics</h3>
        <div className="space-y-3">
          {tagsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))
          ) : tags?.length === 0 ? (
            <p className="text-secondary text-sm">No tags available</p>
          ) : (
            tags?.slice(0, 5).map((tag: string, index: number) => (
              <div key={tag} className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">{tag}</span>
                <span className="text-xs text-secondary">
                  {Math.floor(Math.random() * 200) + 50} posts
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Featured Authors */}
      <div className="bg-light-gray rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Featured Authors</h3>
        <div className="space-y-4">
          {featuredAuthors.map((author) => {
            const fullName = [author.firstName, author.lastName].filter(Boolean).join(' ');
            
            return (
              <div key={author.id} className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={author.profileImageUrl || undefined} alt={fullName} />
                  <AvatarFallback className="text-sm">
                    {getInitials(author.firstName, author.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link href={`/profile/${author.id}`}>
                    <h4 className="text-sm font-medium text-primary hover:text-accent cursor-pointer transition-colors">
                      {fullName}
                    </h4>
                  </Link>
                  <p className="text-xs text-secondary">{author.bio}</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  Follow
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
