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
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
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

  // Upload function with progress reporting
  const uploadFile = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Bypass CSRF token requirement in development mode
      if (process.env.NODE_ENV !== 'development' && !csrfToken) {
        reject(new Error('CSRF token not available'));
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {};
      // Only include CSRF token in production
      if (process.env.NODE_ENV !== 'development' && csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      fetch('/api/projects/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers,
      }).then(async response => {
        if (response.status === 403) {
          clearCsrfToken();
          reject(new Error('CSRF token invalid'));
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
          const error = new Error(errorData.error || 'Upload failed') as Error & { status?: number };
          error.status = response.status;
          reject(error);
          return;
        }

        // Read the SSE response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          reject(new Error('Unable to read response'));
          return;
        }

        let buffer = '';

        const processChunk = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              resolve();
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix

                  if (data.type === 'progress') {
                    setUploadProgress(Math.round((data.processed / data.total) * 100));
                  } else if (data.type === 'complete') {
                    setUploadProgress(100);
                    toast({
                      title: "Upload Completed",
                      description: `${data.successCount} successful, ${data.failureCount} failed out of ${data.totalCount} projects.`,
                    });
                    resolve();
                  } else if (data.type === 'error') {
                    reject(new Error(data.message || 'Upload failed'));
                  }
                } catch (error) {
                  console.error('Error parsing SSE data:', error);
                }
              }
            }

            processChunk();
          }).catch(error => {
            console.error('Error reading response:', error);
            reject(new Error('Connection lost during upload'));
          });
        };

        processChunk();
      }).catch(error => {
        reject(error);
      });
    });
  };

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
    setCurrentFileIndex(0);
    setTotalFiles(files.length);

    try {
      // Process files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);

        setCurrentFileIndex(i + 1);
        await uploadFile(file);

        // Invalidate and refetch projects to show the new data
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      }

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
      } else {
        toast({
          title: "Upload Failed",
          description: err.message || "An error occurred during upload",
          variant: "destructive",
        });
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentFileIndex(0);
      setTotalFiles(0);
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
      currentFileIndex={currentFileIndex}
      totalFiles={totalFiles}
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
