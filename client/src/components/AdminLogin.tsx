import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, LogIn, Upload, Database, Key, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AdminLoginProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onDataUpload: (files: FileList) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  currentFileIndex?: number;
  totalFiles?: number;
}

export default function AdminLogin({
  isAuthenticated,
  onLogin,
  onLogout,
  onDataUpload,
  isUploading = false,
  uploadProgress = 0,
  currentFileIndex = 0,
  totalFiles = 0
}: AdminLoginProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log('Files dropped:', e.dataTransfer.files);
      onDataUpload(e.dataTransfer.files);
      setShowUploadDialog(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      console.log('Files selected:', e.target.files);
      onDataUpload(e.target.files);
      setShowUploadDialog(false);
    }
  };

  if (!isAuthenticated && process.env.NODE_ENV !== 'development') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Admin Access Required</CardTitle>
          <CardDescription>
            Secure authentication required for data management operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={onLogin}
            className="w-full"
            data-testid="button-admin-login"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login with Replit Auth
          </Button>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Key className="h-3 w-3" />
              Protected by Replit Authentication
            </div>
            <p>Only authorized administrators can access data upload and management features.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Admin Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Admin Authenticated</p>
                <p className="text-sm text-muted-foreground">You have administrative privileges</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              data-testid="button-admin-logout"
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Management
          </CardTitle>
          <CardDescription>
            Upload and manage DPWH project data with secure JSON validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="w-full"
            disabled={isUploading}
            data-testid="button-open-upload"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading
              ? totalFiles > 1
                ? `Uploading file ${currentFileIndex} of ${totalFiles}... ${uploadProgress}%`
                : `Uploading... ${uploadProgress}%`
              : 'Upload Project Data'
            }
          </Button>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-foreground">Supported Formats:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• JSON files (.json)</li>
                <li>• Maximum 10MB per file</li>
                <li>• Schema validation included</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground">Security Features:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Admin-only access</li>
                <li>• Data validation</li>
                <li>• Audit logging</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Project Data</DialogTitle>
            <DialogDescription>
              Upload JSON files containing DPWH project data. Files will be validated against the schema.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Drop JSON files here</p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <input
                type="file"
                accept=".json"
                multiple
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                data-testid="input-file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Select Files
                </label>
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Schema Requirements:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>contractId (required) - Unique project identifier</li>
                <li>contractName (required) - Project name/description</li>
                <li>contractor (required) - Implementing contractor</li>
                <li>status (required) - "Completed" or "On-going"</li>
                <li>region, province, municipality, barangay (location data)</li>
                <li>contractCost (number) - Project cost in PHP</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
