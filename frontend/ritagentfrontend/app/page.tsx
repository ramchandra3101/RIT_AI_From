'use client'

import { useState, useRef, FormEvent, ChangeEvent } from 'react'
import axios from 'axios'

export default function Home(): JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const airtableIframeRef = useRef<HTMLIFrameElement | null>(null)

  // Your Airtable embed URL
  const airtableEmbedUrl: string = "https://airtable.com/appj9mwmJYKJRI856/tblCgZVVFeoIk9Uru/viwnoIpIq7j7Wm1Wj?backgroundColor=blue&viewControls=on"

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setUploadSuccess(false)
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
      formData.append('file', file)
      
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Upload section - fixed at the top */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Airtable Data Viewer</h1>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto"
                >
                  {file ? file.name.slice(0, 20) + (file.name.length > 20 ? '...' : '') : "Select File"}
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isUploading || !file}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white w-full sm:w-auto ${
                  isUploading || !file 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isUploading ? 'Processing...' : 'Upload'}
              </button>
            </form>
          </div>
          
          {/* Notifications */}
          {error && (
            <div className="mt-3 bg-red-50 p-3 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {uploadSuccess && (
            <div className="mt-3 bg-green-50 p-3 rounded-md">
              <p className="text-sm text-green-700">
                File processed successfully! The latest data is highlighted below.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Airtable embed - takes up the rest of the screen */}
      <div className="w-full h-screen pt-16">
        <iframe
          ref={airtableIframeRef}
          className="w-full h-full border-0"
          src={airtableEmbedUrl}
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    </main>
  )
}