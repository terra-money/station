import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined"
import State from "./State"

const Empty: FC<{ icon?: ReactNode }> = ({ icon, children }) => {
  const { t } = useTranslation()

  return (
    <State icon={icon ?? <InboxOutlinedIcon fontSize="inherit" />}>
      {children ?? t("No results found")}
    </State>
  )
}

export default Empty
