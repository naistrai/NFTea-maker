import React, { useState } from 'react';

const MintForm = ({ account, contract, showNotification, refreshNFTs }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageURL: ''
  });
  const [isMinting, setIsMinting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMint = async () => {
    if (!contract) return;
    
    setIsMinting(true);
    try {
      const tx = await contract.mintNFT(
        formData.name,
        formData.description,
        formData.imageURL
      );
      
      showNotification(`Transaction sent! Waiting for confirmation...`);
      
      await tx.wait();
      showNotification(`Successfully minted "${formData.name}"!`);
      setFormData({ name: '', description: '', imageURL: '' });
      refreshNFTs();
    } catch (err) {
      showNotification(`Error: ${err.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Create Your NFT</h2>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">NFT Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full bg-gray-700 rounded-lg px-4 py-2"
          placeholder="My Awesome NFT"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full bg-gray-700 rounded-lg px-4 py-2"
          rows="3"
          placeholder="Describe your NFT..."
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Image URL</label>
        <input
          type="text"
          name="imageURL"
          value={formData.imageURL}
          onChange={handleChange}
          className="w-full bg-gray-700 rounded-lg px-4 py-2"
          placeholder="https://example.com/image.png"
        />
      </div>
      
      <button
        onClick={handleMint}
        disabled={isMinting || !formData.name || !formData.imageURL}
        className={`w-full py-3 px-4 rounded-lg font-bold ${isMinting 
          ? 'bg-gray-600 cursor-not-allowed' 
          : 'bg-purple-600 hover:bg-purple-700'}`}
      >
        {isMinting ? 'Minting...' : 'Create NFT'}
      </button>
    </div>
  );
};

export default MintForm;