import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { insertBlogSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

const writeFormSchema = insertBlogSchema.extend({
  tagInput: z.string().optional(),
});

type WriteFormData = z.infer<typeof writeFormSchema>;

export default function Write() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState(false);

  const isEditing = Boolean(id);

  // Fetch blog data if editing
  const { data: blogData, isLoading } = useQuery({
    queryKey: [`/api/blogs/${id}`],
    enabled: isEditing,
  });

  const form = useForm<WriteFormData>({
    resolver: zodResolver(writeFormSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      tags: [],
      published: false,
    },
  });

  // Update form when blog data loads
  useEffect(() => {
    if (blogData && isEditing) {
      const blog = blogData as any;
      form.reset({
        title: blog.title || "",
        content: blog.content || "",
        excerpt: blog.excerpt || "",
        tags: blog.tags || [],
        published: blog.published || false,
      });
    }
  }, [blogData, isEditing, form]);

  const createMutation = useMutation({
    mutationFn: async (data: WriteFormData) => {
      const { tagInput, ...blogData } = data;
      return apiRequest("POST", "/api/blogs", blogData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog post created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: WriteFormData) => {
      const { tagInput, ...blogData } = data;
      return apiRequest("PUT", `/api/blogs/${id}`, blogData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog post updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/blogs/${id}`] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update blog post",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: WriteFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !form.getValues("tags")?.includes(tagInput.trim())) {
      const currentTags = form.getValues("tags") || [];
      form.setValue("tags", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreview(!preview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {preview ? "Edit" : "Preview"}
            </Button>
            <Button
              type="submit"
              form="write-form"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                console.log("Publish button clicked");
                console.log("Form state:", form.formState);
                console.log("Form values:", form.getValues());
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              {createMutation.isPending || updateMutation.isPending 
                ? "Saving..." 
                : isEditing ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <div className="max-w-4xl mx-auto p-8">
        {preview ? (
          // Preview Mode
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold mb-4">{form.watch("title") || "Untitled"}</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {form.watch("tags")?.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: form.watch("content") || "" }}
            />
          </div>
        ) : (
          // Edit Mode
          <Form {...form}>
            <form id="write-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Title"
                        className="text-4xl font-bold border-none text-primary placeholder-secondary p-0 focus:ring-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Write a brief description..."
                        className="resize-none"
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <div className="space-y-2">
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.watch("tags")?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        content={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Publish immediately
                      </FormLabel>
                      <div className="text-sm text-secondary">
                        Make this post visible to everyone
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
