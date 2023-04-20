import { PropsWithChildren, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined"
import State from "./State"

const Empty = ({
  icon,
  text,
  children,
}: PropsWithChildren<{ icon?: ReactNode; text?: string }>) => {
  const { t } = useTranslation()

  return (
    <State icon={icon ?? <InboxOutlinedIcon fontSize="inherit" />}>
      {children ?? t(text || "No results found")}
    </State>
  )
}

export default Empty
