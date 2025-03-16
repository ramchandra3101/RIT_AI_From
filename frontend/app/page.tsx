'use client'

import React, { useState, useRef, FormEvent, ChangeEvent, DragEvent } from 'react'
import axios from 'axios'
import Logo from './components/Logo'
import dynamic from 'next/dynamic'

// Client-side only component for Airtable embed
const AirtableEmbed = dynamic(() => Promise.resolve(() => (
  <div className="mt-10">
    <iframe 
      className="airtable-embed" 
      src="https://airtable.com/embed/appj9mwmJYKJRI856/shrJJRHMMNRW80qAk?viewControls=on" 
      frameBorder="0" 
      width="100%" 
      height="533" 
      style={{ background: 'transparent', border: '1px solid #ccc' }}
    ></iframe>
  </div>
)), { ssr: false })

export default function Home(): React.ReactElement {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [progress, setProgress] = useState<{ total: number; processed: number }>({ total: 0, processed: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf')
      
      if (selectedFiles.length === 0) {
        setError('Only PDF files are allowed')
        return
      }
      
      if (e.target.files.length !== selectedFiles.length) {
        setError('Some files were filtered out. Only PDF files are allowed')
      } else {
        setError(null)
      }
      
      setFiles(selectedFiles)
      setUploadSuccess(false)
    }
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf')
      
      if (droppedFiles.length === 0) {
        setError('Only PDF files are allowed')
        return
      }
      
      if (e.dataTransfer.files.length !== droppedFiles.length) {
        setError('Some files were filtered out. Only PDF files are allowed')
      } else {
        setError(null)
      }
      
      setFiles(droppedFiles)
      setUploadSuccess(false)
    }
  }

  const processFile = async (file: File): Promise<boolean> => {
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      
      console.log(`Processing file: ${file.name}...`)
      
      // Use the ngrok URL directly instead of the proxy API route
      const response = await axios.post('https://5beb-136-24-163-114.ngrok-free.app/api/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // Add timeout and retry options
        timeout: 30000,
        withCredentials: false
      })
      
      console.log(`Response for ${file.name}:`, response.data)
      return true
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error)
      return false
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (!files.length) {
      setError('Please select at least one file to upload')
      return
    }

    try {
      setIsUploading(true)
      setError(null)
      setProgress({ total: files.length, processed: 0 })
      
      console.log(`Starting batch processing of ${files.length} files...`)
      
      const results = []
      for (let i = 0; i < files.length; i++) {
        const result = await processFile(files[i])
        results.push(result)
        setProgress(prev => ({ ...prev, processed: i + 1 }))
      }
      
      const successCount = results.filter(Boolean).length
      
      if (successCount === files.length) {
        setUploadSuccess(true)
        console.log('All files processed successfully!')
      } else if (successCount > 0) {
        setUploadSuccess(true)
        setError(`${successCount} of ${files.length} files processed successfully.`)
      } else {
        setError('Failed to process any files. Please try again.')
      }
      
      // Refresh the page to show the updated Airtable data
      if (successCount > 0) {
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      console.error('Error in batch upload:', error)
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          setError('Request timed out. Please try again.')
        } else if (error.response) {
          setError(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`)
        } else if (error.request) {
          setError('No response from server. Please check if the backend is running.')
        } else {
          setError(`Error: ${error.message}`)
        }
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removeFile = (index: number): void => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Logo />
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : files.length 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            style={{ minHeight: '240px' }}
          >
            <input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="application/pdf"
              multiple
            />
            
            <div className="text-center">
              {files.length > 0 ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900">{files.length} PDF file{files.length !== 1 ? 's' : ''} selected</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Total size: {(files.reduce((acc, file) => acc + file.size, 0) / 1024).toFixed(2)} KB
                  </p>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900">Drag and drop your PDF files here</p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                </>
              )}
            </div>
          </div>
          
          {/* File list */}
          {files.length > 0 && (
            <div className="mt-4 bg-white rounded-md shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {files.map((file, index) => (
                  <li key={index} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="text-gray-500 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4 flex justify-center">
            <button
              type="submit"
              disabled={isUploading || !files.length}
              className={`px-6 py-3 rounded-md shadow-sm text-base font-medium text-white transition-colors ${
                isUploading || !files.length 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing {progress.processed}/{progress.total} files...
                </div>
              ) : `Upload and Process ${files.length} PDF${files.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
        
        {/* Notifications */}
        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {uploadSuccess && (
          <div className="mb-6 bg-green-50 p-4 rounded-md">
            <div className="flex">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-green-700">
                Files processed successfully! The latest data is highlighted below.
              </p>
            </div>
          </div>
        )}
        
        {/* Airtable embed - client-side only */}
        <AirtableEmbed />
      </div>
    </main>
  )
}