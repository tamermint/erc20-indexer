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
import { configDotenv } from "dotenv";
import { shortenAddress } from "thirdweb/utils";
import {
  useConnectModal,
  useDisconnect,
  useActiveWallet,
} from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  /**@notice Alerts to enhance UX and handle error flow and React's error boundaries */
  const [showNoWalletAlert, setShowNoWalletAlert] = useState(false); // Show alert if no wallet is connected
  const [showCustomErrorAlert, setShowCustomErrorAlert] = useState(false); // Show alert if an unexpected error occured and asks user to contact dev
  const [showUserDidNotConnect, setShowUserDidNotConnect] = useState(false); // Show alert if user did not connect

  /**@notice UI hook to shorten address */
  const [shortenedAddress, setShortenedAddress] = useState(""); // shorten the wallet address so UI doesn't break

  /**@notice Wallet hooks to launch wallet connect modal, maintain active wallet for connecting and disconnecting wallet */
  const { connect, isConnecting } = useConnectModal(); // launch wallet connect modal
  const { disconnect } = useDisconnect(); // disconnect the active wallet
  const activeWallet = useActiveWallet(); // maintain the active wallet

  const client = createThirdwebClient({
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
  });

  async function getTokenBalance() {
    const config = {
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
      network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(config);
    const data = await alchemy.core.getTokenBalances(userAddress);

    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
  }

  async function connectWallet() {
    if (!window.ethereum) {
      //if no wallet extension installed in browser, show an alert
      setShowNoWalletAlert(true);

      //make it diappear after 3 s
      setTimeout(() => {
        setShowNoWalletAlert(false);
      }, 5000);
      return;
    }
    try {
      const wallet = await connect({ client }); //launch connect modal
      //if somehow wallet doesn't show up either due to connection problems, show alert
      if (!wallet) {
        setShowUserDidNotConnect(true);
        //make alert disappear after 5 s
        setTimeout(() => {
          setShowUserDidNotConnect(false);
        }, 5000);
        return;
      }
      const accountInfo = await wallet.getAccount(); //get wallet object
      const address = accountInfo?.address; //access the address attribute
      if (!address) {
        setShowCustomErrorAlert(true); //if address doesn't show up, ask user to contact dev
        setTimeout(() => {
          setShowCustomErrorAlert(false);
        }, 5000);
      }
      setUserAddress(address); //otherwise, set user's address
      setShortenedAddress(shortenAddress(address)); //get a shorter address to show on the UI

      //reset all other wallet states
      setShowNoWalletAlert(false);
      setShowCustomErrorAlert(false);
      setShowUserDidNotConnect(false);
      return wallet;
    } catch (err) {
      /**@Dev check error in console, if ultimately something doesn't connect - API exhaustion policy etc. */
      setShowCustomErrorAlert(true);
      console.error(err); //log unexpector error to the console and make alert disappear
      setTimeout(() => {
        setShowCustomErrorAlert(false);
      }, 5000);
    }
  }

  /**@notice disconnect wallet */
  async function disconnectWallet() {
    if (!shortenAddress || !activeWallet) {
      //to make sure that wallet is conected before allowing disconnect
      setShowUserDidNotConnect(true);

      setTimeout(() => {
        setShowUserDidNotConnect(false);
      }, 5000);
      return;
    }
    /**@notice disconnect wallet and clear local state */
    disconnect(activeWallet);
    setUserAddress("");
    setShortenedAddress("");
    setHasQueried(false);
    setResults([]);
    setTokenDataObjects([]);
  }

  return (
    <Box w="100vw" h="100vh">
      {
        //implement ChakraUI's alert modals
        showUserDidNotConnect && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Wallet did not connect!</AlertTitle>
            <AlertDescription>Please try again!</AlertDescription>
          </Alert>
        )
      }
      {showCustomErrorAlert && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Unexpected Error Occured!</AlertTitle>
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
          //check against whether wallet is already connected
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
          //check against whether wallet is connected before disconnecting
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
          alignItems={"center"}
          justifyContent="center"
          flexDirection={"column"}
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
        justifyContent={"center"}
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
          <SimpleGrid w={"90vw"} columns={4} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Flex
                  flexDir={"column"}
                  color="white"
                  bg="blue"
                  w={"20vw"}
                  key={e.id}
                >
                  <Box>
                    <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                  </Box>
                  <Box>
                    <b>Balance:</b>&nbsp;
                    {Utils.formatUnits(
                      e.tokenBalance,
                      tokenDataObjects[i].decimals
                    )}
                  </Box>
                  <Image src={tokenDataObjects[i].logo} />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          "Please make a query! This may take a few seconds..."
        )}
      </Flex>
    </Box>
  );
}

export default App;
