import React, { useEffect, useRef, useState } from 'react';
import NextButton from './NextButton';
import BackButton from './BackButton';
import FormInput from './FormInput';
import FotmTitle from './FormTitle';
import { twMerge } from 'tailwind-merge';
import { useClickOutside } from '@reactuses/core';
import toast from 'react-hot-toast';

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

    const steps = 6;

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (e: any, field: string) => {
        const { value, checked } = e.target;
        const selectedValues = formData[field] as string[];

        setFormData({
            ...formData,
            [field]: checked
                ? [...selectedValues, value]
                : selectedValues.filter((item) => item !== value),
        });
    };

    const isExistOption = (option: string, arr: string[]): boolean =>
        arr.includes(option);

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const modalRef = useRef<HTMLDivElement>(null);

    useClickOutside(modalRef, onClose);

    const handleSubmit = async (e: React.FormEvent<HTMLInputElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: process.env.NEXT_PUBLIC_WEB3KEY,
                    ...formData,
                }),
            });

            if (response.ok) {
                setSubmitted(true);
                setFormData({
                    name: '',
                    email: '',
                    telegram: '',
                    whoAreYou: [],
                    howDidYouHear: [],
                    whyJoin: '',
                });
                setCurrentStep(1);
                // onClose();
            } else {
                toast.error('Error submitting the form. Please try again.');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed p-2 inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1100]">
            <div
                ref={modalRef}
                className={twMerge(
                    ' text-black relative rounded-lg p-6 w-full max-w-xl',
                    submitted ? 'bg-[#0f172a]' : 'bg-[#f9fafb]'
                )}>
                <button
                    onClick={onClose}
                    className={twMerge(
                        'absolute text-base sm:text-[20px] top-2 right-3 text-gray-600 hover:text-gray-900',
                        submitted
                            ? 'hover:text-gray-400'
                            : 'hover:text-gray-900'
                    )}>
                    ✖
                </button>
                {!submitted ? (
                    <div>
                        {currentStep === 1 && (
                            <div>
                                <FotmTitle>Full name (or pseudonym)</FotmTitle>

                                <FormInput
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                                <div className="flex justify-end mt-4">
                                    <NextButton onClick={nextStep} />
                                </div>
                            </div>
                        )}
                        {currentStep === 2 && (
                            <div>
                                <FotmTitle>Email</FotmTitle>

                                <FormInput
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                                <div className="flex items-start justify-between mt-4">
                                    <BackButton onClick={prevStep} />
                                    <NextButton onClick={nextStep} />
                                </div>
                            </div>
                        )}
                        {currentStep === 3 && (
                            <div>
                                <FotmTitle>Telegram handle</FotmTitle>

                                <FormInput
                                    type="text"
                                    name="telegram"
                                    value={formData.telegram}
                                    onChange={handleInputChange}
                                />
                                <div className="flex items-start justify-between mt-4">
                                    <BackButton onClick={prevStep} />
                                    <NextButton onClick={nextStep} />
                                </div>
                            </div>
                        )}
                        {currentStep === 4 && (
                            <div>
                                <FotmTitle>Who Are You?</FotmTitle>
                                <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
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
                                            className={twMerge(
                                                'flex py-1 px-2 cursor-pointer items-center justify-center rounded-md border bg-white text-sm sm:text-lg font-medium shadow hover:border-gray-400 peer-checked:border-indigo-500 peer-checked:text-indigo-500',
                                                isExistOption(
                                                    option,
                                                    formData.whoAreYou
                                                )
                                                    ? 'border-purple-600 text-purple-600'
                                                    : ''
                                            )}>
                                            <input
                                                type="checkbox"
                                                value={option}
                                                onChange={(e) =>
                                                    handleCheckboxChange(
                                                        e,
                                                        'whoAreYou'
                                                    )
                                                }
                                                className="hidden"
                                                checked={formData.whoAreYou.includes(
                                                    option
                                                )}
                                            />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex items-start justify-between mt-4">
                                    <BackButton onClick={prevStep} />
                                    <NextButton onClick={nextStep} />
                                </div>
                            </div>
                        )}
                        {currentStep === 5 && (
                            <div>
                                <FotmTitle>
                                    How did you hear about The Fedz?
                                </FotmTitle>
                                <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
                                    {[
                                        'A friend',
                                        "Used FUSD and I'm curious",
                                        'X (Twitter)',
                                        'Academy',
                                        'Press',
                                        'Telegram',
                                    ].map((option) => (
                                        <label
                                            key={option}
                                            className={twMerge(
                                                'flex py-1 px-2 cursor-pointer items-center justify-center rounded-md border bg-white text-sm sm:text-lg font-medium shadow hover:border-gray-400 peer-checked:border-indigo-500 peer-checked:text-indigo-500',
                                                isExistOption(
                                                    option,
                                                    formData.howDidYouHear
                                                )
                                                    ? 'border-purple-600 text-purple-600'
                                                    : ''
                                            )}>
                                            <input
                                                type="checkbox"
                                                value={option}
                                                onChange={(e) =>
                                                    handleCheckboxChange(
                                                        e,
                                                        'howDidYouHear'
                                                    )
                                                }
                                                className="hidden"
                                                checked={formData.howDidYouHear.includes(
                                                    option
                                                )}
                                            />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex items-start justify-between mt-4">
                                    <BackButton onClick={prevStep} />
                                    <NextButton onClick={nextStep} />
                                </div>
                            </div>
                        )}
                        {currentStep === 6 && (
                            <div>
                                <FotmTitle>Why do you want to join?</FotmTitle>
                                <textarea
                                    name="whyJoin"
                                    value={formData.whyJoin}
                                    onChange={handleInputChange}
                                    placeholder="Share your reasons"
                                    className="w-full rounded-md bg-white px-3 py-2 shadow border-gray-400 focus:border-indigo-500 focus:outline-none focus:border-purple-600 border-[2px]"
                                    rows={3}
                                    required
                                />

                                <div className="flex items-start justify-between mt-4">
                                    <BackButton onClick={prevStep} />
                                    <button
                                        onClick={handleSubmit}
                                        className="bg-green-500 text-white px-10 py-2 hover:bg-green-600 rounded-md bordertext-lg font-medium"
                                        disabled={loading}>
                                        {loading ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex justify-center bg-[#0f172a]">
                        <div className="flex flex-col items-center justify-center text-center rounded-md">
                            <svg
                                width="100"
                                height="100"
                                className="text-green-500 dark:text-green-300"
                                viewBox="0 0 100 100"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M26.6666 50L46.6666 66.6667L73.3333 33.3333M50 96.6667C43.8716 96.6667 37.8033 95.4596 32.1414 93.1144C26.4796 90.7692 21.3351 87.3317 17.0017 82.9983C12.6683 78.6649 9.23082 73.5204 6.8856 67.8586C4.54038 62.1967 3.33331 56.1283 3.33331 50C3.33331 43.8716 4.54038 37.8033 6.8856 32.1414C9.23082 26.4796 12.6683 21.3351 17.0017 17.0017C21.3351 12.6683 26.4796 9.23084 32.1414 6.88562C37.8033 4.5404 43.8716 3.33333 50 3.33333C62.3767 3.33333 74.2466 8.24998 82.9983 17.0017C91.75 25.7534 96.6666 37.6232 96.6666 50C96.6666 62.3768 91.75 74.2466 82.9983 82.9983C74.2466 91.75 62.3767 96.6667 50 96.6667Z"
                                    stroke="currentColor"
                                    strokeWidth={4}></path>
                            </svg>
                            <h3 className="text-2xl text-green-500 dark:text-green-300 pt-7">
                                Form submitted successfully!
                            </h3>
                            <p className="max-w-md pt-3 text-gray-500 dark:text-gray-300 md:px-3">
                                Thank you! The form has been submitted
                                successfully. We will reply to you soon!
                            </p>
                            <div className="text-center">
                                <button
                                    onClick={onClose}
                                    className="mt-5 text-indigo-500 hover:underline dark:text-white focus:outline-none">
                                    Go back
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JoinUsForm;
