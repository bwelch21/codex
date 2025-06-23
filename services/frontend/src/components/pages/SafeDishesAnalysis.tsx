import { useState, useEffect } from 'react';
import { PhotoUpload, AllergenSelector, SafeDishesResults, ErrorModal, StepCard } from '../ui';
import { usePhotoUpload, useSafeDishes, useDeviceDetection } from '../../hooks';
import { type Allergen } from '../../types/allergens';
import { theme } from '../../constants/theme';
import { getErrorMessageInfo } from '../../utils/errorMessages';

export function SafeDishesAnalysis() {
  const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Fun facts rotation state
  const funFacts = [
    'Peanut allergies affect about 1% of the population 🤏🥜',
    'Sesame became the 9th major allergen in the US in 2023! 🧆',
    'Up to 70% of kids outgrow egg allergies by age 16 🥚➡️🎉',
    'Cross-contact can happen even before food hits the plate 🍽️',
    'Strict avoidance is still the key to staying safe 🔑',
    'Shellfish is the most common food allergy in U.S. adults 🦐',
    'Eating baked milk can help some kids outgrow dairy allergy faster 🧁🥛',
    'About 40% of children with food allergies have experienced a severe reaction 🚑',
    'Soybeans are in more products than just tofu—think chocolate & bread! 🍫🍞',
    'Oral allergy syndrome can make some fruits tingle if you have pollen allergies 🍏🌳',
    'Reading labels takes as little as 30 seconds but can save a life ⏱️📜',
    'Food allergies send someone to the ER every 3 minutes in the U.S. 🏥',
    'Hand sanitizer does NOT remove peanut protein—soap and water do! 🧼',
    'Airlines started peanut-free flights as early as 1987 ✈️🥜',
    'Hives are the most common first sign of an allergic reaction 🐝',
  ];
  const [factIndex, setFactIndex] = useState(0);
  const [showFact, setShowFact] = useState(true);
  const [factOrder, setFactOrder] = useState<number[]>([]);
  const [orderIdx, setOrderIdx] = useState(0);
  const { isMobile } = useDeviceDetection();
  const {
    state: photoState,
    handleFileSelect,
    clearFile,
    hasFile,
    shouldClearComponent,
  } = usePhotoUpload();
  const { state: safeDishesState, analyzeDishes, reset: resetAnalysis } = useSafeDishes();

  const handleAllergenToggle = (allergen: Allergen) => {
    setSelectedAllergens(prev => {
      const isSelected = prev.some(a => a.id === allergen.id);
      if (isSelected) {
        return prev.filter(a => a.id !== allergen.id);
      } else {
        return [...prev, allergen];
      }
    });
  };

  const handleAnalyzeMenu = async () => {
    if (photoState.file && selectedAllergens.length > 0) {
      await analyzeDishes(photoState.file, selectedAllergens);
    }
  };

  const handleConfirmAllergens = () => {
    if (selectedAllergens.length > 0) {
      // Begin transition
      setIsTransitioning(true);
      // Wait for animation out
      setTimeout(() => {
        setCurrentStep(2);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleBackToAllergens = () => {
    // Begin transition
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(1);
      setIsTransitioning(false);
    }, 300);
  };

  const handleStartOver = () => {
    clearFile();
    setSelectedAllergens([]);
    setCurrentStep(1);
    resetAnalysis();
  };

  const handleErrorModalClose = () => {
    resetAnalysis(); // This clears the error
    clearFile(); // This removes the attached file
  };

  const canAnalyze = hasFile && selectedAllergens.length > 0 && !safeDishesState.isAnalyzing;
  const hasResults = safeDishesState.results !== null;

  // Fisher-Yates shuffle
  const shuffleArray = (arr: number[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Initialize shuffled facts order on analysis start
  useEffect(() => {
    if (safeDishesState.isAnalyzing) {
      const order = shuffleArray(funFacts.map((_, i) => i));
      setFactOrder(order);
      setOrderIdx(0);
      setFactIndex(order[0]);
    }
  }, [safeDishesState.isAnalyzing]);

  // Rotate facts every 3s while analyzing without repetition
  useEffect(() => {
    const interval = 4000;
    if (!safeDishesState.isAnalyzing || factOrder.length === 0) return;
    const intervalId = window.setInterval(() => {
      setShowFact(false);
      setTimeout(() => {
        setOrderIdx(prev => {
          const nextIdx = (prev + 1) % factOrder.length;
          setFactIndex(factOrder[nextIdx]);
          return nextIdx;
        });
        setShowFact(true);
      }, 500);
    }, interval);
    return () => clearInterval(intervalId);
  }, [safeDishesState.isAnalyzing, factOrder]);

  // Show results view if we have results
  if (hasResults && safeDishesState.results) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: theme.colors.neutral[50],
          padding: theme.spacing[8],
          fontFamily: theme.typography.fontFamily.primary,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <SafeDishesResults
            results={safeDishesState.results}
            selectedAllergens={selectedAllergens}
            onStartOver={handleStartOver}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme.colors.neutral[50],
        padding: theme.spacing[8],
        fontFamily: theme.typography.fontFamily.primary,
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: theme.spacing[12],
          }}
        >
          <h1
            style={{
              fontSize: theme.typography.fontSize["4xl"],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing[4],
            }}
          >
            🍽️ Safe Dishes Analyzer
          </h1>
          <p
            style={{
              fontSize: theme.typography.fontSize.lg,
              color: theme.colors.neutral[600],
              lineHeight: theme.typography.lineHeight.relaxed,
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Upload a menu photo and select your allergens. We'll analyze every dish 
            and rank them by safety, helping you dine with confidence.
          </p>
        </div>

        {/* Progressive Form Flow – single card with transition */}
        <div
          className={`transition-all duration-300 transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
        >
          {currentStep === 1 ? (
            <StepCard
              showIndicator={false}
              title="Choose Your Allergens"
              isActive
              isCompleted={selectedAllergens.length > 0}
            >
              <AllergenSelector
                selectedAllergens={selectedAllergens}
                onAllergenToggle={handleAllergenToggle}
                disabled={safeDishesState.isAnalyzing}
              />
            </StepCard>
          ) : (
            <StepCard
              showIndicator={false}
              title={safeDishesState.isAnalyzing ? '' : 'Upload Menu Photo'}
              isActive
              isCompleted={hasFile}
              onBack={!safeDishesState.isAnalyzing ? handleBackToAllergens : undefined}
            >
              {safeDishesState.isAnalyzing ? (
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: theme.spacing[8],
                  }}
                >
                  <div
                    style={{
                      width: theme.spacing[16],
                      height: theme.spacing[16],
                      backgroundColor: theme.colors.primary[500],
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: `0 auto ${theme.spacing[6]}`,
                      color: theme.colors.white,
                      fontSize: theme.typography.fontSize["2xl"],
                    }}
                  >
                    🔍
                  </div>
                  <h3
                    style={{
                      fontSize: theme.typography.fontSize.xl,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.neutral[900],
                      marginBottom: theme.spacing[4],
                    }}
                  >
                    Analyzing Your Menu...
                  </h3>
                  <div
                    style={{
                      backgroundColor: theme.colors.neutral[200],
                      borderRadius: theme.borderRadius.full,
                      height: '12px',
                      overflow: 'hidden',
                      maxWidth: '400px',
                      margin: `0 auto ${theme.spacing[4]}`,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: theme.colors.primary[500],
                        height: '100%',
                        borderRadius: theme.borderRadius.full,
                        width: `${safeDishesState.progress}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.neutral[600],
                      marginBottom: theme.spacing[2],
                    }}
                  >
                    {Math.round(safeDishesState.progress)}% complete
                  </p>
                  {/* Fun Fact section */}
                  <div
                    style={{
                      marginTop: theme.spacing[6],
                      opacity: showFact ? 1 : 0,
                      transition: 'opacity 0.5s ease',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: theme.typography.fontSize.lg,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.primary[500],
                        marginBottom: theme.spacing[2],
                      }}
                    >
                      Did you know?
                    </h4>
                    <p
                      style={{
                        fontSize: theme.typography.fontSize.base,
                        color: theme.colors.neutral[700],
                        maxWidth: '400px',
                        margin: '0 auto',
                      }}
                    >
                      {funFacts[factIndex]}
                    </p>
                  </div>
                </div>
              ) : (
                <PhotoUpload
                  onFileSelect={handleFileSelect}
                  maxSizeInMB={10}
                  disabled={safeDishesState.isAnalyzing || selectedAllergens.length === 0}
                  shouldClear={shouldClearComponent}
                />
              )}
            </StepCard>
          )}
        </div>

        {/* Desktop CTA container below card */}
        {!isMobile && (
          <div style={{ textAlign: 'center', marginTop: theme.spacing[8] }}>
            {currentStep === 1 && selectedAllergens.length > 0 && (
              <button
                onClick={handleConfirmAllergens}
                style={{
                  padding: `${theme.spacing[4]} 0`,
                  width: '100%',
                  maxWidth: '400px',
                  backgroundColor: theme.colors.primary[500],
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.semibold,
                  cursor: 'pointer',
                }}
              >
                Next
              </button>
            )}

            {currentStep === 2 && !safeDishesState.isAnalyzing && !safeDishesState.results && canAnalyze && (
              <button
                onClick={handleAnalyzeMenu}
                style={{
                  padding: `${theme.spacing[4]} 0`,
                  width: '100%',
                  maxWidth: '400px',
                  backgroundColor: theme.colors.primary[500],
                  color: theme.colors.white,
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: theme.boxShadow.lg,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary[600];
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary[500];
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🔬 Analyze Menu for Safe Dishes
              </button>
            )}
          </div>
        )}

        {/* Error Modal */}
        {safeDishesState.error && (
          <ErrorModal
            isOpen={!!safeDishesState.error}
            onClose={handleErrorModalClose}
            title={getErrorMessageInfo(safeDishesState.error).title}
          >
            <div>
              <p
                style={{
                  fontSize: theme.typography.fontSize.base,
                  marginBottom: theme.spacing[6],
                }}
              >
                {getErrorMessageInfo(safeDishesState.error).message}
              </p>
              
              <div
                style={{
                  backgroundColor: theme.colors.neutral[50],
                  padding: theme.spacing[4],
                  borderRadius: theme.borderRadius.lg,
                  marginBottom: theme.spacing[4],
                }}
              >
                <h4
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.neutral[700],
                    marginBottom: theme.spacing[3],
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  How to fix this:
                </h4>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: theme.spacing[5],
                    color: theme.colors.neutral[600],
                  }}
                >
                  {getErrorMessageInfo(safeDishesState.error).suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      style={{
                        marginBottom: theme.spacing[2],
                        fontSize: theme.typography.fontSize.sm,
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.neutral[500],
                  fontStyle: 'italic',
                }}
              >
                Note: Your uploaded photo will be removed when you close this dialog.
              </div>
            </div>
          </ErrorModal>
        )}

        {/* Floating CTA for Mobile */}
        {isMobile && currentStep === 1 && selectedAllergens.length > 0 && (
          <button
            onClick={handleConfirmAllergens}
            style={{
              position: 'fixed',
              bottom: theme.spacing[6],
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 4rem)',
              maxWidth: '400px',
              padding: `${theme.spacing[4]} 0`,
              backgroundColor: theme.colors.primary[500],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              boxShadow: theme.boxShadow.lg,
              zIndex: 50,
            }}
          >
            Next
          </button>
        )}

        {isMobile && currentStep === 2 && !safeDishesState.isAnalyzing && !safeDishesState.results && canAnalyze && (
          <button
            onClick={handleAnalyzeMenu}
            style={{
              position: 'fixed',
              bottom: theme.spacing[6],
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 4rem)',
              maxWidth: '400px',
              padding: `${theme.spacing[4]} 0`,
              backgroundColor: theme.colors.primary[500],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              boxShadow: theme.boxShadow.lg,
              zIndex: 50,
            }}
          >
            🔬 Analyze Menu
          </button>
        )}
      </div>
    </div>
  );
} 