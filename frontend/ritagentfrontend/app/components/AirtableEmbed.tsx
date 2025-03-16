'use client'

import React from 'react'

interface AirtableEmbedProps {
  url: string
  height?: number
  backgroundColor?: string
}

const AirtableEmbed: React.FC<AirtableEmbedProps> = ({ 
  url, 
  height = 533, 
  backgroundColor = 'gray' 
}) => {
  // Remove /embed/ prefix if it exists
  const cleanUrl = url.replace('/embed/', '/');
  
  // Ensure the URL has the correct format for embedding
  const embedUrl = cleanUrl.includes('airtable.com/') 
    ? `https://airtable.com/embed/${cleanUrl.split('airtable.com/')[1]}?backgroundColor=${backgroundColor}`
    : `https://airtable.com/embed/${cleanUrl}?backgroundColor=${backgroundColor}`;

  return (
    <iframe 
      className="airtable-embed" 
      src={embedUrl}
      frameBorder="0" 
      width="100%" 
      height={height} 
      style={{ background: 'transparent', border: '1px solid #ccc' }}
      allow="fullscreen"
    ></iframe>
  )
}

export default AirtableEmbed
