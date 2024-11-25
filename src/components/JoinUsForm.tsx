import React, { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const JoinUsForm = ({ isOpen, onClose }: Props) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        telegram: '',
        whoAreYou: [],
        howDidYouHear: [],
        whyJoin: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const steps = 5;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (e, field) => {
        const { value, checked } = e.target;
        const selectedValues = formData[field];

        setFormData({
            ...formData,
            [field]: checked
                ? [...selectedValues, value]
                : selectedValues.filter((item) => item !== value),
        });
    };

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: 'a34bcbd3-4215-47d2-8d71-c983649eb16f', // Замените на ваш ключ Web3Forms
                    ...formData,
                    whoAreYou: formData.whoAreYou.join(', '), // Объединяем массивы в строки
                    howDidYouHear: formData.howDidYouHear.join(', '),
                }),
            });

            if (response.ok) {
                setSubmitted(true);
                alert('Form successfully submitted!');
                setFormData({
                    name: '',
                    email: '',
                    telegram: '',
                    whoAreYou: [],
                    howDidYouHear: [],
                    whyJoin: '',
                });
                setCurrentStep(1);
                onClose();
            } else {
                alert('Error submitting the form. Please try again.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-black rounded-lg p-6 w-full max-w-lg">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
                    ✖
                </button>
                {!submitted ? (
                    <div>
                        {currentStep === 1 && (
                            <div>
                                <h2 className="text-xl font-bold text-center">
                                    Full name (or pseudonym)
                                </h2>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    className="w-full mt-4 p-2 border rounded-md"
                                    required
                                />
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={nextStep}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                        {currentStep === 2 && (
                            <div>
                                <h2 className="text-xl font-bold text-center">
                                    Email
                                </h2>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    className="w-full mt-4 p-2 border rounded-md"
                                    required
                                />
                                <div className="flex justify-between mt-4">
                                    <button
                                        onClick={prevStep}
                                        className="bg-gray-200 px-4 py-2 rounded-md">
                                        Back
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                        {currentStep === 3 && (
                            <div>
                                <h2 className="text-xl font-bold text-center">
                                    Telegram handle
                                </h2>
                                <input
                                    type="text"
                                    name="telegram"
                                    value={formData.telegram}
                                    onChange={handleInputChange}
                                    placeholder="Enter your Telegram handle"
                                    className="w-full mt-4 p-2 border rounded-md"
                                    required
                                />
                                <div className="flex justify-between mt-4">
                                    <button
                                        onClick={prevStep}
                                        className="bg-gray-200 px-4 py-2 rounded-md">
                                        Back
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                        {currentStep === 4 && (
                            <div>
                                <h2 className="text-xl font-bold text-center">
                                    Who Are You?
                                </h2>
                                <div className="mt-4 space-y-2">
                                    {[
                                        'Artist',
                                        'Liquidity Provider',
                                        'Investor',
                                        'Developer',
                                        'KOL',
                                        'DeFi Degen',
                                        'Economist',
                                    ].map((option) => (
                                        <label
                                            key={option}
                                            className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                value={option}
                                                onChange={(e) =>
                                                    handleCheckboxChange(
                                                        e,
                                                        'whoAreYou'
                                                    )
                                                }
                                                checked={formData.whoAreYou.includes(
                                                    option
                                                )}
                                            />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4">
                                    <button
                                        onClick={prevStep}
                                        className="bg-gray-200 px-4 py-2 rounded-md">
                                        Back
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                        {currentStep === 5 && (
                            <div>
                                <h2 className="text-xl font-bold text-center">
                                    Why do you want to join?
                                </h2>
                                <textarea
                                    name="whyJoin"
                                    value={formData.whyJoin}
                                    onChange={handleInputChange}
                                    placeholder="Share your reasons"
                                    className="w-full mt-4 p-2 border rounded-md"
                                    rows={4}
                                    required
                                />
                                <div className="flex justify-between mt-4">
                                    <button
                                        onClick={prevStep}
                                        className="bg-gray-200 px-4 py-2 rounded-md">
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="bg-green-500 text-white px-4 py-2 rounded-md"
                                        disabled={loading}>
                                        {loading ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-bold text-center text-green-600">
                            Thank you!
                        </h2>
                        <p className="text-center mt-4">
                            Your form has been successfully submitted.
                        </p>
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={onClose}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JoinUsForm;
