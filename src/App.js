// src/App.js

import React, { useState, useEffect } from 'react';
import { connectWallet } from './utils/connectWallet';
import CertificationNFT from './contracts/CertificationNFT.json';
import { ethers } from 'ethers';
import Quiz from './components/Quiz';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';


const contractAddress = '0xf556ba4584C9148B4361bb9BDd3f75fD8396764c'; 
const sepoliaChainId = '0xaa36a7'; // Hexadecimal chain ID for Sepolia (11155111)

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [milestoneReached, setMilestoneReached] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (window.ethereum) {
      const newProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      setProvider(newProvider);

      // Check if user is already connected
      newProvider.listAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          setSigner(newProvider.getSigner());
        }
      });

      // Event listener for network changes
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Network changed to:', chainId);
        const updatedProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        setProvider(updatedProvider);
        const updatedSigner = updatedProvider.getSigner();
        setSigner(updatedSigner);
      });

      // Event listener for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Accounts changed to:', accounts);
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          const updatedSigner = provider.getSigner();
          setSigner(updatedSigner);
        } else {
          // No accounts available
          setCurrentAccount(null);
          setSigner(null);
        }
      });
    } else {
      console.error('Please install MetaMask!');
    }
  }, []);

  const handleConnectWallet = async () => {
    if (provider) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          const newSigner = provider.getSigner();
          setSigner(newSigner);
          console.log('Connected wallet:', accounts[0]);
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.error('Provider not initialized.');
    }
  };

  const handleMintNFT = async () => {
    if (signer) {
      const { chainId } = await provider.getNetwork();
      if (chainId !== 11155111) { // Sepolia chain ID is 11155111
        try {
          // Attempt to switch to Sepolia network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaChainId }],
          });
        } catch (switchError) {
          // This error code indicates the chain is not added to MetaMask
          if (switchError.code === 4902) {
            try {
              // Add Sepolia network to MetaMask
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: sepoliaChainId,
                    chainName: 'Sepolia Test Network',
                    rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'], // Replace with your Infura Project ID
                    nativeCurrency: {
                      name: 'Sepolia Ether',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                  },
                ],
              });
              // After adding, try switching again
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: sepoliaChainId }],
              });
            } catch (addError) {
              console.error('Failed to add the Sepolia network:', addError);
              alert('Please add the Sepolia network to MetaMask manually.');
              return;
            }
          } else {
            console.error('Failed to switch to the Sepolia network:', switchError);
            alert('Please switch to the Sepolia network in MetaMask.');
            return;
          }
        }
        // After switching, update provider and signer
        const updatedProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        setProvider(updatedProvider);
        const updatedSigner = updatedProvider.getSigner();
        setSigner(updatedSigner);
      }

      // Proceed with minting
      const contract = new ethers.Contract(contractAddress, CertificationNFT.abi, signer);
      try {
        const level = determineCertificationLevel(correctAnswers);
        console.log('Minting level:', level);
        if (level > 0) {
          const tx = await contract.mintCertification(await signer.getAddress(), level);
          console.log('Transaction sent:', tx);
          await tx.wait();
          console.log('NFT Minted:', tx);
          setMilestoneReached(false);
        } else {
          console.log('Not enough correct answers to mint an NFT.');
        }
      } catch (error) {
        console.error('Error minting NFT:', error);
      }
    } else {
      console.error('Wallet not connected');
    }
  };

  const determineCertificationLevel = (score) => {
    if (score >= 25) {
      return 3; // Expert
    } else if (score >= 20) {
      return 2; // Intermediate
    } else if (score >= 10) {
      return 1; // Enthusiast
    } else {
      return 0; // No NFT
    }
  };

  const getMintButtonText = (score) => {
    const level = determineCertificationLevel(score);
    if (level === 3) {
      return 'Mint Your Ethereum Expert Certificate NFT';
    } else if (level === 2) {
      return 'Mint Your Ethereum Intermediate Certificate NFT';
    } else if (level === 1) {
      return 'Mint Your Ethereum Enthusiast Certificate NFT';
    } else {
      return 'Mint Your Certificate NFT';
    }
  };

  const handleQuizCompletion = (score) => {
    setCorrectAnswers(score);
    // Optional: Handle actions upon quiz completion
  };

  const handleMilestoneReached = (score) => {
    setCorrectAnswers(score);
    setMilestoneReached(true);
  };


return (
    <div
      style={{
        backgroundImage: 'url(/background.jpg)',
        backgroundSize: 'cover',
        minHeight: '100vh',
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CryptoQuest
          </Typography>
          {currentAccount ? (
            <Button color="inherit">{`${currentAccount.substring(0, 6)}...${currentAccount.slice(-4)}`}</Button>
          ) : (
            <Button color="inherit" onClick={handleConnectWallet}>
              Connect Wallet
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Test Your Ethereum Knowledge!
          </Typography>
          <Typography variant="body1">
            Answer the questions below to earn exclusive Ethereum certification NFTs.
          </Typography>
        </Box>
        <Quiz
          onQuizComplete={handleQuizCompletion}
          onMilestoneReached={handleMilestoneReached}
        />
        {milestoneReached && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Congratulations! You have {correctAnswers} correct answers.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleMintNFT}
            >
              {getMintButtonText(correctAnswers)}
            </Button>
          </Box>
        )}
      </Container>
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;