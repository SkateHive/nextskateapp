"use client"

import useAuthHiveUser from "@/lib/useHiveAuth"
import {
  Avatar,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip,
} from "@chakra-ui/react"
import { Bell, LogOut, User } from "lucide-react"
import Link from "next/link"
import LoginButton from "../Hive/Login/LoginButton"

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
            borderRadius={"100%"}
            size="md"
            bg="gray.200"
          />
        </Tooltip>
      </MenuButton>
      <MenuList bg="black">
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
          icon={<User size={"16px"} />}
          as={Link}
          href={`/plaza`}
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
