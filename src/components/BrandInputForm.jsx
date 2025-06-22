import React from 'react';

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Food & Beverage',
  'Real Estate',
  'Education',
  'Entertainment',
  'Fashion',
  'Fitness',
  'Travel',
  'Automotive',
  'Beauty',
  'Consulting',
  'Legal',
  'Non-Profit',
  'Agriculture',
  'Construction',
  'Energy',
  'Manufacturing'
];

const PERSONALITIES = [
  'Fun',
  'Formal',
  'Bold',
  'Luxury',
  'Minimalist',
  'Creative',
  'Professional',
  'Friendly',
  'Innovative',
  'Trustworthy',
  'Playful',
  'Sophisticated',
  'Energetic',
  'Calm',
  'Modern'
];

const BrandInputForm = ({
  formData = { brandName: '', industry: '', personality: '' },
  onChange,
  errors = {},
  savedKits = [],
  onLoadKit
}) => {
  return (
    <div className="space-y-6">
      {/* Brand Name Input */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-lg">Brand Information</h3>
          
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Brand Name *</span>
              </label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => onChange('brandName', e.target.value)}
                placeholder="Enter your brand name"
                className={`input input-bordered w-full ${
                  errors.brandName ? 'input-error' : ''
                }`}
              />
              {errors.brandName && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.brandName}</span>
                </label>
              )}
            </div>

            {/* Industry Dropdown */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Industry/Niche *</span>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => onChange('industry', e.target.value)}
                className={`select select-bordered w-full ${
                  errors.industry ? 'select-error' : ''
                }`}
              >
                <option value="">Select an industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.industry}</span>
                </label>
              )}
            </div>

            {/* Personality Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Brand Personality *</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PERSONALITIES.map((personality) => (
                  <label
                    key={personality}
                    className={`btn btn-outline btn-sm justify-start ${
                      formData.personality === personality ? 'btn-primary' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="personality"
                      value={personality}
                      checked={formData.personality === personality}
                      onChange={(e) => onChange('personality', e.target.value)}
                      className="sr-only"
                    />
                    {personality}
                  </label>
                ))}
              </div>
              {errors.personality && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.personality}</span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Brand Kits */}
      {savedKits.length > 0 && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg">Saved Brand Kits</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedKits.map((kit) => (
                <div
                  key={kit.id}
                  className="card card-compact bg-base-200"
                >
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{kit.brandName}</h4>
                        <p className="text-sm opacity-70">
                          {kit.industry} • {kit.personality}
                        </p>
                        <p className="text-xs opacity-50">
                          {new Date(kit.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => onLoadKit(kit)}
                        className="btn btn-primary btn-sm"
                      >
                        Load
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="alert">
        <div>
          <h4 className="font-medium">💡 Tips for Better Results</h4>
          <ul className="text-sm mt-2 space-y-1">
            <li>• Choose a brand name that reflects your business</li>
            <li>• Select the industry that best matches your niche</li>
            <li>• Pick a personality that resonates with your target audience</li>
            <li>• You can regenerate individual elements after creation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BrandInputForm;