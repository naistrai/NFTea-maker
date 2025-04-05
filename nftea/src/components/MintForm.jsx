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

    console.log("1. Start minting..."); // Debug 1
    try {
      // Basic validation
      if (!formData.name.trim()) throw new Error("NFT name is required");
      if (!formData.imageURL.trim()) throw new Error("Image URL is required");

      // console.log("Data to mint:", formData); // Pastikan tidak ada undefined
      console.log("2. Calling mintNFT..."); // Debug 2
      const txHash = await mintNFT(
        formData.name,
        formData.description,
        formData.imageURL
      );
      
      console.log("3. TX Success:", txHash); // Debug 3
      console.log("4. Type of onMintSuccess:", typeof onMintSuccess); // Periksa fungsi
      // onMintSuccess(txHash);
      // Pastikan txHash ada
      if (!txHash?.hash) throw new Error("No transaction hash returned");

      // Eksekusi callback
      if (typeof onMintSuccess === 'function') {
        onMintSuccess(txHash.hash);
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