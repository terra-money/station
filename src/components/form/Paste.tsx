import { useTranslation } from "react-i18next"
import ContentPasteIcon from "@mui/icons-material/ContentPaste"
import { Flex } from "../layout"

const Paste = ({ paste }: { paste: (lines: string[]) => void }) => {
  const { t } = useTranslation()

  const handleClick = async () => {
    const text = await navigator.clipboard.readText()
    const lines = text
      .split("\n")
      .filter((str) => str)
      .map((str) => str.trim())

    paste(lines)
  }

  return (
    <button type="button" onClick={handleClick}>
      <Flex gap={4}>
        <ContentPasteIcon fontSize="inherit" />
        {t("Paste")}
      </Flex>
    </button>
  )
}

export default Paste
