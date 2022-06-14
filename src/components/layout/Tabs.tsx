import { ReactNode, useEffect, useState, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import classNames from "classnames/bind"
import { ModalButton, ModalRef, Mode } from "components/feedback"
import { capitalize } from "@mui/material"
import styles from "./Tabs.module.scss"
import { RadioGroup } from "../form"
import Button from "../general/Button"
import { Grid } from "./index"
import Card from "./Card"
import { ReactComponent as FilterIcon } from "styles/images/icons/Filter.svg"

const cx = classNames.bind(styles)

interface Props {
  tabs: { key: string; tab: string; children: ReactNode; disabled?: boolean }[]
  defaultActiveKey?: string
  type: "line" | "card" | "filter"
  reversed?: boolean
  state?: boolean
}

const Tabs = ({ tabs, defaultActiveKey, type, reversed, state }: Props) => {
  const initial = defaultActiveKey ?? tabs[0].key
  const navigate = useNavigate()
  const location = useLocation()
  const selectorRef = useRef<ModalRef>({
    open: () => {},
    close: () => {},
  })

  const hash = location.hash.replace("#", "")

  useEffect(() => {
    if (!state && !hash) navigate({ hash: initial }, { replace: true })
  }, [hash, initial, navigate, state])

  /* state */
  const [activeKey, setActiveKey] = useState(initial)

  return (
    <>
      {type === "filter" ? (
        <ModalButton
          ref={selectorRef}
          modalType={Mode.SELECT}
          renderButton={(open) => (
            <Card className="blankWithSlimPad">
              <Button
                onClick={open}
                size="small"
                icon={<FilterIcon {...{ width: 16, height: 16 }} />}
              >
                {
                  tabs.find((tab) => tab.key === (state ? activeKey : hash))
                    ?.tab
                }
              </Button>
            </Card>
          )}
        >
          <Grid gap={20}>
            <RadioGroup
              options={tabs.map((item) => ({
                value: item.key,
                label: item.tab,
              }))}
              value={state ? activeKey : hash}
              onChange={(value) => {
                selectorRef.current?.close()
                state ? setActiveKey(value) : navigate({ hash: value })
              }}
              mobileModal={true}
            />
          </Grid>
        </ModalButton>
      ) : (
        <section className={cx(styles.tabs, type, { reversed })}>
          {tabs.map(({ key, tab, disabled }) =>
            state ? (
              <button
                type="button"
                className={cx(styles.tab, {
                  active: key === activeKey,
                  disabled,
                })}
                onClick={() => {
                  console.log(key)
                  !disabled && setActiveKey(key)
                }}
                disabled={disabled}
                key={key}
              >
                {capitalize(tab)}
              </button>
            ) : disabled ? (
              <span
                className={classNames(styles.tab, styles.disabled)}
                key={key}
              >
                {capitalize(tab)}
              </span>
            ) : (
              <Link
                className={cx(styles.tab, { active: key === hash })}
                to={{ hash: key }}
                key={key}
              >
                {capitalize(tab)}
              </Link>
            )
          )}
        </section>
      )}

      {tabs.find((tab) => tab.key === (state ? activeKey : hash))?.children}
    </>
  )
}

export default Tabs
