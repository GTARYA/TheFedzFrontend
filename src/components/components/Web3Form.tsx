import { useState } from "react";
import { ethers } from "ethers";

const Web3Form = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!window.ethereum) {
                alert("MetaMask is required to submit the form.");
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const contractABI = [
                {
                    inputs: [
                        { internalType: "string", name: "name", type: "string" },
                        { internalType: "string", name: "email", type: "string" },
                        { internalType: "string", name: "message", type: "string" },
                    ],
                    name: "submitForm",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
            ];
            const contractAddress = "0xYourSmartContractAddress"; // Replace with your contract address

            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            const tx = await contract.submitForm(formData.name, formData.email, formData.message);
            console.log("Transaction sent:", tx.hash);

            await tx.wait();
            alert("Form submitted successfully!");
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to submit the form. Please try again.");
        }

        setLoading(false);
    };

    return (
        <div className="web3-form">
            {submitted ? (
                <p>Thank you for joining us! Your form has been submitted.</p>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                        required
                    />
                    <textarea
                        name="message"
                        placeholder="Why do you want to join?"
                        value={formData.message}
                        onChange={handleChange}
                        className="textarea-field"
                        required
                    />
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default Web3Form;
