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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-400 p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Mint Your NFT
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-600">NFT Name*</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter NFT name"
              required
              className="w-full bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your NFT..."
              className="w-full bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Upload Method</label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="url"
                  checked={imageInputType === 'url'}
                  onChange={() => setImageInputType('url')}
                  className="accent-blue-500"
                />
                <span>Image URL</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="file"
                  checked={imageInputType === 'file'}
                  onChange={() => setImageInputType('file')}
                  className="accent-blue-500"
                />
                <span>Upload File</span>
              </label>
            </div>
          </div>

          {imageInputType === 'url' ? (
            <div>
              <label className="text-sm font-medium text-gray-600">Image URL*</label>
              <input
                type="url"
                value={formData.imageURL}
                onChange={(e) =>
                  setFormData({ ...formData, imageURL: e.target.value })
                }
                placeholder="https://example.com/image.png"
                required
                className="w-full bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 py-2"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-600">Upload Image*</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                required
                className="w-full py-2"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isMinting}
            className={`w-full text-white font-medium py-3 rounded-xl transition ${
              isMinting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600'
            }`}
          >
            {isMinting ? 'Minting...' : 'Mint NFT →'}
          </button>

          {successTx && (
            <div
              className="text-center text-green-700 text-sm cursor-pointer mt-4"
              onClick={() =>
                window.open(`https://sepolia.tea.xyz/tx/${successTx}`, '_blank')
              }
            >
              ✅ View Transaction on Block Explorer
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MintForm;
