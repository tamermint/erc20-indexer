import {
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
import { ethers } from "ethers";
import { Core } from "@walletconnect/core";
import { WalletKit } from "@reown/walletkit";
import { configDotenv } from "dotenv";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  const core = new Core({
    projectId: configDotenv.REOWN_PROJECT_ID,
  });

  const walletKit = WalletKit.init({
    core, // <- pass the shared `core` instance
    metadata: {
      name: "ERC20 Indexer app",
      description: "Demo Client as Wallet/Peer",
      url: "",
      icons: [],
    },
  });

  async function getTokenBalance() {
    const config = {
      apiKey: "TFbZzSnJh2XYSlBHtQfyic4DK7F3bfBU",
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
      alert("Please install a wallet!");
      return;
    }
    try {
    } catch {}
  }
  return (
    <Box w="100vw" h="100vh">
      <Box position="absolute" top="50" right="50">
        <Button size="lg" colorScheme="teal" variant="outline">
          Connect Wallet
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
