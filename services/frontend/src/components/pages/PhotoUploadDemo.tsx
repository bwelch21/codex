import React from 'react';
import { PhotoUpload } from '../ui/PhotoUpload';
import { usePhotoUpload, useImageUpload } from '../../hooks';
import { theme } from '../../constants/theme';

export function PhotoUploadDemo() {
  const { state: photoState, handleFileSelect, clearFile, hasFile } = usePhotoUpload();
  const { state: uploadState, uploadFile, resetUpload } = useImageUpload();

  const handleAnalyzeMenu = async () => {
    if (photoState.file) {
      try {
        await uploadFile(photoState.file);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleClearAll = () => {
    clearFile();
    resetUpload();
  };

  const isAnalyzing = uploadState.isUploading;
  const hasUploadError = !!uploadState.error;
  const isUploadSuccessful = !!uploadState.uploadedFile;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.colors.neutral[50],
      padding: theme.spacing[8],
      fontFamily: theme.typography.fontFamily.primary,
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: theme.spacing[12],
        }}>
          <h1 style={{
            fontSize: theme.typography.fontSize['4xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing[4],
          }}>
            Menu Photo Upload
          </h1>
          <p style={{
            fontSize: theme.typography.fontSize.lg,
            color: theme.colors.neutral[600],
            lineHeight: theme.typography.lineHeight.relaxed,
          }}>
            Upload a photo of your menu to analyze it for allergen information.
            Our system will extract text and identify potential allergens in menu items.
          </p>
        </div>

        {/* Photo Upload Component */}
        <div style={{
          backgroundColor: theme.colors.white,
          padding: theme.spacing[8],
          borderRadius: theme.borderRadius['2xl'],
          boxShadow: theme.boxShadow.lg,
          marginBottom: theme.spacing[8],
        }}>
          <h2 style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing[6],
          }}>
            Upload Menu Image
          </h2>
          
          <PhotoUpload
            onFileSelect={handleFileSelect}
            maxSizeInMB={10}
            disabled={isAnalyzing}
          />
        </div>

        {/* Upload Progress */}
        {isAnalyzing && (
          <div style={{
            backgroundColor: theme.colors.white,
            padding: theme.spacing[8],
            borderRadius: theme.borderRadius['2xl'],
            boxShadow: theme.boxShadow.lg,
            marginBottom: theme.spacing[8],
          }}>
            <h3 style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing[4],
            }}>
              Analyzing Menu...
            </h3>
            
            <div style={{
              backgroundColor: theme.colors.neutral[200],
              borderRadius: theme.borderRadius.full,
              height: '8px',
              overflow: 'hidden',
              marginBottom: theme.spacing[4],
            }}>
              <div style={{
                backgroundColor: theme.colors.primary[500],
                height: '100%',
                borderRadius: theme.borderRadius.full,
                width: `${uploadState.progress}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
            
            <p style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.neutral[600],
              textAlign: 'center',
            }}>
              {uploadState.progress}% complete
            </p>
          </div>
        )}

        {/* Upload Success */}
        {isUploadSuccessful && uploadState.uploadedFile && (
          <div style={{
            backgroundColor: theme.colors.white,
            padding: theme.spacing[8],
            borderRadius: theme.borderRadius['2xl'],
            boxShadow: theme.boxShadow.lg,
            marginBottom: theme.spacing[8],
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: theme.spacing[4],
            }}>
              <div style={{
                width: theme.spacing[6],
                height: theme.spacing[6],
                backgroundColor: theme.colors.success[500],
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: theme.spacing[3],
              }}>
                <svg style={{ width: '1rem', height: '1rem', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.success[700],
              }}>
                Upload Successful!
              </h3>
            </div>
            
            <p style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.neutral[700],
              marginBottom: theme.spacing[4],
            }}>
              {uploadState.uploadedFile.message}
            </p>
            
            <div style={{
              backgroundColor: theme.colors.success[50],
              padding: theme.spacing[4],
              borderRadius: theme.borderRadius.lg,
              marginBottom: theme.spacing[4],
            }}>
              <h4 style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.success[800],
                marginBottom: theme.spacing[2],
              }}>
                Upload Details:
              </h4>
              <ul style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.success[700],
                margin: 0,
                paddingLeft: theme.spacing[4],
              }}>
                <li>File: {uploadState.uploadedFile.file.originalName}</li>
                <li>Size: {(uploadState.uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</li>
                <li>Type: {uploadState.uploadedFile.file.mimetype}</li>
                <li>Uploaded: {new Date(uploadState.uploadedFile.file.uploadedAt).toLocaleString()}</li>
              </ul>
            </div>
            
            <button
              onClick={handleClearAll}
              style={{
                padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
                backgroundColor: theme.colors.primary[500],
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.lg,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.primary[600];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.primary[500];
              }}
            >
              Upload Another File
            </button>
          </div>
        )}

        {/* Upload Error */}
        {hasUploadError && (
          <div style={{
            backgroundColor: theme.colors.white,
            padding: theme.spacing[8],
            borderRadius: theme.borderRadius['2xl'],
            boxShadow: theme.boxShadow.lg,
            marginBottom: theme.spacing[8],
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: theme.spacing[4],
            }}>
              <div style={{
                width: theme.spacing[6],
                height: theme.spacing[6],
                backgroundColor: theme.colors.error[500],
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: theme.spacing[3],
              }}>
                <svg style={{ width: '1rem', height: '1rem', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.error[700],
              }}>
                Upload Failed
              </h3>
            </div>
            
            <p style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.error[700],
              marginBottom: theme.spacing[4],
            }}>
              {uploadState.error}
            </p>
            
            <button
              onClick={resetUpload}
              style={{
                padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                backgroundColor: theme.colors.error[500],
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.error[600];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.error[500];
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* File Information Panel */}
        {hasFile && !isUploadSuccessful && (
          <div style={{
            backgroundColor: theme.colors.white,
            padding: theme.spacing[8],
            borderRadius: theme.borderRadius['2xl'],
            boxShadow: theme.boxShadow.lg,
            marginBottom: theme.spacing[8],
          }}>
            <h3 style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing[4],
            }}>
              File Information
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: theme.spacing[4],
              padding: theme.spacing[4],
              backgroundColor: theme.colors.neutral[50],
              borderRadius: theme.borderRadius.lg,
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.neutral[600],
                  marginBottom: theme.spacing[1],
                }}>
                  File Name
                </label>
                <p style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.neutral[900],
                  wordBreak: 'break-all',
                }}>
                  {photoState.file?.name || 'N/A'}
                </p>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.neutral[600],
                  marginBottom: theme.spacing[1],
                }}>
                  File Size
                </label>
                <p style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.neutral[900],
                }}>
                  {photoState.file ? (photoState.file.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
                </p>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.neutral[600],
                  marginBottom: theme.spacing[1],
                }}>
                  File Type
                </label>
                <p style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.neutral[900],
                }}>
                  {photoState.file?.type || 'N/A'}
                </p>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.neutral[600],
                  marginBottom: theme.spacing[1],
                }}>
                  Status
                </label>
                <p style={{
                  fontSize: theme.typography.fontSize.base,
                  color: photoState.isUploaded ? theme.colors.success[600] : theme.colors.neutral[900],
                  fontWeight: photoState.isUploaded ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal,
                }}>
                  {photoState.isUploaded ? '✓ Ready for Analysis' : 'No file selected'}
                </p>
              </div>
            </div>
            
            <div style={{
              marginTop: theme.spacing[6],
              display: 'flex',
              gap: theme.spacing[3],
              flexWrap: 'wrap',
            }}>
              <button
                onClick={handleClearAll}
                disabled={isAnalyzing}
                style={{
                  padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
                  backgroundColor: isAnalyzing ? theme.colors.neutral[300] : theme.colors.error[500],
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: theme.borderRadius.lg,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  opacity: isAnalyzing ? 0.5 : 1,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isAnalyzing) {
                    e.currentTarget.style.backgroundColor = theme.colors.error[600];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAnalyzing) {
                    e.currentTarget.style.backgroundColor = theme.colors.error[500];
                  }
                }}
              >
                Clear File
              </button>
              
              <button
                onClick={handleAnalyzeMenu}
                disabled={isAnalyzing || !hasFile}
                style={{
                  padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
                  backgroundColor: (isAnalyzing || !hasFile) ? theme.colors.neutral[300] : theme.colors.primary[500],
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: theme.borderRadius.lg,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  cursor: (isAnalyzing || !hasFile) ? 'not-allowed' : 'pointer',
                  opacity: (isAnalyzing || !hasFile) ? 0.5 : 1,
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                }}
                onMouseEnter={(e) => {
                  if (!isAnalyzing && hasFile) {
                    e.currentTarget.style.backgroundColor = theme.colors.primary[600];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAnalyzing && hasFile) {
                    e.currentTarget.style.backgroundColor = theme.colors.primary[500];
                  }
                }}
              >
                {isAnalyzing && (
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Menu'}
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          backgroundColor: theme.colors.white,
          padding: theme.spacing[8],
          borderRadius: theme.borderRadius['2xl'],
          boxShadow: theme.boxShadow.lg,
        }}>
          <h3 style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing[4],
          }}>
            How to Use
          </h3>
          
          <div style={{
            display: 'grid',
            gap: theme.spacing[4],
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: theme.spacing[3],
            }}>
              <div style={{
                width: theme.spacing[6],
                height: theme.spacing[6],
                backgroundColor: theme.colors.primary[500],
                color: theme.colors.white,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.bold,
                flexShrink: 0,
              }}>
                1
              </div>
              <div>
                <h4 style={{
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing[1],
                }}>
                  Choose Your Upload Method
                </h4>
                <p style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.neutral[600],
                  lineHeight: theme.typography.lineHeight.relaxed,
                }}>
                  Drag and drop your menu image, click to browse files, or use the camera button on mobile devices to take a photo.
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: theme.spacing[3],
            }}>
              <div style={{
                width: theme.spacing[6],
                height: theme.spacing[6],
                backgroundColor: theme.colors.primary[500],
                color: theme.colors.white,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.bold,
                flexShrink: 0,
              }}>
                2
              </div>
              <div>
                <h4 style={{
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing[1],
                }}>
                  Supported File Types
                </h4>
                <p style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.neutral[600],
                  lineHeight: theme.typography.lineHeight.relaxed,
                }}>
                  Upload PNG, JPEG, or PDF files up to 10MB. Images will show a preview, while PDFs will display a file icon.
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: theme.spacing[3],
            }}>
              <div style={{
                width: theme.spacing[6],
                height: theme.spacing[6],
                backgroundColor: theme.colors.primary[500],
                color: theme.colors.white,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.bold,
                flexShrink: 0,
              }}>
                3
              </div>
              <div>
                <h4 style={{
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing[1],
                }}>
                  Analyze Menu
                </h4>
                <p style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.neutral[600],
                  lineHeight: theme.typography.lineHeight.relaxed,
                }}>
                  Once uploaded, click "Analyze Menu" to send your image to our server for processing. You'll see a progress bar during upload and analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for spinning animation */}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
} 