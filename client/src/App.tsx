import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "@/pages/not-found";
import UrlParamsTest from "@/pages/url-params-test";
import UrlDebug from "@/pages/url-debug";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCsrf } from "@/hooks/useCsrf";
import { isUnauthorizedError } from "@/lib/authUtils";
import { clearCsrfToken } from "@/lib/csrfUtils";
import { apiRequest } from "./lib/queryClient";
import type { Project } from "@shared/schema";


function DashboardPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { csrfToken, isLoading: csrfLoading } = useCsrf();

  // Fetch projects from the database
  const { 
    data: projects = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: true
  });

  // Upload mutation with proper auth and CSRF handling
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!csrfToken) {
        throw new Error('CSRF token not available');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
      
      // Clear CSRF token on 403 to force refresh
      if (response.status === 403) {
        clearCsrfToken();
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Upload failed') as Error & { status?: number };
        error.status = response.status;
        throw error;
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${data.count} projects to the database.`,
      });
      // Invalidate and refetch projects to show the new data
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
    onError: (error: Error & { status?: number }) => {
      console.error('Upload error:', error);
      
      if (error.status === 401 || isUnauthorizedError(error)) {
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
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const handleDataUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    console.log('Data upload triggered with files:', files);
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadPromises = Array.from(files).map((file, index) => {
        return new Promise<void>((resolve, reject) => {
          uploadMutation.mutate(file, {
            onSuccess: () => {
              setUploadProgress(Math.round(((index + 1) / files.length) * 100));
              resolve();
            },
            onError: (error) => {
              reject(error);
            }
          });
        });
      });
      
      await Promise.all(uploadPromises);
      
      toast({
        title: "All Files Processed",
        description: `Successfully processed all ${files.length} file(s).`,
      });
    } catch (error) {
      console.error('Upload process failed:', error);
      const err = error as Error & { status?: number };
      if (err.status === 401 || isUnauthorizedError(err)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Show error state if there's an error loading projects
  if (error) {
    console.error('Error loading projects:', error);
  }

  return (
    <DashboardLayout
      projects={projects}
      isLoading={isLoading || authLoading || csrfLoading}
      isAuthenticated={isAuthenticated}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onDataUpload={handleDataUpload}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
    />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/test-url-params" component={UrlParamsTest} />
      <Route path="/url-debug*" component={UrlDebug} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
