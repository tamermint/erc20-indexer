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
  const [showNoWalletAlert, setShowNoWalletAlert] = useState(false);
  const [showCustomErrorAlert, setShowCustomErrorAlert] = useState(false);
  const [showUserDidNotConnect, setShowUserDidNotConnect] = useState(false);
  const [shortenedAddress, setShortenedAddress] = useState("");
  const { connect, isConnecting } = useConnectModal();
  const { disconnect } = useDisconnect();
  const activeWallet = useActiveWallet();

  const client = createThirdwebClient({
    clientId: "99af623f39156b036e73c5b25a993162",
  });

  async function getTokenBalance() {
    const config = {
      apiKey: configDotenv.ALCHEMY_API_KEY,
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
      setShowNoWalletAlert(true);

      //make it diappear after 3 s
      setTimeout(() => {
        setShowNoWalletAlert(false);
      }, 5000);
      return;
    }
    try {
      const wallet = await connect({ client });
      console.log(wallet);
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
        setTimeout(() => {
          setShowCustomErrorAlert(false);
        }, 5000);
      }
      setUserAddress(address);
      setShortenedAddress(shortenAddress(address));

      setShowNoWalletAlert(false);
      setShowCustomErrorAlert(false);
      setShowUserDidNotConnect(false);
      return wallet;
    } catch (err) {
      setShowCustomErrorAlert(true);
      console.error(err); //log unexpector error to the console and make alert disappear
      setTimeout(() => {
        setShowCustomErrorAlert(false);
      }, 5000);
    }
  }

  async function disconnectWallet() {
    if (!shortenAddress || !activeWallet) {
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
          //isLoading
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
