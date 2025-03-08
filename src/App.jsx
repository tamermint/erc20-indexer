import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { Alchemy, Network, Utils } from "alchemy-sdk";
import { useState } from "react";
import { shortenAddress } from "thirdweb/utils";
import {
  useConnectModal,
  useDisconnect,
  useActiveWallet,
} from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

/**
 * A React component that displays a connect button, disconnect button,
 * and allows querying for ERC-20 token balances on Ethereum mainnet.
 *
 * @function App
 * @author Vivek Mitra
 * @returns {JSX.Element} The rendered React component.
 */
function App() {
  /**
   * The address to check for token balances, or the connected wallet address if one is connected.
   * @member {string} userAddress
   * @type {string}
   */
  const [userAddress, setUserAddress] = useState("");

  /**
   * Raw ERC-20 token balances returned by Alchemy.
   * @member {Array<Object>} results
   * @type {Array<Object>}
   */
  const [results, setResults] = useState([]);

  /**
   * Whether the user has queried for ERC-20 token balances.
   * @member {boolean} hasQueried
   * @type {boolean}
   */
  const [hasQueried, setHasQueried] = useState(false);

  /**
   * Array of token metadata objects from Alchemy (symbol, decimals, logo, etc.).
   * @member {Array<Object>} tokenDataObjects
   * @type {Array<Object>}
   */
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  /**
   * Whether to show an alert indicating no wallet extension is installed.
   * @member {boolean} showNoWalletAlert
   * @type {boolean}
   */
  const [showNoWalletAlert, setShowNoWalletAlert] = useState(false);

  /**
   * Whether to show an alert indicating an unexpected error occurred.
   * @member {boolean} showCustomErrorAlert
   * @type {boolean}
   */
  const [showCustomErrorAlert, setShowCustomErrorAlert] = useState(false);

  /**
   * Whether to show an alert that the user canceled or did not connect a wallet.
   * @member {boolean} showUserDidNotConnect
   * @type {boolean}
   */
  const [showUserDidNotConnect, setShowUserDidNotConnect] = useState(false);

  /**
   * The shortened wallet address for UI display after connecting.
   * @member {string} shortenedAddress
   * @type {string}
   */
  const [shortenedAddress, setShortenedAddress] = useState("");

  // thirdweb hooks
  /**
   * @member useConnectModal
   * @description Implements ThirdWeb's React hook to connect the user to a wallet and opens the modal.
   * @returns {Promise.<(Object|undefined)>} A wallet object
   */
  const { connect, isConnecting } = useConnectModal();

  /**
   * @member useDisconnect
   * @description Disconnects the wallet.
   * @returns {void}
   */
  const { disconnect } = useDisconnect();

  /**
   * @member useActiveWallet
   * @description Returns active wallet connected to the dapp
   * @returns {Promise.<(Object|undefined)>} A wallet Object
   */
  const activeWallet = useActiveWallet();

  // Create thirdweb client
  /**
   * @function createThirdwebClient
   * @description Creates a thirdweb client instance
   * @returns {Promise.<(Object|undefined)>}
   */
  const client = createThirdwebClient({
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
  });

  /**
   * Fetches and sets the user's ERC-20 token balances for the current `userAddress`.
   *
   * @async
   * @function getTokenBalance
   * @returns {Promise<void>} No direct return value, but updates component state.
   */
  async function getTokenBalance() {
    const config = {
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
      network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(config);
    const data = await alchemy.core.getTokenBalances(userAddress);

    setResults(data);

    const tokenDataPromises = data.tokenBalances.map((tokenBalance) =>
      alchemy.core.getTokenMetadata(tokenBalance.contractAddress)
    );
    const metadata = await Promise.all(tokenDataPromises);

    setTokenDataObjects(metadata);
    setHasQueried(true);
  }

  /**
   * Opens the thirdweb connect modal. If a wallet is successfully connected,
   * stores its address in state (both full and shortened).
   *
   * @async
   * @function connectWallet
   * @returns {Promise<Object|undefined>} The wallet object, or `undefined` if cancelled.
   */
  async function connectWallet() {
    if (!window.ethereum) {
      setShowNoWalletAlert(true);
      setTimeout(() => {
        setShowNoWalletAlert(false);
      }, 5000);
      return;
    }
    try {
      const wallet = await connect({ client });
      if (!wallet) {
        setShowUserDidNotConnect(true);
        setTimeout(() => {
          setShowUserDidNotConnect(false);
        }, 5000);
        return;
      }
      const accountInfo = await wallet.getAccount();
      const address = accountInfo?.address;

      if (!address) {
        setShowCustomErrorAlert(true);
        setTimeout(() => setShowCustomErrorAlert(false), 5000);
        return;
      }

      setUserAddress(address);
      setShortenedAddress(shortenAddress(address));
      setShowNoWalletAlert(false);
      setShowCustomErrorAlert(false);
      setShowUserDidNotConnect(false);

      return wallet;
    } catch (err) {
      setShowCustomErrorAlert(true);
      console.error(err);
      setTimeout(() => setShowCustomErrorAlert(false), 5000);
    }
  }

  /**
   * Disconnects the active wallet, if present, and resets local state.
   *
   * @async
   * @function disconnectWallet
   * @returns {Promise<void>}
   */
  async function disconnectWallet() {
    if (!shortenedAddress || !activeWallet) {
      setShowUserDidNotConnect(true);
      setTimeout(() => {
        setShowUserDidNotConnect(false);
      }, 5000);
      return;
    }
    disconnect(activeWallet);
    setUserAddress("");
    setShortenedAddress("");
    setHasQueried(false);
    setResults([]);
    setTokenDataObjects([]);
  }

  return (
    <Box w="100vw" h="100vh">
      {showUserDidNotConnect && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Wallet did not connect!</AlertTitle>
          <AlertDescription>Please try again!</AlertDescription>
        </Alert>
      )}
      {showCustomErrorAlert && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Unexpected Error Occurred!</AlertTitle>
          <AlertDescription>
            Please contact support - tamermint@github
          </AlertDescription>
        </Alert>
      )}
      {showNoWalletAlert && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>You do not have a wallet installed!</AlertTitle>
          <AlertDescription>
            Please install Metamask or Coinbase Wallet
          </AlertDescription>
        </Alert>
      )}

      <Box position="absolute" top="50" right="50">
        <Button
          loadingText="Connecting"
          size="lg"
          colorScheme="teal"
          variant="outline"
          onClick={connectWallet}
          isDisabled={isConnecting || Boolean(shortenedAddress)}
        >
          {shortenedAddress || "Connect Wallet"}
        </Button>
      </Box>
      <Box position="absolute" top="100" right="50">
        <Button
          size="lg"
          colorScheme="teal"
          variant="outline"
          onClick={disconnectWallet}
          isDisabled={!shortenedAddress}
        >
          Disconnect Wallet
        </Button>
      </Box>
      <Center>
        <Flex
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <Heading m="50" size="2xl">
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Heading mt={10} mb={10}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button
          fontSize={20}
          size="lg"
          colorScheme="teal"
          variant="outline"
          onClick={getTokenBalance}
          mt={10}
        >
          Check ERC-20 Token Balances
        </Button>
        <Heading my={20}>ERC-20 token balances:</Heading>
        {hasQueried ? (
          <SimpleGrid w="90vw" columns={4} spacing={24}>
            {results.tokenBalances.map((tokenBalance, i) => (
              <Flex
                flexDir="column"
                color="white"
                bg="blue"
                w="20vw"
                key={`${tokenBalance.contractAddress}-${i}`}
              >
                <Box>
                  <b>Symbol:</b> {tokenDataObjects[i].symbol}
                </Box>
                <Box>
                  <b>Balance:</b>{" "}
                  {Utils.formatUnits(
                    tokenBalance.tokenBalance,
                    tokenDataObjects[i].decimals
                  )}
                </Box>
                <Image src={tokenDataObjects[i].logo} alt="Token Logo" />
              </Flex>
            ))}
          </SimpleGrid>
        ) : (
          "Please make a query! This may take a few seconds..."
        )}
      </Flex>
    </Box>
  );
}

export default App;
