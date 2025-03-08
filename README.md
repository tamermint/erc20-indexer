# Test Header

# Simple ERC-20 Indexer

This is an skeleton app that uses the Alchemy SDK rigged to Alchemy's Enhanced APIs in order to display all of an address's ERC-20 token balances.

## Set Up

1. Install dependencies by running `npm install`
2. Start application by running `npm run dev`

## Challenge

Fork this repo and build out more features! This is minimalistic on purpose.

We purposefully built this app to be minimalistic so that you can get some software development practice in fixing our bugs! 🪲

Here are a few challenge suggestions:

1. Add Wallet integration so that any user that connects their wallet can check their ERC-20 token balance
2. There is no indication of a request in progress... that's bad UX! Do you think you can add some sort of indication of loading?
3. Add some styling! 🎨
4. The token balances can sometimes be a little long and break the outline of the page... can you fix that? 🔧
5. There is no error-checking for wrongly formed requests, or really any error checking of any kind... can you add some in?
6. The images and grid display could look better... anything you can do about that?
7. There are ways to make this app faster... can you implement some of them? How can the query be made _even_ quicker?
8. Can you add ENS support for inputs?
9. Completely open-ended!! Use this as the base for your next hackathon project, dream company or personal expedition :)

## Documentation

- `connectWallet()` implements ThirdWeb's React SDK uses the wallet connect modal to allow users to connect to any of the [supported wallets](https://portal.thirdweb.com/typescript/v5/supported-wallets)

- `disconnectWallet()` implements ThirdWeb's React SDK to disconnect the active wallet via `useActiveWallet()` and `useDisconnect()` hooks

- The following state hooks are used to maintain UX :
  ```jsx
  const [showNoWalletAlert, setShowNoWalletAlert] = useState(false); // Show alert if no wallet is connected
  const [showCustomErrorAlert, setShowCustomErrorAlert] = useState(false); // Show alert if an unexpected error occured and asks user to contact dev
  const [showUserDidNotConnect, setShowUserDidNotConnect] = useState(false); // Show alert if user did not connect
  const [shortenedAddress, setShortenedAddress] = useState(""); // shorten the wallet address so UI doesn't break
  const { connect, isConnecting } = useConnectModal(); // launch wallet connect modal
  const { disconnect } = useDisconnect(); // disconnect the active wallet
  const activeWallet = useActiveWallet(); // maintain the active wallet
  ```
