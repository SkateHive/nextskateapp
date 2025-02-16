import { HStack, Text } from "@chakra-ui/react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { IconType } from "react-icons";

interface MenuItem {
    icon: IconType;
    label: string;
    path: string;
    condition?: boolean;
}

interface MenuItemsProps {
    items: MenuItem[];
    onClose?: () => void;
}

const MenuItems: React.FC<MenuItemsProps> = ({ items, onClose }) => {
    const router = useRouter();

    return (
        <>
            {items.map((item) => item.condition !== false && (
                <HStack key={item.label} padding={0} gap={3} fontSize={"22px"} onClick={onClose}>
                    <item.icon size={"22px"} />
                    <Text fontFamily="Joystix" cursor={"pointer"} _hover={{ color: 'lime' }} onClick={() => router.push(item.path)}>
                        <Link href={item.path}>{item.label}</Link>
                    </Text>
                </HStack>
            ))}
        </>
    );
};

export default MenuItems;
