export const checkNetwork = async (requiredNetworkId) => {
  if (!window.ethereum) return false;
  
  const currentNetworkId = parseInt(await window.ethereum.request({ 
    method: 'net_version' 
  }));
  
  return currentNetworkId === requiredNetworkId;
};

export const parseNFTData = (tokenURI) => {
  try {
    const base64Data = tokenURI.split(',')[1];
    const jsonString = atob(base64Data);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Error parsing NFT data:", err);
    return {
      name: "Unknown NFT",
      description: "No description available",
      image: "/assets/placeholder-nft.png"
    };
  }
};

export const shortenAddress = (address) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};
