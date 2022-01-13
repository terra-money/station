import { useTranslation } from "react-i18next"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore"
import KeyIcon from "@mui/icons-material/Key"
import GroupsIcon from "@mui/icons-material/Groups"
import { sandbox } from "../scripts/env"

const useAvailable = () => {
  const { t } = useTranslation()

  if (!sandbox) return []

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
    {
      to: "/auth/import",
      children: t("Import wallet"),
      icon: <KeyIcon />,
    },
    {
      to: "/auth/multisig/new",
      children: t("New multisig wallet"),
      icon: <GroupsIcon />,
    },
  ]
}

export default useAvailable
