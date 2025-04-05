import { useState } from 'react';
import { mintNFT } from '../utils/web3';

const MintForm = ({ onMintSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageURL: ''
  });
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsMinting(true);

    try {
      // Basic validation
      if (!formData.name.trim()) throw new Error("NFT name is required");
      if (!formData.imageURL.trim()) throw new Error("Image URL is required");

      const txReceipt = await mintNFT(
        formData.name,
        formData.description,
        formData.imageURL
      );
      
      // Pastikan txHash ada
      if (!txReceipt?.hash) throw new Error("No transaction hash returned");

      // Eksekusi callback
      if (typeof onMintSuccess === 'function') {
        onMintSuccess(txReceipt.hash);
      }
      setFormData({ name: '', description: '', imageURL: '' });
      
    } catch (err) {
      console.error("Minting error:", err);
      setError(err.message || "Failed to mint NFT");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mint-form">
      <div className="form-group">
        <label>NFT Name*</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="My Awesome NFT"
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Describe your NFT..."
        />
      </div>

      <div className="form-group">
        <label>Image URL*</label>
        <input
          type="url"
          value={formData.imageURL}
          onChange={(e) => setFormData({...formData, imageURL: e.target.value})}
          placeholder="https://example.com/image.png"
          required
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button 
        type="submit" 
        disabled={isMinting}
        className={`mint-button ${isMinting ? 'loading' : ''}`}
      >
        {isMinting ? 'Minting...' : 'Mint NFT'}
      </button>
    </form>
  );
};

export default MintForm;