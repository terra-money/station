import { PropsWithChildren } from "react"
import { useTranslation } from "react-i18next"
import State from "./State"

const Wrong = ({ children }: PropsWithChildren<{}>) => {
  const { t } = useTranslation()
  return <State>{children ?? t("Something went wrong")}</State>
}

export default Wrong
