import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import BrandInputForm from '../components/BrandInputForm';
import BrandPreview from '../components/BrandPreview';
import { generateBrandKit } from '../services/brandkitService';

const BrandKitGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [brandKit, setBrandKit] = useState(null);
  const [errors, setErrors] = useState({});
  const [generationProgress, setGenerationProgress] = useState(0);
  const [formData, setFormData] = useState({
    brandName: '',
    industry: '',
    personality: ''
  });

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.brandName) newErrors.brandName = 'Brand name is required';
    if (!data.industry) newErrors.industry = 'Industry is required';
    if (!data.personality) newErrors.personality = 'Brand personality is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateGenerationProgress = (step) => {
    const totalSteps = 5; // logo, colors, fonts, tone, templates
    setGenerationProgress((step / totalSteps) * 100);
  };

  const generateFullBrandKit = async () => {
    if (!validateForm(formData)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setGenerationProgress(0);
    setBrandKit(null);

    try {
      toast.loading('Generating your brand kit...', { id: 'brand-kit' });
      
      console.log('Starting brand kit generation with:', { 
        brandName: formData.brandName, 
        industry: formData.industry, 
        personality: formData.personality 
      });
      
      const result = await generateBrandKit(
        formData.brandName,
        formData.industry,
        formData.personality
      );

      console.log('Brand kit generation result:', result);
      setBrandKit(result);
      updateGenerationProgress(5);
      toast.success('Brand kit generated successfully!', { id: 'brand-kit' });
    } catch (error) {
      console.error('Error generating brand kit:', error);
      toast.error(error.message || 'Failed to generate brand kit', { id: 'brand-kit' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-6">
      <h1 className="text-2xl font-bold">Brand Kit Generator</h1>
      <p className="py-6">Create a complete brand identity with AI-powered design tools</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <BrandInputForm
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
            savedKits={[]}
            onLoadKit={() => {}}
          />
          
          <div className="mt-6">
            <button
              onClick={generateFullBrandKit}
              disabled={loading}
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Generating Brand Kit...' : 'Generate Brand Kit'}
            </button>
          </div>
          
          {loading && (
            <div className="mt-4">
              <div className="w-full">
                <progress 
                  className="progress progress-primary w-full" 
                  value={generationProgress} 
                  max="100"
                ></progress>
              </div>
              <p className="text-sm opacity-70 mt-2 text-center">
                Generating your brand kit... {Math.round(generationProgress)}%
              </p>
            </div>
          )}
        </div>
        
        <div>
          <BrandPreview 
            brandKit={brandKit} 
            loading={{ overall: loading }}
            onRegenerate={() => {}}
            formData={formData}
          />
        </div>
      </div>
    </div>
  );
};

export default BrandKitGenerator;