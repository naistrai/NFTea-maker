import { useState } from 'react';
import { mintNFT, uploadImageToImgHippo } from '../utils/web3'; // Import fungsi uploadImageToImgHippo
import '../MintForm.css'; // Pastikan Anda membuat file CSS untuk styling

const MintForm = ({ onMintSuccess, onLogout, connectedWallet }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageURL: ''
  });
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState(null);
  const [successTx, setSuccessTx] = useState(null);
  const [imageInputType, setImageInputType] = useState('url'); // State untuk tipe input gambar
  const [imageFile, setImageFile] = useState(null); // State untuk file gambar

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsMinting(true);
    setSuccessTx(null);

    try {
      // Basic validation
      if (!formData.name.trim()) throw new Error("NFT name is required");

      let imageURL = formData.imageURL;

      // Jika input berupa file, unggah ke ImgHippo
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
      setImageFile(null); // Reset file input
      setSuccessTx(txReceipt.hash);
    } catch (err) {
      console.error("Minting error:", err);
      setError(err.message || "Failed to mint NFT");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="mint-form-container">
      <div className="wallet-info">
        <p>Connected Wallet: <span className="wallet-address">{connectedWallet}</span></p>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mint-form">
        <h2 className="form-title">Mint Your NFT</h2>

        <div className="form-group">
          <label>NFT Name*</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Awesome NFT"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe your NFT..."
          />
        </div>

        <div className="form-group">
          <label>Image Input Type</label>
          <select
            value={imageInputType}
            onChange={(e) => setImageInputType(e.target.value)}
          >
            <option value="url">Image URL</option>
            <option value="file">Upload File</option>
          </select>
        </div>

        {imageInputType === 'url' ? (
          <div className="form-group">
            <label>Image URL*</label>
            <input
              type="url"
              value={formData.imageURL}
              onChange={(e) =>
                setFormData({ ...formData, imageURL: e.target.value })
              }
              placeholder="https://example.com/image.png"
              required
            />
          </div>
        ) : (
          <div className="form-group">
            <label>Upload Image*</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              required
            />
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          disabled={isMinting}
          className={`mint-button ${isMinting ? 'loading' : ''}`}
        >
          {isMinting ? 'Minting...' : 'Mint NFT'}
        </button>

        {successTx && (
          <div
            className="success-message"
            onClick={() =>
              window.open(`https://sepolia.tea.xyz/tx/${successTx}`, '_blank')
            }
            style={{ cursor: 'pointer' }}
          >
            ✅ Transaction successful! Click here to view on block explorer.
          </div>
        )}
      </form>
    </div>
  );
};

export default MintForm;