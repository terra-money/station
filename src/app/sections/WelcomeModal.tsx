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
    title: "Existing Wallet",
    content: [
      [
        "Use the ",
        <span className={styles.highlighted}>Import from seed phrase</span>,
        " flow in the Station extension. Or use the ",
        <span className={styles.highlighted}>Import from private key</span>,
        " flow if you have a private key from a previous Station wallet.",
      ],
      [
        "You can find a guide ",
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
    title: "New Wallet",
    content: [
      [
        "Use the ",
        <span className={styles.highlighted}>New wallet</span>,
        " flow in the Station extension or desktop application. You can find a guide ",
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
  const [openWhy, setOpenWhy] = useState(true)
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
      <h1 className={styles.title}>{t("Get Started with Station")}</h1>
      <h3 className={styles.subtitle}>
        Crypto wallet for the interchain and beyond
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

        <section
          className={cx(styles.lessImportantAccordion, openWhy && "opened")}
          onClick={() => setOpenWhy(!openWhy)}
        >
          <div className={styles.top}>
            <h5 className={styles.title}>Why do I need to do this?</h5>
            <KeyboardArrowDownIcon className={styles.icon} />
          </div>
          <div className={styles.content}>
            <p>
              Station needs to derive your wallet address for each chain from
              the same seed phrase. Other wallet providers may generate this
              address using a different derivation path. Station can detect 330,
              and 118 derivation paths, but must re-load the seed phrase in
              order to detect tokens held in wallets that were created via the
              118 path.
            </p>
          </div>
        </section>
      </div>
      <button className={styles.confirm} onClick={submitButton}>
        Confirm
      </button>
    </ReactModal>
  )
}

export default WelcomeModal
