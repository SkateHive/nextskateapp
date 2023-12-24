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
}

export default function PostIcon({
  icon,
  label,
  size,
  colorAccent = "darkgrey",
  active = false,
  fill = false,
}: PostIconProps) {
  const [isClicked, setIsCliked] = useState<boolean>(active)

  const handleClick = () => {
    setIsCliked((isClicked) => !isClicked)
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
        color={isClicked ? colorAccent : "darkgrey"}
        fill={fill && isClicked ? colorAccent : "none"}
        onClick={handleClick}
      />
    </Tooltip>
  )
}
