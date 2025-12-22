// components/withMobileOptimization.js
import { useEffect } from 'react';

const withMobileOptimization = (WrappedComponent) => {
  return (props) => {
    useEffect(() => {
      // Добавляем мобильные классы
      document.body.classList.add('mobile-optimized');
      
      // Предотвращаем масштабирование на инпут
      const preventZoom = () => {
        document.addEventListener('touchstart', function(e) {
          if (e.touches.length > 1) {
            e.preventDefault();
          }
        }, { passive: false });
      };
      
      preventZoom();
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default withMobileOptimization;