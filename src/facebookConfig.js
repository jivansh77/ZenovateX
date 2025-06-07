/**
 * Facebook and Instagram Graph API Configuration
 * 
 * This file contains the necessary configuration for integrating with Facebook and Instagram
 * through the Graph API. You need to register your app in the Meta for Developers console
 * to obtain these values.
 * 
 * @see https://developers.facebook.com/
 */

// Your Facebook App ID from Meta for Developers console
export const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID';

// The version of the Graph API to use
export const GRAPH_API_VERSION = 'v16.0';

// The redirect URL after login (should match your Firebase auth configuration)
export const REDIRECT_URL = window.location.origin;

// List of permissions (scopes) to request during login
// Add or remove scopes based on your app's needs
export const FACEBOOK_PERMISSIONS = [
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_insights',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts'
];

// Helper function to check if we already have Instagram permissions
export const hasRequiredPermissions = (authResult) => {
  if (!authResult || !authResult.additionalUserInfo || !authResult.additionalUserInfo.profile) {
    return false;
  }
  
  // Get granted permissions
  const grantedPermissions = authResult.additionalUserInfo.profile.permissions || [];
  
  // Check if all required permissions are granted
  const requiredPermissions = ['instagram_basic', 'pages_show_list'];
  return requiredPermissions.every(perm => grantedPermissions.includes(perm));
};

// Steps to set up your app for Instagram access:
// 1. Create a Facebook App in the Meta for Developers console
// 2. Add the Facebook Login product to your app
// 3. Configure Firebase Authentication to use Facebook
// 4. Connect your Instagram Business account to your Facebook Page
// 5. Make sure the user who logs in has admin access to the Facebook Page 