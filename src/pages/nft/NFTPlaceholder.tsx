import { useState } from "react"
import { groupBy } from "ramda"
import classNames from "classnames/bind"
import useInterval from "utils/hooks/useInterval"
import { useCW721Whitelist } from "data/Terra/TerraAssets"
import { Flex } from "components/layout"
import styles from "./NFTPlaceholder.module.scss"

const cx = classNames.bind(styles)

const TOTAL = 3
const DELAY = 3000 // null to stop animation

interface ItemProps {
  src: string
  alt: string
  zIndex: number
}

const NFTPlaceholderItem = ({ src, alt, zIndex }: ItemProps) => {
  const [error, setError] = useState(false)

  if (error) return null

  const hidden = !(zIndex === 0 || zIndex === 1 || zIndex === 2)
  const className = cx(styles.item, `item-${zIndex}`, { hidden }) // wrapper
  const attrs = { src, className: styles.image, width: 50, height: 50 } // image

  return (
    <div className={className} style={{ zIndex }}>
      <img {...attrs} onError={() => setError(true)} alt={alt} />
    </div>
  )
}

const List = ({ list }: { list: CW721ContractItem[][] }) => {
  const [start, setStart] = useState(0)
  const length = list.length - (list.length % TOTAL)

  useInterval(
    () => setStart((n) => (n + TOTAL === length ? 0 : n + TOTAL)),
    DELAY
  )

  return (
    <Flex>
      {list.map(([{ icon, name }], index) => {
        if (!icon) return null
        const zIndex = index - start
        return (
          <NFTPlaceholderItem
            src={icon}
            alt={name}
            zIndex={zIndex}
            key={name}
          />
        )
      })}
    </Flex>
  )
}

const NFTPlaceholder = () => {
  const { data } = useCW721Whitelist()

  if (!data) return null

  const byProtocol = groupBy(
    ({ protocol, name }) => protocol ?? name,
    Object.values(data ?? {}).filter(({ icon }) => icon)
  )

  return <List list={Object.values(byProtocol ?? {})} />
}

export default NFTPlaceholder
