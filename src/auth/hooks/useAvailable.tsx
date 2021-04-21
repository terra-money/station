import { useTranslation } from "react-i18next"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore"
import { electron } from "../scripts/env"

const useAvailable = () => {
  const { t } = useTranslation()

  if (!electron) return []

  return [
    {
      to: "/auth/new",
      children: t("New wallet"),
      icon: <AddCircleOutlineIcon />,
    },
    {
      to: "/auth/recover",
      children: t("Recover wallet"),
      icon: <SettingsBackupRestoreIcon />,
    },
  ]
}

export default useAvailable
