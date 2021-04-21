import { useTranslation } from "react-i18next"
import Wrong from "./Wrong"

const Forbidden = () => {
  const { t } = useTranslation()

  return (
    <Wrong>
      {t(
        "This IP has been flagged for potential security violations. Change your network configuration."
      )}
    </Wrong>
  )
}

export default Forbidden
