import { useState } from 'react';
import { getNFTContract } from '../utils/web3';

const MintForm = ({ refreshNFTs }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageURL: ''
  });
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async () => {
    try {
      setIsMinting(true);
      const contract = await getNFTContract();
      const tx = await contract.mintNFT(
        formData.name,
        formData.description,
        formData.imageURL
      );
      await tx.wait();
      refreshNFTs();
      setFormData({ name: '', description: '', imageURL: '' });
    } catch (error) {
      console.error("Minting error:", error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="mint-form-container">
      <input
        type="text"
        placeholder="NFT Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      <input
        type="url"
        placeholder="Image URL"
        value={formData.imageURL}
        onChange={(e) => setFormData({...formData, imageURL: e.target.value})}
      />
      <button 
        onClick={handleMint}
        disabled={isMinting}
      >
        {isMinting ? 'Minting...' : 'Mint NFT'}
      </button>
    </div>
  );
};

export default MintForm;