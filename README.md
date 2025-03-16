# Simple ERC-20 Indexer

## Live Link - [ERC20 Indexer App](https://erc20indexer.netlify.app/)

![img](./SPA-Home-1.png)

This is an skeleton app that uses the Alchemy SDK rigged to [Alchemy's Enhanced APIs](https://docs.alchemy.com/reference/enhanced-apis-overview) in order to display all of an address's ERC-20 token balances. Powered by [ThirdWeb](https://portal.thirdweb.com/) and [Chakra UI] (https://v2.chakra-ui.com/). This project utilizes [jsdoc](https://jsdoc.app/) for code generation

> DISCLAIMER: PLEASE REMEMBER TO AUDIT CODE BEFORE TRYING TO TEST ANY APP. PLEASE DO NOT CONNECT YOUR PRIMARY WALLET TO TRY THIS APP. ALWAYS REMEMBER TO USE A WALLET WITH NON-ZERO FUNDS IF CONNECTING. KEYING IN YOUR WALLET ADDRESS / ENS NAME IS THE BEST WAY TO CHECK BALANCE

## Set Up (Local)

1. Clone this repo via git clone via `https://github.com/tamermint/erc20-indexer.git`
2. Install dependencies by running `npm install`
3. Build using `npm run build`
4. Start application by running `npm run preview`
5. (Optionally) start dev server by `npm run dev`

## Features

- `connectWallet()` implements ThirdWeb's React SDK uses the wallet connect modal to allow users to connect to any of the [supported wallets](https://portal.thirdweb.com/typescript/v5/supported-wallets)

- `disconnectWallet()` implements ThirdWeb's React SDK to disconnect the active wallet via `useActiveWallet()` and `useDisconnect()` hooks

- `function createThirdwebClient( options: CreateThirdwebClientOptions, ): ThirdwebClient` implments [ThirdWeb's SDK](https://portal.thirdweb.com/references/typescript/v5/createThirdwebClient) to create a client based on a client ID

- `getTokenBalance()` implements Alchemy's [resolveName](https://docs.alchemy.com/docs/how-to-resolve-ewallet-given-ens#4-write-script-using-resolvename-to-resolve-a-wallet-address-from-an-ens-domain) APIU to accept ENS name as inputs, [getTokenBalances](https://docs.alchemy.com/reference/gettokenbalances-sdk-v3) API to get balance for an address, [getTokenMetadata](https://docs.alchemy.com/reference/gettokenmetadata-sdk-v3) API to return symbol and name for each token

- `getOwnBalance()` gets the `activeWallet` connected via `useActiveWallet()` and then calls `getTokenBalance()`

- `shortenLargeNumbers()` Takes a large number and replaces numbers after decimal to appropriate suffix e.g. 123000000 becomes 12.3M

- `formatter()` converts token balances into decimals from hex values returned by calling `getTokenBalances()`

- The following hooks are used to render results and token metadata :

  ```jsx
  const [results, setResults] = useState([]); //Raw ERC-20 token balances returned by Alchemy.
  const [userAddress, setUserAddress] = useState(""); //The address to check for token balances, or the connected wallet address if one is connected.
  const [hasQueried, setHasQueried] = useState(false); //Whether the user has queried for ERC-20 token balances.
  const [tokenDataObjects, setTokenDataObjects] = useState([]); //Array of token metadata objects from Alchemy (symbol, decimals, logo, etc.).
  ```

- The following state hooks are used to maintain UX (custom alerts, async calls etc.):

  ```jsx
  const [showNoWalletAlert, setShowNoWalletAlert] = useState(false); // Show alert if no wallet is connected
  const [showCustomErrorAlert, setShowCustomErrorAlert] = useState(false); // Show alert if an unexpected error occured and asks user to contact dev
  const [showUserDidNotConnect, setShowUserDidNotConnect] = useState(false); // Show alert if user did not connect
  const [shortenedAddress, setShortenedAddress] = useState(""); // shorten the wallet address so UI doesn't break
  const { connect, isConnecting } = useConnectModal(); // launch wallet connect modal
  const { disconnect } = useDisconnect(); // disconnect the active wallet
  const activeWallet = useActiveWallet(); // maintain the active wallet
  const [isLoading, setIsLoading] = useState(false); //intended for async calls so user doesn't see a blank screen
  ```

- Refer to the global.html file in the output folder for detailed documentation
