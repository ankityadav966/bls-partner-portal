import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import Button from '../../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 text-brand-gold mx-auto flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-2">404</h1>
      <h2 className="text-xl font-semibold text-slate-200 mb-3">Portal Page Not Found</h2>
      <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-6">
        The requested resource does not exist or your partner credentials do not have permission to access it.
      </p>
      <Link to="/dashboard">
        <Button variant="gold" icon={<Home className="w-4 h-4" />}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
