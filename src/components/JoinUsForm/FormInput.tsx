interface Props {
    value: string;
    onChange: (e: React.FormEvent<HTMLInputElement>) => void;
    name: string;
    type: string;
}

const FormInput = ({ value, onChange, name, type }: Props) => {
    return (
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full rounded-md bg-white shadow border-gray-400 px-3 py-1 focus:outline-none focus:border-purple-600 border-[2px]"
            required
        />
    );
};

export default FormInput;
