import { ChangeEvent } from "react"
import { useTranslation } from "react-i18next"
import numeral from "numeral"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import styles from "./Upload.module.scss"

interface Props {
  value?: File
  onUpload: (file: File) => void
}

const Upload = ({ value, onUpload }: Props) => {
  const { t } = useTranslation()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if (!files?.length) return
    const file = files[0]
    onUpload(file)
  }

  return (
    <>
      <input type="file" id="file" onChange={handleChange} hidden />

      <label className={styles.label} htmlFor="file">
        {value?.name ?? (
          <>
            <CloudUploadIcon fontSize="small" />
            {t("Upload a wasm file")}
          </>
        )}
      </label>

      {value && (
        <footer className={styles.footer}>
          <strong>{t("Size")}:</strong> {numeral(value.size).format("0b")}
        </footer>
      )}
    </>
  )
}

export default Upload
