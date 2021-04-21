import { useTranslation } from "react-i18next"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import { truncate } from "@terra.kitchen/utils"
import { useAddressBook } from "data/settings/AddressBook"
import { Dl } from "components/display"
import styles from "./AddressBookItem.module.scss"

interface Props extends AddressBook {
  onClick: () => void
}

const AddressBookItem = ({ onClick, ...item }: Props) => {
  const { name, recipient, memo } = item
  const { t } = useTranslation()
  const { remove } = useAddressBook()

  return (
    <article className={styles.item}>
      <button className={styles.button} onClick={onClick}>
        <Dl>
          <dt>{t("Name")}</dt>
          <dd>{name}</dd>
          <dt>{t("Address")}</dt>
          <dd>{truncate(recipient)}</dd>
          <dt>{t("Memo")}</dt>
          <dd>{memo}</dd>
        </Dl>
      </button>

      <button
        type="button"
        className={styles.delete}
        onClick={() => {
          if (window.confirm(t("Delete {{name}}?", { name }))) remove(name)
        }}
      >
        <DeleteOutlineIcon style={{ fontSize: 16 }} />
      </button>
    </article>
  )
}

export default AddressBookItem
