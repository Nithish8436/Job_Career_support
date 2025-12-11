import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';

const UploadPage = () => {
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [jdFile, setJdFile] = useState(null);
    const [inputType, setInputType] = useState('text'); // 'text' or 'file'
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();



    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0 && (files[0].type === 'application/pdf' || files[0].type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            setResumeFile(files[0]);
            setError('');
        } else {
            setError('Please upload a PDF or DOCX file.');
        }
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            setResumeFile(files[0]);
            setError('');
        }
    };

    const removeFile = () => {
        setResumeFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAnalyze = async () => {
        if (!resumeFile || !jobDescription.trim()) {
            setError('Please upload a resume and enter a job description');
            return;
        }

        if (!user) {
            setError('You must be logged in to analyze a resume');
            navigate('/login');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Step 1: Upload resume
            const formData = new FormData();
            formData.append('resume', resumeFile);
            formData.append('userId', user.id);

            const uploadResponse = await fetch('http://localhost:5000/api/upload/resume', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({}));
                throw new Error(errorData.details || 'Failed to upload resume');
            }

            const uploadData = await uploadResponse.json();
            const resumeId = uploadData.resumeId;

            // Step 1.5: If JD is a file, extract text first
            let finalJobDescription = jobDescription;
            if (inputType === 'file' && jdFile) {
                const jdFormData = new FormData();
                jdFormData.append('file', jdFile);
                const jdResponse = await fetch('http://localhost:5000/api/upload/extract-text', {
                    method: 'POST',
                    body: jdFormData
                });
                const jdData = await jdResponse.json();
                if (jdData.success && jdData.text) {
                    finalJobDescription = jdData.text;
                } else {
                    throw new Error('Failed to read Job Description file');
                }
            }

            // Step 2: Analyze match
            const analyzeResponse = await fetch('http://localhost:5000/api/match/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resumeId: resumeId,
                    jobDescription: finalJobDescription,
                    userId: user.id,
                }),
            });

            if (!analyzeResponse.ok) {
                const errorData = await analyzeResponse.json().catch(() => ({}));
                throw new Error(errorData.details || 'Failed to analyze match');
            }

            const analyzeData = await analyzeResponse.json();

            // Step 3: Navigate to results page with match ID
            navigate(`/result?matchId=${analyzeData.matchId}`);
        } catch (err) {
            console.error('Analysis error:', err);
            setError(err.message || 'Failed to analyze resume. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const isReady = resumeFile && jobDescription.trim().length > 50;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <BackButton to="/dashboard" />

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-text mb-4">Start Your Analysis</h1>
                    <p className="text-muted text-lg max-w-2xl mx-auto">
                        Upload your resume and the job description you're targeting. Our AI will analyze the fit and provide actionable feedback.
                    </p>
                </div>

                {error && (
                    <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Resume Upload */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Upload Resume
                                </CardTitle>
                                <CardDescription>Supported formats: PDF, DOCX (Max 5MB)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                                        isDragging ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50",
                                        resumeFile ? "bg-gray-50 border-solid" : ""
                                    )}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => !resumeFile && fileInputRef.current.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf,.docx"
                                        onChange={handleFileChange}
                                    />

                                    <AnimatePresence mode="wait">
                                        {resumeFile ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex flex-col items-center"
                                            >
                                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                                    <CheckCircle className="w-8 h-8" />
                                                </div>
                                                <p className="font-medium text-text text-lg mb-1">{resumeFile.name}</p>
                                                <p className="text-sm text-muted mb-4">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                                                    Change File
                                                </Button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex flex-col items-center"
                                            >
                                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                                                    <Upload className="w-8 h-8" />
                                                </div>
                                                <p className="font-medium text-text text-lg mb-2">Drag & drop your resume here</p>
                                                <p className="text-sm text-muted mb-6">or click to browse files</p>
                                                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
                                                    Select File
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Job Description Input */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-secondary" />
                                        Job Description
                                    </CardTitle>
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setInputType('text')}
                                            className={cn(
                                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                                inputType === 'text' ? "bg-white text-secondary shadow-sm" : "text-muted hover:text-secondary"
                                            )}
                                        >
                                            Paste Text
                                        </button>
                                        <button
                                            onClick={() => setInputType('file')}
                                            className={cn(
                                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                                inputType === 'file' ? "bg-white text-secondary shadow-sm" : "text-muted hover:text-secondary"
                                            )}
                                        >
                                            Upload File
                                        </button>
                                    </div>
                                </div>
                                <CardDescription>
                                    {inputType === 'text' ? 'Paste the job posting text below' : 'Upload job description document'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {inputType === 'text' ? (
                                    <div className="relative">
                                        <textarea
                                            className="w-full h-[320px] p-4 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 resize-none transition-all text-sm leading-relaxed"
                                            placeholder="Paste the full job description here..."
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                        ></textarea>
                                        <div className="absolute bottom-4 right-4 text-xs text-muted bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                            {jobDescription.length} chars
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={cn(
                                            "h-[320px] border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer flex flex-col items-center justify-center",
                                            isDragging ? "border-secondary bg-secondary/5" : "border-gray-200 hover:border-secondary/50",
                                            jdFile ? "bg-gray-50 border-solid" : ""
                                        )}
                                        onClick={() => !jdFile && document.getElementById('jd-upload').click()}
                                    >
                                        <input
                                            id="jd-upload"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.docx"
                                            onChange={(e) => {
                                                if (e.target.files.length > 0) {
                                                    setJdFile(e.target.files[0]);
                                                    setJobDescription('File Uploaded'); // Placeholder to satisfy requirement
                                                }
                                            }}
                                        />
                                        {jdFile ? (
                                            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                                <p className="font-medium text-text text-lg mb-1">{jdFile.name}</p>
                                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setJdFile(null); setJobDescription(''); }}>
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-muted">
                                                <Upload className="w-12 h-12 mb-4 text-gray-300" />
                                                <p className="font-medium text-lg mb-2">Upload Job Description</p>
                                                <p className="text-sm">PDF or DOCX</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Action Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mt-12 flex justify-center"
                >
                    <div className="flex flex-col items-center gap-4">
                        <Button
                            size="lg"
                            className="w-64 h-14 text-lg shadow-xl shadow-primary/25"
                            disabled={!isReady || isLoading}
                            onClick={handleAnalyze}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    Run Match Analysis
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </Button>
                        {!isReady && !isLoading && (
                            <p className="text-sm text-muted flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Upload resume and paste job description to proceed
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UploadPage;
