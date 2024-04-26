"use client"

import useAuthHiveUser from "@/lib/useHiveAuth"
import {
  Avatar,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip,
  Box,
  Button,
  Image,
} from "@chakra-ui/react"
import { Bell, Divide, LogOut, User } from "lucide-react"
import Link from "next/link"
import LoginButton from "../Hive/Login/LoginButton"
import { FaEthereum, FaSpeakap, FaWallet } from "react-icons/fa"
import { ConnectButton } from "@rainbow-me/rainbowkit"

const env = process.env.NODE_ENV

export default function AvatarLogin() {
  const { hiveUser, logout } = useAuthHiveUser()

  return hiveUser ? (
    <Menu placement="bottom-end">
      <MenuButton>
        <Tooltip label="Profile">
          <Avatar
            name={hiveUser.name}
            src={hiveUser.metadata?.profile.profile_image}
            borderRadius={"10px"}
            size="md"
            bg="gray.200"
          />
        </Tooltip>
      </MenuButton>

      <MenuList bg="black">

        <Box minW="100%" p={2} bg="black" color="white">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              // Note: If your app doesn't use authentication, you
              // can remove all 'authenticationStatus' checks
              const ready = mounted && authenticationStatus !== 'loading';
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button leftIcon={<FaEthereum />} onClick={openConnectModal} >
                          Connect Wallet
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button color={"red"} leftIcon={<Image alt="" boxSize={"28px"} src="/pepenation.gif" />} onClick={openChainModal} >
                          Wrong network
                        </Button>
                      );
                    }

                    return (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button
                          onClick={openChainModal}
                          style={{ display: 'flex', alignItems: 'center' }}
                          type="button"
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 12,
                                height: 12,
                                borderRadius: 999,
                                overflow: 'hidden',
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <Image
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  style={{ width: 12, height: 12 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </button>

                        <button onClick={openAccountModal} type="button">
                          {account.ensName ? account.ensName : account.displayName}
                          {account.displayBalance
                            ? ` (${account.displayBalance})`
                            : ''}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </Box>
        <MenuItem
          icon={<Bell size={"16px"} />}
          as={Link}
          href={"/notifications"}
          bg="black"
        >
          Notifications
        </MenuItem>
        <MenuItem
          bg="black"
          icon={<User size={"16px"} />}
          as={Link}
          href={`/profile/${hiveUser.name}`}
        >
          Profile
        </MenuItem>
        <MenuItem
          bg="black"
          icon={<FaEthereum size={"16px"} />}
          as={Link}
          href={`/dao`}
        >
          Dao
        </MenuItem>
        <MenuItem
          bg="black"
          icon={<FaWallet size={"16px"} />}
          as={Link}
          href={`/wallet`}
        >
          Wallet
        </MenuItem>
        <MenuItem
          bg="black"
          icon={<FaSpeakap size={"16px"} />}
          as={Link}
          href={`/plaza2`}
        >
          Plaza
        </MenuItem>
        <MenuItem bg="black" icon={<LogOut size={"16px"} />} onClick={logout}>
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  ) : (
    <LoginButton />
  )
}
