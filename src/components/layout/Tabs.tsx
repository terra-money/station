import { ReactNode, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import classNames from "classnames/bind"
import { capitalize } from "@mui/material"
import styles from "./Tabs.module.scss"

const cx = classNames.bind(styles)

interface Props {
  tabs: {
    key: string
    tab: string
    children: ReactNode
    disabled?: boolean
    extra?: ReactNode
  }[]
  defaultActiveKey?: string
  type: "line" | "card" | "page"
  reversed?: boolean
  state?: boolean
}

const Tabs = ({ tabs, defaultActiveKey, type, reversed, state }: Props) => {
  const initial = defaultActiveKey ?? tabs[0].key
  const navigate = useNavigate()
  const location = useLocation()
  const hash = location.hash.replace("#", "")

  /* state */
  const [activeKey, setActiveKey] = useState(initial)
  const [sliderStyles, setSliderStyles] = useState({
    width: 0,
    height: 0,
    transform: "translateX(0px)",
  })
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (!state && !hash) navigate({ hash: initial }, { replace: true })
    if (type !== "line") {
      const selectedTab = document.querySelector<HTMLElement>(
        `[href="${location.pathname}#${hash}"]`
      )
      setSliderStyles({
        width: selectedTab?.offsetWidth || 0,
        height: selectedTab?.offsetHeight || 0,
        transform: `translateX(${selectedTab?.offsetLeft}px)`,
      })
    } else {
      const selectedTab = document.getElementById(activeKey)
      setSliderStyles({
        width: selectedTab?.offsetWidth || 88,
        height: 2,
        transform: `translateX(${selectedTab?.offsetLeft}px)`,
      })
    }

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [
    activeKey,
    hash,
    initial,
    location.pathname,
    navigate,
    state,
    type,
    windowSize.width,
    windowSize.height,
  ])

  return (
    <div className={styles.tabsContainer}>
      <section className={cx(styles.tabs, type, { reversed })}>
        {tabs.map(({ key, tab, disabled, extra }) =>
          state ? (
            <button
              type="button"
              className={cx(styles.tab, {
                active: key === activeKey,
                disabled,
              })}
              onClick={() => !disabled && setActiveKey(key)}
              disabled={disabled}
              key={key}
              id={key}
            >
              <div className={styles.title}>{capitalize(tab)}</div>
              {extra}
            </button>
          ) : disabled ? (
            <span className={classNames(styles.tab, styles.disabled)} key={key}>
              <div className={styles.title}>{capitalize(tab)}</div>
              {extra}
            </span>
          ) : (
            <Link
              className={cx(styles.tab, { active: key === hash })}
              to={{ hash: key }}
              key={key}
            >
              <div className={styles.title}>{capitalize(tab)}</div>
              {extra}
            </Link>
          )
        )}
        <div
          className={styles.slider}
          style={{
            width: sliderStyles.width + "px",
            height: sliderStyles.height + "px",
            transform: sliderStyles.transform,
          }}
        ></div>
      </section>
      {type === "page" ? (
        <div className={styles.content}>
          {tabs.find((tab) => tab.key === (state ? activeKey : hash))?.children}
        </div>
      ) : (
        tabs.find((tab) => tab.key === (state ? activeKey : hash))?.children
      )}
    </div>
  )
}

export default Tabs
