import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 py-4 px-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-400">NFT Minting DApp</h1>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-purple-400">Home</a>
          <a href="#" className="hover:text-purple-400">Collection</a>
          <a href="#" className="hover:text-purple-400">About</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;