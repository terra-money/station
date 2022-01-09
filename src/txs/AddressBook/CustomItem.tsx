import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import { Dl } from "components/display"
import styles from "./CustomItem.module.scss"

interface Props {
  name: string
  contents: { title: string; desc: string }[]
  onClick: () => void
  onDelete: (name: string) => void
}

const CustomItem = ({ name, contents, onClick, onDelete }: Props) => {
  const { t } = useTranslation()

  return (
    <article className={styles.item}>
      <button className={styles.button} onClick={onClick}>
        <Dl>
          <dt>{t("Name")}</dt>
          <dd>{name}</dd>
          {contents.map(({ title, desc }) => (
            <Fragment key={title}>
              <dt>{title}</dt>
              <dd>{desc}</dd>
            </Fragment>
          ))}
        </Dl>
      </button>

      <button
        type="button"
        className={styles.delete}
        onClick={() => {
          if (window.confirm(t("Delete {{name}}?", { name }))) onDelete(name)
        }}
      >
        <DeleteOutlineIcon style={{ fontSize: 16 }} />
      </button>
    </article>
  )
}

export default CustomItem
