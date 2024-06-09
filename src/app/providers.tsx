// src/app/providers.tsx

"use client";

import { PostsProvider } from "@/contexts/PostsContext";
import { UserProvider } from "@/contexts/UserContext";
import { ChakraProvider } from "@chakra-ui/react"; // Ensure ChakraProvider is imported
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { WagmiProvider } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import theme from '../theme'; // Ensure you import the theme

const wagmiConfig = getDefaultConfig({
  appName: "SkateHive",
  projectId: "52f3a9b032f5caf26719af6939715629",
  ssr: true,
  chains: [base, mainnet],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            ...darkTheme.accentColors.green,
            borderRadius: "small",
          })}
        >
          <ChakraProvider theme={theme}>
            <UserProvider>
              <PostsProvider>{children}</PostsProvider>
            </UserProvider>
          </ChakraProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
