const BackButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className="navigate underline text-gray-500 text-sm">
            Go Back
        </button>
    );
};

export default BackButton;
