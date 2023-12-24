"use client"
import { Icon, Tooltip } from "@chakra-ui/react"
import { LucideIcon } from "lucide-react"
import { useState } from "react"

interface PostIconProps {
  icon: LucideIcon
  label: string
  size: number
  colorAccent?: string
  active?: boolean
  fill?: boolean
  onClick: () => any
}

export default function PostIcon({
  icon,
  label,
  size,
  onClick,
  colorAccent = "darkgrey",
  active = false,
  fill = false,
}: PostIconProps) {
  const [isActive, setIsActive] = useState<boolean>(active)
  const handleClick = async () => {
    try {
      await onClick()
      setIsActive((isClicked) => !isClicked)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Tooltip label={label}>
      <Icon
        as={icon}
        boxSize={size}
        cursor={"pointer"}
        strokeWidth={"1.5"}
        _active={{
          transform: "scale(1.2)",
        }}
        transition="transform 0.1s ease-out"
        color={isActive ? colorAccent : "darkgrey"}
        fill={fill && isActive ? colorAccent : "none"}
        onClick={handleClick}
      />
    </Tooltip>
  )
}
