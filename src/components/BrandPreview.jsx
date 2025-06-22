import React from 'react';
import LogoDisplay from './LogoDisplay';
import ColorPalette from './ColorPalette';
import FontPreview from './FontPreview';
import { RefreshCw } from 'lucide-react';

const BrandPreview = ({ brandKit, loading, onRegenerate, formData }) => {
  // Safely check if brandKit exists and has content
  const hasAnyContent = brandKit && (
    brandKit.logo || 
    (brandKit.colorPalette && brandKit.colorPalette.length > 0) || 
    brandKit.fontPairings || 
    brandKit.brandTone
  );

  // Show placeholder if no content and not loading
  if (!hasAnyContent && !loading.overall) {
    return (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body text-center">
          <div className="text-6xl opacity-30 mb-4">
            📋
          </div>
          <h3 className="card-title justify-center">Your Brand Kit Preview</h3>
          <p className="opacity-70">Fill out the form and click "Generate Brand Kit" to see your brand identity come to life.</p>
        </div>
      </div>
    );
  }

  // If brandKit doesn't exist yet, show placeholder
  if (!brandKit) {
    return (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body text-center">
          <div className="text-6xl opacity-30 mb-4">
            📋
          </div>
          <h3 className="card-title justify-center">Your Brand Kit Preview</h3>
          <p className="opacity-70">Fill out the form and click "Generate Brand Kit" to see your brand identity come to life.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-title">Logo</h3>
            <button
              onClick={() => onRegenerate('logo')}
              disabled={loading.logo}
              className={`btn btn-ghost btn-sm ${loading.logo ? 'loading' : ''}`}
            >
              {!loading.logo && <RefreshCw className="w-4 h-4 mr-2" />}
              Regenerate
            </button>
          </div>
          
          <LogoDisplay 
            logo={brandKit.logo} 
            loading={loading.logo}
            brandName={formData.brandName}
          />
        </div>
      </div>

      {/* Color Palette Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-title">Color Palette</h3>
            <button
              onClick={() => onRegenerate('colors')}
              disabled={loading.colors}
              className={`btn btn-ghost btn-sm ${loading.colors ? 'loading' : ''}`}
            >
              {!loading.colors && <RefreshCw className="w-4 h-4 mr-2" />}
              Regenerate
            </button>
          </div>
          
          <ColorPalette 
            colors={brandKit.colorPalette || []} 
            loading={loading.colors}
          />
        </div>
      </div>

      {/* Font Pairings Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-title">Font Pairings</h3>
            <button
              onClick={() => onRegenerate('fonts')}
              disabled={loading.fonts}
              className={`btn btn-ghost btn-sm ${loading.fonts ? 'loading' : ''}`}
            >
              {!loading.fonts && <RefreshCw className="w-4 h-4 mr-2" />}
              Regenerate
            </button>
          </div>
          
          <FontPreview 
            fontPairings={brandKit.fontPairings} 
            loading={loading.fonts}
            brandName={formData.brandName}
          />
        </div>
      </div>

      {/* Brand Tone Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-title">Brand Tone & Voice</h3>
            <button
              onClick={() => onRegenerate('tone')}
              disabled={loading.tone}
              className={`btn btn-ghost btn-sm ${loading.tone ? 'loading' : ''}`}
            >
              {!loading.tone && <RefreshCw className="w-4 h-4 mr-2" />}
              Regenerate
            </button>
          </div>
          
          {loading.tone ? (
            <div className="space-y-2">
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-4/5"></div>
              <div className="skeleton h-4 w-3/5"></div>
            </div>
          ) : brandKit.brandTone ? (
            <div className="prose prose-sm max-w-none">
              <p className="leading-relaxed">{brandKit.brandTone}</p>
            </div>
          ) : (
            <div className="text-center py-4 opacity-50">
              Brand tone will appear here after generation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandPreview;