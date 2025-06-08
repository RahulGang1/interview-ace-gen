
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Zap } from 'lucide-react';

interface LoadingStateProps {
  onRetry?: () => void;
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  onRetry, 
  message = "Generating your personalized interview questions..." 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="p-8 text-center max-w-md w-full shadow-xl bg-white/90 backdrop-blur-sm">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        </div>
        
        <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI is Working its Magic
        </h2>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          {onRetry && (
            <Button 
              variant="outline" 
              onClick={onRetry}
              className="flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LoadingState;
