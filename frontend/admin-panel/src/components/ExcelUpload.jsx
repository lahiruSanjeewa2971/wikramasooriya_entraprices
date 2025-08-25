import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream'
    ];
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));

    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
      toast.error('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setPreview(null);
    setResults(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await adminService.downloadExcelTemplate();
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'products_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download template');
      console.error('Template download error:', error);
    }
  };

  const validateFile = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setValidating(true);
    try {
      const formData = new FormData();
      formData.append('excel', file);

      const response = await adminService.validateExcel(formData);
      setPreview(response.data);
      toast.success('File validation completed!');
    } catch (error) {
      toast.error('File validation failed');
      console.error('Validation error:', error);
    } finally {
      setValidating(false);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('excel', file);

      const response = await adminService.uploadExcel(formData);
      setResults(response.data);
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('File upload failed');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Excel Upload</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload Excel files to create or update products in bulk
          </p>
        </div>
        <div className="text-right">
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Updated Template
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Updated template includes all current product fields
          </p>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <div className="text-red-500 font-bold text-lg">*</div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Required Fields</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fields marked with a red asterisk (*) must be filled in for each product row
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Required Fields:</h5>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• <span className="font-medium">SKU *</span> - Unique product identifier (2-50 characters)</li>
                  <li>• <span className="font-medium">Product Name *</span> - Product name (2-200 characters)</li>
                  <li>• <span className="font-medium">Price *</span> - Product price (must be {'>'} 0)</li>
                  <li>• <span className="font-medium">Stock Quantity *</span> - Available stock (≥ 0)</li>
                  <li>• <span className="font-medium">Category Name *</span> - Product category (will be created if doesn't exist)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Optional Fields:</h5>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Description - Detailed product description</li>
                  <li>• Short Description - Brief product summary (max 500 characters)</li>
                  <li>• Image URL - Direct link to product image</li>
                  <li>• Image Public ID - Cloudinary public ID for image management</li>
                  <li>• Featured - Mark as featured product (true/false)</li>
                  <li>• New Arrival - Mark as new arrival (true/false)</li>
                  <li>• Weight - Product weight in kg (decimal format)</li>
                  <li>• Dimensions - JSON format: {'{'}"length": 10, "width": 5, "height": 3{'}'}</li>
                  <li>• Active Status - Product availability (true/false)</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> For existing products (same SKU), the system will calculate a weighted average price 
                and add to the existing stock quantity. Categories will be automatically created if they don't exist.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            
            {!file ? (
              <>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Drop your Excel file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Supports .xlsx and .xls files up to 10MB
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  File Selected: {file.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex justify-center space-x-2">
                  <Button onClick={validateFile} disabled={validating}>
                    {validating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Validate File
                  </Button>
                  <Button onClick={clearFile} variant="outline">
                    Clear
                  </Button>
                </div>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {preview.total}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Rows</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {preview.valid}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Valid Rows</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {preview.invalid}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">Invalid Rows</div>
                </div>
              </div>

              {preview.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Validation Errors:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {preview.errors.map((error, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-medium">Row {error.row}</span>
                          {error.sku !== 'N/A' && (
                            <span className="text-gray-600 dark:text-gray-400"> (SKU: {error.sku})</span>
                          )}
                          <span className="text-red-600 dark:text-red-400">: {error.errors.join('; ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {preview.valid > 0 && (
                <div className="text-center">
                  <Button onClick={uploadFile} disabled={uploading} size="lg">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload {preview.valid} Valid Rows
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {results.total}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Rows</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {results.created}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Created</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {results.updated}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Updated</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {results.errors.length}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">Errors</div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Processing Errors:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-medium">Row {error.row}</span>
                          {error.sku !== 'N/A' && (
                            <span className="text-gray-600 dark:text-gray-400"> (SKU: {error.sku})</span>
                          )}
                          <span className="text-red-600 dark:text-red-400">: {error.error}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center">
                <Button onClick={clearFile} variant="outline">
                  Upload Another File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExcelUpload;
