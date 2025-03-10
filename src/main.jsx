import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { ThirdwebProvider } from "thirdweb/react";
import { extendTheme } from "@chakra-ui/react";
// Supports weights 100-900
import "@fontsource-variable/montserrat";

const theme = extendTheme({
  fonts: {
    heading: `'Montserrat Variable', sans-serif`,
    body: `'Montserrat Variable', sans-serif`,
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ThirdwebProvider>
        <App />
      </ThirdwebProvider>
    </ChakraProvider>
  </React.StrictMode>
);
