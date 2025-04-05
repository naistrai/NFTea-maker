import { useState } from 'react';
import { mintNFT, uploadImageToImgHippo } from '../utils/web3';

const MintForm = ({ onMintSuccess, onLogout, connectedWallet }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageURL: ''
  });
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState(null);
  const [successTx, setSuccessTx] = useState(null);
  const [imageInputType, setImageInputType] = useState('url');
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsMinting(true);
    setSuccessTx(null);

    try {
      if (!formData.name.trim()) throw new Error("NFT name is required");

      let imageURL = formData.imageURL;

      if (imageInputType === 'file') {
        if (!imageFile) throw new Error("Image file is required");
        const uploadedImageURL = await uploadImageToImgHippo(imageFile);
        if (!uploadedImageURL) throw new Error("Failed to upload image");
        imageURL = uploadedImageURL;
      } else if (!formData.imageURL.trim()) {
        throw new Error("Image URL is required");
      }

      const txReceipt = await mintNFT(
        formData.name,
        formData.description,
        imageURL
      );

      if (!txReceipt?.hash) throw new Error("No transaction hash returned");

      if (typeof onMintSuccess === 'function') {
        onMintSuccess(txReceipt.hash);
      }

      setFormData({ name: '', description: '', imageURL: '' });
      setImageFile(null);
      setSuccessTx(txReceipt.hash);
    } catch (err) {
      console.error("Minting error:", err);
      setError(err.message || "Failed to mint NFT");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4 bg-blue-100 p-3 rounded-xl">
        <p className="text-sm font-medium text-gray-800">
          Connected Wallet:
          <span className="block text-blue-600 break-words">{connectedWallet}</span>
        </p>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg text-sm"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <h2 className="text-center text-xl font-bold text-gray-800 mb-2">Mint Your NFT</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">NFT Name*</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Awesome NFT"
            required
            className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe your NFT..."
            className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image Input Type</label>
          <select
            value={imageInputType}
            onChange={(e) => setImageInputType(e.target.value)}
            className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="url">Image URL</option>
            <option value="file">Upload File</option>
          </select>
        </div>

        {imageInputType === 'url' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL*</label>
            <input
              type="url"
              value={formData.imageURL}
              onChange={(e) =>
                setFormData({ ...formData, imageURL: e.target.value })
              }
              placeholder="https://example.com/image.png"
              required
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Image*</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              required
              className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-lg shadow-sm"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
            ⚠ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isMinting}
          className={`w-full py-3 rounded-xl font-semibold text-white ${
            isMinting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isMinting ? 'Minting...' : 'Mint NFT'}
        </button>

        {successTx && (
          <div
            className="bg-green-100 text-green-700 p-3 mt-4 rounded-lg text-sm cursor-pointer text-center hover:bg-green-200 transition"
            onClick={() =>
              window.open(`https://sepolia.tea.xyz/tx/${successTx}`, '_blank')
            }
          >
            ✅ Transaction successful! Click to view on block explorer.
          </div>
        )}
      </form>
    </div>
  );
};

export default MintForm;
