import React from 'react';

const NFTGallery = ({ nfts }) => {
  if (nfts.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Your NFT Collection</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft, index) => (
          <NFTCard key={index} nft={nft} />
        ))}
      </div>
    </div>
  );
};

const NFTCard = ({ nft }) => {
  // Parse metadata dari tokenURI
  const metadata = JSON.parse(
    atob(nft.tokenURI.replace('data:application/json;base64,', ''))
  );

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
      <img 
        src={metadata.image} 
        alt={metadata.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{metadata.name}</h3>
        <p className="text-gray-300 text-sm mb-4">{metadata.description}</p>
        <p className="text-purple-400 text-xs">Token ID: {nft.tokenId.toString()}</p>
      </div>
    </div>
  );
};

export default NFTGallery;