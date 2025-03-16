'use client'

import React, { useState, useRef, FormEvent, ChangeEvent, DragEvent } from 'react'
import axios from 'axios'

export default function Home(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const airtableIframeRef = useRef<HTMLIFrameElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Your Airtable embed URL
  const airtableEmbedUrl: string = "https://airtable.com/appj9mwmJYKJRI856/tblCgZVVFeoIk9Uru/viwnoIpIq7j7Wm1Wj?backgroundColor=blue&viewControls=on"

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile)
        setError(null)
        setUploadSuccess(false)
      } else {
        setError('Only PDF files are allowed')
      }
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    try {
      setIsUploading(true)
      setError(null)
      
      const formData = new FormData()
      formData.append('pdf', file)
      
      // Call your existing backend API
      await axios.post('http://localhost:3000/api/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Set success state
      setUploadSuccess(true)
      
      // Refresh the Airtable iframe to show the updated data
      if (airtableIframeRef.current) {
        airtableIframeRef.current.src = airtableIframeRef.current.src
      }
      
      // Clear the file input
      setFile(null)
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(false)
      }, 5000)
      
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Failed to process the file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">RIT Form Extraction</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : file 
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
            />
            
            <div className="text-center">
              {file ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900">Drag and drop your PDF file here</p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <button
              type="submit"
              disabled={isUploading || !file}
              className={`px-6 py-3 rounded-md shadow-sm text-base font-medium text-white transition-colors ${
                isUploading || !file 
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
                  Processing...
                </div>
              ) : 'Upload and Process PDF'}
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
                File processed successfully! The latest data is highlighted below.
              </p>
            </div>
          </div>
        )}
        
        {/* Airtable embed - takes up the rest of the screen */}
        <div className="w-full h-screen border rounded-lg overflow-hidden">
          <iframe
            ref={airtableIframeRef}
            className="w-full h-full border-0"
            src={airtableEmbedUrl}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </main>
  )
}