import AdminLogin from '../AdminLogin';
import { useState } from 'react';

export default function AdminLoginExample() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleLogin = () => {
    console.log('Admin login triggered');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    console.log('Admin logout triggered');
    setIsAuthenticated(false);
  };

  const handleDataUpload = async (files: FileList) => {
    console.log('Data upload triggered with files:', files);
    setIsUploading(true);
    
    // todo: remove mock functionality - simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }
    
    setIsUploading(false);
    setUploadProgress(0);
    alert(`Successfully uploaded ${files.length} file(s)`);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Authentication System</h1>
      <AdminLogin
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onDataUpload={handleDataUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />
    </div>
  );
}