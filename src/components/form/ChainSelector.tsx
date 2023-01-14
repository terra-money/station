import { useNetwork } from 'data/wallet'
import { useEffect, useMemo, useState } from 'react'
import styles from './ChainSelector.module.scss'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

interface Props {
  chainsList: string[]
  onChange: (chain: string) => void
}

const ChainSelector = ({ chainsList, onChange }: Props) => {
  const networks = useNetwork()
  const list = useMemo(
    () =>
      Object.values(networks)
        .filter((c) => chainsList.includes(c.chainID))
        .sort((a, b) => {
          if (a.name === 'Terra') return -1
          if (b.name === 'Terra') return 1
          return 0
        }),
    [networks, chainsList],
  )
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (index >= list.length) setIndex(0)
  }, [list, index])

  useEffect(() => {
    onChange(list[index]?.chainID ?? '')
  }, [index]) // eslint-disable-line

  return (
    <div className={styles.container}>
      <button
        className={styles.selector}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((o) => !o)
        }}
      >
        <span>
          <img src={list[index]?.icon} alt={list[index]?.name} />{' '}
          {list[index]?.name}
        </span>{' '}
        <ArrowDropDownIcon style={{ fontSize: 20 }} className={styles.caret} />
      </button>
      {open && (
        <div className={styles.options}>
          {list.map(({ chainID, name, icon }, i) => (
            <button
              className={chainID === list[index]?.chainID ? styles.active : ''}
              key={chainID}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIndex(i)
                setOpen(false)
              }}
            >
              <img src={icon} alt={name} />
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChainSelector
