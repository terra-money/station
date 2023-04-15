import { useState } from "react"
import { useTranslation } from "react-i18next"
import ReactModal from "react-modal"
import classNames from "classnames/bind"
import styles from "./WelcomeModal.module.scss"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { ExternalLink } from "components/general"

const cx = classNames.bind(styles)

const accordions = [
  {
    title: "New Wallet",
    content: [
      [
        "Click connect and then select ",
        <span className={styles.highlighted}>New wallet</span>,
        ". You can find a guide ",
        <ExternalLink
          href="https://docs.terra.money/learn/station/wallet#create-a-wallet"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </ExternalLink>,
        ".",
      ],
    ],
  },
  {
    title: "Existing Wallet",
    content: [
      [
        "Click connect and then select ",
        <span className={styles.highlighted}>Import from seed phrase</span>,
        ". Or, if you have a private key from a previous Station wallet select ",
        <span className={styles.highlighted}>Import from private key</span>,
        ".",
      ],
      [
        " You can find a guide ",
        <ExternalLink
          href="https://docs.terra.money/learn/station/migration/"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </ExternalLink>,
        ".",
      ],
    ],
  },
  {
    title: "Ledger",
    content: [
      [
        "Select ",
        <span className={styles.highlighted}>Access with ledger</span>,
        " in the Station extension or ",
        <ExternalLink
          href="https://station.terra.money/"
          target="_blank"
          rel="noopener noreferrer"
        >
          web app
        </ExternalLink>,
        ".",
      ],
    ],
  },
]

const WelcomeModal = () => {
  const { t } = useTranslation()

  const [openAcc, setOpenAcc] = useState(0)
  const [forceClose, setForceClose] = useState(false)

  const handleClick = (index: any) => {
    setOpenAcc(index === openAcc ? 0 : index)
  }

  const submitButton = () => {
    localStorage.setItem("welcomeModal", "true")
    setForceClose(true)
  }

  return (
    <ReactModal
      isOpen={!forceClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <h1 className={styles.title}>{t("Get started with Station")}</h1>
      <h3 className={styles.subtitle}>
        Your crypto wallet for the interchain and beyond
      </h3>

      <div className={styles.accordions}>
        {accordions.map((acc, i) => (
          <section
            className={cx(styles.accordion, openAcc === i + 1 ? "opened" : "")}
            key={`accordion-${i + 1}`}
          >
            <div className={styles.top} onClick={() => handleClick(i + 1)}>
              <h5 className={styles.title}>{acc.title}</h5>
              <KeyboardArrowDownIcon className={styles.icon} />
            </div>
            <div className={styles.content}>
              <ul>
                {acc.content.map((content, i) => (
                  <li>{content}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
      <button className={styles.confirm} onClick={submitButton}>
        Confirm
      </button>
    </ReactModal>
  )
}

export default WelcomeModal
