import React from "react";
import {
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { IoFilter } from "react-icons/io5";
import { SORT_OPTIONS } from "@/utils/feedConstants";
import { SortMethod } from "@/utils/feedUtils";

interface SortMenuProps {
  onSortChange: (method: SortMethod) => void;
}

const SortMenu: React.FC<SortMenuProps> = ({ onSortChange }) => {
  return (
    <HStack width="full" justifyContent="flex-end" m={-2} mr={4}>
      <Menu>
        <MenuButton>
          <IoFilter color="#9AE6B4" />
        </MenuButton>
        <MenuList color="white" bg="black" border="1px solid #A5D6A7">
          {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
            <MenuItem
              key={key}
              bg="black"
              onClick={() => onSortChange(key)}
              _hover={{ bg: "gray.800" }}
            >
              <Icon />
              <Text ml={2}>{label}</Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </HStack>
  );
};

export default SortMenu;
