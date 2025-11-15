import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import logoImage from 'figma:asset/fec5fc6ba55a6b0262eb857fb3a3dbd65968552b.png';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <img src={logoImage} alt="Find that Home" className="h-64 w-auto" />
          </div>
          <h1 className="mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Home Page
          </Button>
        </div>
      </div>
    </div>
  );
}
