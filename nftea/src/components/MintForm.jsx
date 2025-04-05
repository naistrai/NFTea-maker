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
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-center">Mint Your NFT</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">NFT Name*</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Awesome NFT"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe your NFT..."
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Image Input Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="url"
                checked={imageInputType === 'url'}
                onChange={() => setImageInputType('url')}
                className="mr-2"
              />
              Image URL
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="file"
                checked={imageInputType === 'file'}
                onChange={() => setImageInputType('file')}
                className="mr-2"
              />
              Upload File
            </label>
          </div>
        </div>

        {imageInputType === 'url' ? (
          <div>
            <label className="block font-semibold mb-1">Image URL*</label>
            <input
              type="url"
              value={formData.imageURL}
              onChange={(e) =>
                setFormData({ ...formData, imageURL: e.target.value })
              }
              placeholder="https://example.com/image.png"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
        ) : (
          <div>
            <label className="block font-semibold mb-1">Upload Image*</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              required
              className="w-full"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
            ⚠ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isMinting}
          className={`w-full rounded px-4 py-2 text-white font-semibold ${
            isMinting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isMinting ? 'Minting...' : 'Mint NFT'}
        </button>

        {successTx && (
          <div
            className="text-center text-green-700 text-sm mt-2 cursor-pointer"
            onClick={() =>
              window.open(`https://sepolia.tea.xyz/tx/${successTx}`, '_blank')
            }
          >
            ✅ View Transaction
          </div>
        )}
      </form>
    </div>
  );
};

export default MintForm;
