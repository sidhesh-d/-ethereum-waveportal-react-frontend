import React, {useEffect, useState, useRef} from "react";
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
  const myContainer = useRef(null);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState("");
  const [totalWavesFromCurrentAddr, setTotalWavesFromCurrentAddr] = useState("");
  const [allWaves, setAllWaves] = useState([]);

  const contractAddress="0x79ee473EcD309094694F54580296a8DbB7F04bF5";
  const contractABI = abi.abi;
  const [contractBalance, setContractBalance] = useState(parseFloat("0.0"));

  const checkIfWalletIsConnected = async () => {
    //check if we have metamask
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Please create an account with Metamask');
    } else {
      console.log('We have ethereum object');
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !==0) {
      const account = accounts[0];
      console.log('We have connected to account '+ account);
      setCurrentAccount(account);
    } else {
      console.log('Could not find any account');

    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

const getContractBalance = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const contractBalance = await provider.getBalance(contractAddress);
    setContractBalance(contractBalance);
    console.log('contract balance '+contractBalance);
    return contractBalance;
}


  useEffect(() => {
  checkIfWalletIsConnected();
  getAllWaves();
  getTotalWaves();
  getTotalWavesFromCurrentAddr();
  getContractBalance();
}, []);// eslint-disable-line react-hooks/exhaustive-deps

  const wave = async () => {
    try {
      const { ethereum } = window;
      setMessage('');
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        await getContractBalance();
        console.log('prevBalance contract balance '+contractBalance);
        const prevBalance = contractBalance;
        /*
        * You're using contractABI here
        */
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const message = myContainer.current.value;
        console.log(message);
        let waveTxn = await wavePortalContract.wave(
          message,
          { gasLimit: 300000 }
        );
        console.log('Mining...'+waveTxn.hash);
        const receipt = await waveTxn.wait();
        console.log('receipt: '+JSON.stringify(receipt));

        console.log('Mined...'+waveTxn.hash);
        const newBalance = await getContractBalance();
        console.log('newBalance '+newBalance);
        if (prevBalance > newBalance) {
          setMessage('🎉🎉 You have been sent 0.001 ether.')
        }
        await getAllWaves();
        await getTotalWaves();
        await getTotalWavesFromCurrentAddr();

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      console.log('setting message value');
      setMessage('Aww, you have been rate limited. Try again in 15 mins.');
    }
  }

  const getTotalWaves = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    /*
    * You're using contractABI here
    */
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    let count = await wavePortalContract.getTotalWaves();
    setTotalWaves(count.toNumber());
    return count;
  }

  const getTotalWavesFromCurrentAddr = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    /*
    * You're using contractABI here
    */
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    let totalWavesFromCurrentAddr = await wavePortalContract.getTotalWavesFromAddr();
    setTotalWavesFromCurrentAddr(totalWavesFromCurrentAddr.toNumber());
    return totalWavesFromCurrentAddr;
  }

  const getAllWaves = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    /*
    * You're using contractABI here
    */
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    const waves = await wavePortalContract.getAllWaves();
    let wavesCleaned = [];
    waves.forEach(wave => {
      wavesCleaned.push({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000).toUTCString(),
        message: wave.message
      });
    });

    setAllWaves(wavesCleaned);

  }

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        <span role="img" aria-label="wave">👋</span> Hey there!
        </div>

        <div className="bio bold">
        Send a wave to Esh and you might win some ether.</div>
        <div className="bio">Connect your Ethereum wallet, type a message and click <span role="img" aria-label="wave">👋</span>!
        </div>


        <div className="center">
          <input name="message"
          type="text"
          className="message"
          ref={myContainer}
          placeholder="Type a message"/>&nbsp;
          <button className="waveButton" onClick={wave} >
            <span role="img" aria-label="wave">👋</span>
          </button>
          <br/>
          <span name="message" className="bio gold">{message}</span>

          <div className="bio">Total waves so far:{totalWaves}
          </div>

          <div className="bio">Waves from you:{totalWavesFromCurrentAddr}
          </div>


        </div>
        <div>
        <h3>All messages</h3>
        <ul className="fishes">
        {allWaves.map((wave, index) => {
          return (

             <li className="menu-fish">
             <span className="price">{wave.timestamp.toString()}</span>
              <p>From: <b>{wave.address}</b></p>

              <p>Message: <b>{wave.message}</b></p>
            </li>)
        })}
        </ul>
        </div>
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );


}

export default App;
