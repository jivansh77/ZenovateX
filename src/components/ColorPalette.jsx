import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const ColorPalette = ({ colors, loading }) => {
  const [copiedColor, setCopiedColor] = useState(null);

  const copyToClipboard = (hexCode) => {
    navigator.clipboard.writeText(hexCode).then(() => {
      setCopiedColor(hexCode);
      setTimeout(() => setCopiedColor(null), 2000);
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton w-full h-20"></div>
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-3 w-3/4"></div>
            </div>
          ))}
        </div>
        <div className="text-center opacity-50">Generating your color palette...</div>
      </div>
    );
  }

  if (!colors || colors.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🎨</div>
        <p className="opacity-50">Your color palette will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {colors.map((color, index) => (
          <div key={index} className="group">
            <div
              className="w-full h-20 rounded-lg shadow-sm border cursor-pointer transition-transform hover:scale-105 tooltip"
              style={{ backgroundColor: color.hex }}
              onClick={() => copyToClipboard(color.hex)}
              data-tip="Click to copy"
            />
            
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {color.name || `Color ${index + 1}`}
                </span>
                <button
                  onClick={() => copyToClipboard(color.hex)}
                  className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100"
                  title="Copy hex code"
                >
                  {copiedColor === color.hex ? (
                    <Check className="w-3 h-3 text-success" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              
              <button
                onClick={() => copyToClipboard(color.hex)}
                className="kbd kbd-sm w-full text-left justify-start hover:bg-base-300 transition-colors"
              >
                {color.hex}
                {copiedColor === color.hex && (
                  <span className="text-success ml-2">Copied!</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Color Harmony Info */}
      <div className="alert">
        <div>
          <h4 className="font-medium mb-2">Color Palette Guidelines</h4>
          <div className="text-sm space-y-1">
            <p>• Primary colors for main brand elements</p>
            <p>• Secondary colors for accents and highlights</p>
            <p>• Neutral colors for backgrounds and text</p>
            <p>• Click any color to copy its hex code</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            const paletteText = colors.map(color => `${color.name || 'Color'}: ${color.hex}`).join('\n');
            navigator.clipboard.writeText(paletteText);
          }}
          className="btn btn-outline btn-sm flex-1"
        >
          Copy All Colors
        </button>
        
        <button
          onClick={() => {
            const cssVariables = colors.map((color, index) => 
              `--color-${(color.name || `brand-${index + 1}`).toLowerCase().replace(/\s+/g, '-')}: ${color.hex};`
            ).join('\n');
            navigator.clipboard.writeText(`:root {\n${cssVariables}\n}`);
          }}
          className="btn btn-outline btn-sm flex-1"
        >
          Copy as CSS
        </button>
      </div>
    </div>
  );
};

export default ColorPalette;