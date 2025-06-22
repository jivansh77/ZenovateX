import React from 'react';
import { Copy } from 'lucide-react';

const FontPreview = ({ fontPairings, loading, brandName }) => {
  const copyFontInfo = () => {
    if (!fontPairings) return;
    
    const fontInfo = `Title Font: ${fontPairings.title}\nBody Font: ${fontPairings.body}`;
    navigator.clipboard.writeText(fontInfo);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="skeleton h-8 w-full"></div>
          <div className="skeleton h-6 w-4/5"></div>
          <div className="skeleton h-4 w-3/5"></div>
        </div>
        <div className="text-center opacity-50">Generating font pairings...</div>
      </div>
    );
  }

  if (!fontPairings) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🔤</div>
        <p className="opacity-50">Your font pairings will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Font Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Heading Font</h4>
          <div className="badge badge-outline">
            {fontPairings.title}
          </div>
        </div>
        
        <div className="space-y-2">
          <div 
            className="text-3xl font-bold"
            style={{ fontFamily: fontPairings.title || 'inherit' }}
          >
            {brandName || 'Your Brand Name'}
          </div>
          
          <div 
            className="text-xl font-semibold opacity-80"
            style={{ fontFamily: fontPairings.title || 'inherit' }}
          >
            Crafting Excellence in Every Detail
          </div>
          
          <div 
            className="text-lg font-medium opacity-70"
            style={{ fontFamily: fontPairings.title || 'inherit' }}
          >
            Section Heading Example
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* Body Font Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Body Font</h4>
          <div className="badge badge-outline">
            {fontPairings.body}
          </div>
        </div>
        
        <div className="space-y-3">
          <p 
            className="text-base leading-relaxed"
            style={{ fontFamily: fontPairings.body || 'inherit' }}
          >
            This is how your body text will look. It's designed to be highly readable 
            and complement your brand's personality while maintaining excellent legibility 
            across all devices and platforms.
          </p>
          
          <p 
            className="text-sm opacity-70"
            style={{ fontFamily: fontPairings.body || 'inherit' }}
          >
            This is smaller body text that might be used for captions, footnotes, 
            or secondary information throughout your brand materials.
          </p>
        </div>
      </div>

      {/* Font Pairing Info */}
      <div className="alert">
        <div>
          <h4 className="font-medium mb-2">Font Pairing Notes</h4>
          <div className="text-sm space-y-1">
            <p>• <strong>Heading Font:</strong> Use for titles, headings, and brand name</p>
            <p>• <strong>Body Font:</strong> Use for paragraphs, descriptions, and content</p>
            <p>• These fonts are carefully paired for optimal readability and brand consistency</p>
            <p>• Consider web-safe alternatives for digital use</p>
          </div>
        </div>
      </div>

      {/* Web Safe Alternatives */}
      {(fontPairings.titleFallback || fontPairings.bodyFallback) && (
        <div className="alert">
          <div>
            <h4 className="font-medium mb-2">Web Safe Alternatives</h4>
            <div className="text-sm space-y-1">
              {fontPairings.titleFallback && (
                <p>• <strong>Heading:</strong> {fontPairings.titleFallback}</p>
              )}
              {fontPairings.bodyFallback && (
                <p>• <strong>Body:</strong> {fontPairings.bodyFallback}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Copy Button */}
      <button
        onClick={copyFontInfo}
        className="btn btn-outline w-full gap-2"
      >
        <Copy className="w-4 h-4" />
        Copy Font Information
      </button>
    </div>
  );
};

export default FontPreview;