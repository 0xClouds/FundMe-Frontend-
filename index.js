import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers)

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
            connectButton.innerHTML = "Connected!"
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "Connected!"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
    } else {
        document.getElementById("connectButton").innerHTML =
            "Please Install Metamask"
    }
}

async function getBalance() {
    //first check if there is an active window into Ethereum
    if (typeof window.ethereum !== "undefined") {
        //Then we need to see who is providing that connection, in this case its Metamask
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // call the balance function
        const balance = await provider.getBalance(contractAddress)

        console.log(ethers.utils.formatEther(balance))
    }
}

// fund function

async function fund(ethAmount) {
    ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        //what do we need to send transaction?
        //provider //connection to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //signer / wallet/ someone with some gas
        const signer = provider.getSigner()
        console.log(signer)
        // contract abi and signer
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("done")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Complete with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

// withdraw
async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            console.log(signer)
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log(
                `Withdrawing: ${ethers.utils.formatEther(
                    transactionResponse.value
                )} to ${signer}`
            )
        } catch (error) {
            console.log(error)
        }
    }
}
