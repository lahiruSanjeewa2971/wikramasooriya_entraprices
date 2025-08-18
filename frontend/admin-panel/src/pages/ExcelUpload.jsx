import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import adminService from '../services/adminService';

export default function ExcelUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);

  const uploadMutation = useMutation({
    mutationFn: adminService.uploadExcel,
    onSuccess: (data) => {
      setUploadResult({
        success: true,
        message: 'Excel file uploaded successfully!',
        data: data
      });
      setSelectedFile(null);
      setUploadProgress(0);
    },
    onError: (error) => {
      setUploadResult({
        success: false,
        message: error.message || 'Upload failed. Please try again.',
        data: null
      });
      setUploadProgress(0);
    }
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is Excel
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls',
        '.xlsx'
      ];
      
      if (validTypes.includes(file.type) || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        alert('Please select a valid Excel file (.xls or .xlsx)');
        event.target.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadProgress(10);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await uploadMutation.mutateAsync(selectedFile);
      
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
      
      clearInterval(progressInterval);
    } catch (error) {
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    // Create a sample Excel template
    const templateData = [
      ['SKU', 'Name', 'Description', 'Price', 'Stock Quantity', 'Category', 'Is Active'],
      ['SKU001', 'Sample Product', 'This is a sample product description', '99.99', '100', 'Electronics', 'true'],
      ['SKU002', 'Another Product', 'Another sample product', '149.99', '50', 'Tools', 'true']
    ];

    let csvContent = "data:text/csv;charset=utf-8,";
    templateData.forEach(row => {
      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "product_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Excel Upload</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload Excel files to bulk create or update products
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
          How to use Excel Upload
        </h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>• Download the template below to see the required format</p>
          <p>• Ensure your Excel file has the correct column headers</p>
          <p>• SKU must be unique for each product</p>
          <p>• Categories must exist in the system before uploading</p>
          <p>• Supported formats: .xls, .xlsx</p>
        </div>
      </div>

      {/* Template Download */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Download Template
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get the Excel template with the correct format and sample data
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Upload Excel File
        </h3>
        
        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Excel File
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-blue-50 file:text-blue-700
                          dark:file:bg-blue-900/20 dark:file:text-blue-300
                          hover:file:bg-blue-100 dark:hover:file:bg-blue-900/40"
              />
            </div>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending || uploadProgress > 0}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className={`rounded-lg p-6 ${
          uploadResult.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start space-x-3">
            {uploadResult.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div>
              <h3 className={`text-lg font-medium ${
                uploadResult.success 
                  ? 'text-green-900 dark:text-green-100' 
                  : 'text-red-900 dark:text-red-100'
              }`}>
                {uploadResult.success ? 'Upload Successful!' : 'Upload Failed'}
              </h3>
              <p className={`mt-1 text-sm ${
                uploadResult.success 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {uploadResult.message}
              </p>
              
              {uploadResult.success && uploadResult.data && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/40 rounded-md">
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                    Upload Summary:
                  </h4>
                  <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    {uploadResult.data.productsCreated && (
                      <p>• Products Created: {uploadResult.data.productsCreated}</p>
                    )}
                    {uploadResult.data.productsUpdated && (
                      <p>• Products Updated: {uploadResult.data.productsUpdated}</p>
                    )}
                    {uploadResult.data.errors && uploadResult.data.errors.length > 0 && (
                      <div>
                        <p>• Errors: {uploadResult.data.errors.length}</p>
                        <ul className="ml-4 mt-1 space-y-1">
                          {uploadResult.data.errors.slice(0, 3).map((error, index) => (
                            <li key={index} className="text-xs">- {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Requirements */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100">
              Important Notes
            </h3>
            <div className="mt-2 text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <p>• Maximum file size: 10MB</p>
              <p>• First row must contain column headers</p>
              <p>• SKU field is required and must be unique</p>
              <p>• Price should be a valid number</p>
              <p>• Stock quantity should be a positive integer</p>
              <p>• Category names must match existing categories exactly</p>
              <p>• Is Active should be 'true' or 'false'</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
