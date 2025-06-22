import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

// Helper function to handle API errors
const handleApiError = (error, operation) => {
  console.error(`Error during ${operation}:`, error);
  throw new Error(`Failed to ${operation}`);
};

// Helper function to transform backend data to frontend format
const transformBrandKitData = (backendData) => {
  console.log('Transforming backend data:', backendData);
  
  // Transform logo
  const logo = backendData.logo ? {
    imageData: backendData.logo,
    prompt: `Logo for ${backendData.metadata?.brandName || 'brand'}`
  } : null;

  // Transform color palette
  const colorPalette = backendData.colorPalette ? backendData.colorPalette.map((hex, index) => ({
    hex: hex,
    name: `Color ${index + 1}`
  })) : [];

  // Transform font pairings - take the first font pair
  const fontPairings = backendData.fonts && backendData.fonts.length > 0 ? {
    title: backendData.fonts[0].primary,
    body: backendData.fonts[0].secondary,
    titleFallback: 'Arial, sans-serif',
    bodyFallback: 'Helvetica, sans-serif'
  } : null;

  // Transform social templates
  const socialTemplates = [];
  if (backendData.socialTemplates) {
    Object.entries(backendData.socialTemplates).forEach(([platform, templates]) => {
      templates.forEach((template, index) => {
        socialTemplates.push({
          name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Template ${index + 1}`,
          description: template.split('\n')[0] || `Template for ${platform}`,
          platform: platform,
          content: template
        });
      });
    });
  }

  const transformedData = {
    logo,
    colorPalette,
    fontPairings,
    brandTone: backendData.brandTone,
    socialTemplates,
    metadata: backendData.metadata
  };

  console.log('Transformed data:', transformedData);
  return transformedData;
};

export const generateBrandKit = async (brandName, industry, personality) => {
  try {
    console.log('Requesting brand kit generation:', { brandName, industry, personality });
    const response = await axios.post(`${API_URL}/api/brand-kit/generate-complete`, {
      brandName,
      industry,
      personality
    });
    
    console.log('Raw backend response:', response.data);
    const transformedData = transformBrandKitData(response.data);
    return transformedData;
  } catch (error) {
    console.error('Error in generateBrandKit:', error);
    handleApiError(error, 'generate brand kit');
  }
};

export const saveBrandKit = async (kitData) => {
  try {
    const response = await axios.post(`${API_URL}/brand-kit/save`, kitData);
    return response.data;
  } catch (error) {
    console.error('Error saving brand kit:', error);
    throw error;
  }
};

export const getBrandKits = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/brand-kit/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brand kits:', error);
    throw error;
  }
};

// Helper functions for generating individual elements
export const generateLogo = async (brandName, industry, personality) => {
  try {
    const response = await axios.post(`${API_URL}/api/brand-kit/generate-logo`, {
      brandName,
      industry,
      personality
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'generate logo');
  }
};

export const generateColorPalette = async (industry, personality) => {
  try {
    const response = await axios.post(`${API_URL}/api/brand-kit/generate-colors`, {
      industry,
      personality
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'generate color palette');
  }
};

export const generateFontPairings = async (personality) => {
  try {
    const response = await axios.post(`${API_URL}/api/brand-kit/generate-fonts`, {
      personality
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'generate font pairings');
  }
};

export const generateBrandTone = async (brandName, industry, personality) => {
  try {
    const response = await axios.post(`${API_URL}/api/brand-kit/generate-tone`, {
      brandName,
      industry,
      personality
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'generate brand tone');
  }
};

export const generateSocialTemplates = async (brandName, colorPalette, fonts) => {
  try {
    const response = await axios.post(`${API_URL}/api/brand-kit/generate-templates`, {
      brandName,
      colorPalette,
      fonts
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'generate social templates');
  }
}; 