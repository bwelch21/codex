interface ErrorMessageInfo {
  title: string;
  message: string;
  suggestions: string[];
}

export function getErrorMessageInfo(error: string | object | unknown): ErrorMessageInfo {
  // Convert error to string if it's not already
  let errorString: string;
  if (typeof error === 'string') {
    errorString = error;
  } else if (error && typeof error === 'object') {
    // Handle error objects
    if ('message' in error && typeof error.message === 'string') {
      errorString = error.message;
    } else {
      errorString = JSON.stringify(error);
    }
  } else {
    errorString = String(error) || 'Unknown error occurred';
  }
  
  const errorLower = errorString.toLowerCase();

  // Network/connection errors
  if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('connection')) {
    return {
      title: 'Connection Problem',
      message: 'We couldn\'t connect to our servers to analyze your menu.',
      suggestions: [
        'Check your internet connection and try again',
        'Make sure you\'re not using a VPN that might block the request',
        'Try refreshing the page and uploading your menu again'
      ]
    };
  }

  // File size or format errors
  if (errorLower.includes('file') || errorLower.includes('image') || errorLower.includes('format')) {
    return {
      title: 'File Upload Issue',
      message: 'There was a problem with the menu photo you uploaded.',
      suggestions: [
        'Make sure your image is clear and readable',
        'Try a different photo format (JPG, PNG, or WEBP)',
        'Ensure the file size is under 10MB',
        'Make sure the menu text is visible and not blurry'
      ]
    };
  }

  // Server/processing errors
  if (errorLower.includes('server') || errorLower.includes('500') || errorLower.includes('internal')) {
    return {
      title: 'Server Error',
      message: 'Our servers are having trouble processing your request right now.',
      suggestions: [
        'This is usually temporary - please try again in a few minutes',
        'If the problem persists, try with a different menu photo',
        'Consider using a clearer, higher-quality image'
      ]
    };
  }

  // Rate limiting
  if (errorLower.includes('rate') || errorLower.includes('limit') || errorLower.includes('429')) {
    return {
      title: 'Too Many Requests',
      message: 'You\'ve made too many requests in a short time.',
      suggestions: [
        'Please wait a few minutes before trying again',
        'This helps us provide the best service for everyone'
      ]
    };
  }

  // Analysis/AI processing errors
  if (errorLower.includes('analyze') || errorLower.includes('ai') || errorLower.includes('vision')) {
    return {
      title: 'Analysis Problem',
      message: 'We had trouble reading or analyzing your menu.',
      suggestions: [
        'Make sure the menu text is clear and readable',
        'Try taking a new photo with better lighting',
        'Ensure the menu is fully visible in the photo',
        'Avoid photos with heavy shadows or glare'
      ]
    };
  }

  // Generic error fallback
  return {
    title: 'Something Went Wrong',
    message: errorString || 'An unexpected error occurred while analyzing your menu.',
    suggestions: [
      'Try uploading your menu photo again',
      'Make sure your image is clear and readable',
      'Check your internet connection',
      'If the problem continues, try refreshing the page'
    ]
  };
} 