import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';

const BackButton = ({ to = null, className = "" }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <Button
            variant="ghost"
            className={`mb-6 pl-0 hover:pl-2 transition-all gap-2 text-slate-600 hover:text-indigo-600 ${className}`}
            onClick={handleBack}
        >
            <ArrowLeft className="w-5 h-5" />
            Back
        </Button>
    );
};

export default BackButton;
