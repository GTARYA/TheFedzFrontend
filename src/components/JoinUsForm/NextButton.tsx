const NextButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className="sm:px-10 sm:py-2 px-6 py-1 rounded-md border bg-white text-lg font-medium shadow border-gray-400">
            Next
        </button>
    );
};

export default NextButton;
