import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PenTool, Search, ChevronDown } from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const fullName = user 
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User'
    : 'User';

  return (
    <header className="border-b border-border bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer hover:text-accent transition-colors">
                BlogHub
              </h1>
            </Link>
          </div>
          
          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-secondary hover:text-primary transition-colors">
                Home
              </Link>
              <Button
                onClick={() => setLocation("/write")}
                className="bg-accent text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
              >
                <PenTool className="w-4 h-4 mr-2" />
                Write
              </Button>
            </nav>
          )}
          
          {/* User Menu */}
          {isAuthenticated && user && (
            <div className="flex items-center space-x-4">
              <button className="text-secondary hover:text-primary">
                <Search className="w-5 h-5" />
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 text-secondary hover:text-primary">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={fullName} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setLocation(`/profile/${user.id}`)}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/write")}>
                    Write
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
