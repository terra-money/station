import { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import ButtonGroup from "./ButtonGroup"
import styles from "./Range.module.scss"

interface Props {
  initial?: number
  includeLastDay?: boolean
  children: (start: number) => ReactNode
}

const Range = ({ initial, children, includeLastDay }: Props) => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(initial ?? 0)

  const list = [
    { label: t("All"), value: 0 },
    { label: t("3D"), value: 3 },
    { label: t("{{d}}W", { d: 1 }), value: 7 },
    { label: t("{{d}}W", { d: 2 }), value: 14 },
    { label: t("{{d}}M", { d: 1 }), value: 30 },
  ].filter(({ value }) => !(value === 3 && !includeLastDay))

  return (
    <article className={styles.grid}>
      {children(selected)}
      <ButtonGroup value={selected} onChange={setSelected} options={list} />
    </article>
  )
}

export default Range
