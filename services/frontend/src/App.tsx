import React from 'react';
import LandingPage from './components/pages/LandingPage';
import { typography } from './constants/theme';

function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Merriweather:wght@300;400;700;900&family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: ${typography.fontFamily.primary};
          line-height: ${typography.lineHeight.normal};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        ul {
          list-style: none;
        }
        
        ul li {
          margin-bottom: 0.5rem;
        }
        
        ul li:before {
          content: '';
          margin-right: 0.5rem;
        }
      `}</style>
      <LandingPage />
    </>
  );
}

export default App;
