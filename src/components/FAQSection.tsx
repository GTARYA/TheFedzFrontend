import { useRef } from 'react';
import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { faqData, FAQType } from '../consts/FAQ';
import clsx from 'clsx';

const FAQItem = ({ item, index }: { item: FAQType; index: number }) => {
    const answerRef = useRef<null | HTMLDivElement>(null);

    return (
        <Disclosure
            as="div"
            className={clsx(
                'border-b',
                index + 1 === faqData.length ? 'border-none' : 'border-white/10'
            )}>
            {({ open }) => (
                <>
                    <DisclosureButton className="flex text-base sm:text-xl text-white items-center justify-between gap-5 w-full p-4 sm:p-5 text-left font-semibold hover:bg-white/10 transition-all">
                        <span>
                            <span className="mr-2 sm:mr-3">{index + 1}.</span>
                            {item.question}
                        </span>
                        <motion.div
                            animate={{ rotate: open ? 135 : 0 }}
                            transition={{ duration: 0.5 }}>
                            <PlusIcon className="h-4 w-4 sm:w-5 sm:h-5 text-white" />
                        </motion.div>
                    </DisclosureButton>

                    <AnimatePresence initial={false}>
                        {open && (
                            <motion.div
                                ref={answerRef}
                                initial={{ height: 0, opacity: 0, y: -40 }}
                                animate={{
                                    height: answerRef.current?.scrollHeight,
                                    opacity: 1,
                                    y: 0,
                                }}
                                exit={{ height: 0, opacity: 0, y: -40 }}
                                transition={{
                                    duration: 0.3,
                                    ease: 'easeInOut',
                                    y: {
                                        delay: 0.2,
                                    },
                                    opacity: {
                                        delay: 0.2,
                                    },
                                }}
                                className="overflow-hidden">
                                <DisclosurePanel className="p-4 sm:p-5 text-white/80 text-sm sm:text-base">
                                    {item.answer}
                                </DisclosurePanel>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </Disclosure>
    );
};

export default function FAQSection() {
    return (
        <div className="w-full bg-white/5 rounded-lg">
            {faqData.map((item, index) => (
                <FAQItem item={item} index={index} />
            ))}
        </div>
    );
}
