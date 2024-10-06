// src/utils/connectWallet.js

import { ethers } from 'ethers';

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      return signer;
    } catch (error) {
      console.error('User rejected the request.');
    }
  } else {
    console.error('MetaMask is not installed.');
  }
};
