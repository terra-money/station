import { useState } from "react"
import { useTranslation } from "react-i18next"
import ReactModal from "react-modal"
import classNames from "classnames/bind"
import styles from "./WelcomeModal.module.scss"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"

const cx = classNames.bind(styles)

const accordions = [
  {
    title: "From an Existing Station Wallet",
    content: [
      'Open the extension and enter your seed phrase through the recovery process. You can find a guide <a href="https://61c51cef.docs-terra.pages.dev/learn/terra-station/migration" target="_blank" rel="noopener noreferrer">here</a>.',
      "If you choose not to re-add your wallet you will not be able to access non-Terra chains. However, you will still have access to the private key and funds associated with that wallet.",
    ],
  },
  {
    title: "From a Non-Station Wallet",
    content: [
      `Use the  <span class=${styles.highlighted}>Recover Wallet</span>  flow in the extension to import your wallet. You can find a guide <a href="https://61c51cef.docs-terra.pages.dev/learn/terra-station/migration" target="_blank" rel="noopener noreferrer">here</a>.`,
    ],
  },
  {
    title: "From a Ledger",
    content: [
      `Click  <span class=${styles.highlighted}>connect</span>  on the home page and select <span class=${styles.highlighted}>access with ledger</span>.`,
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
    console.log("confirmed")
    localStorage.setItem("welcomeModal", "true")
    setForceClose(true)
  }

  return (
    <ReactModal
      isOpen={!forceClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <h1 className={styles.title}>{t("Welcome to the Station WebApp")}</h1>
      <h3 className={styles.subtitle}>
        To enable interchain features complete the following.
      </h3>

      <div className={styles.accordions}>
        {accordions.map((acc, i) => (
          <section
            className={cx(styles.accordion, openAcc === i + 1 ? "opened" : "")}
            key={`accordion-${i + 1}`}
            onClick={() => handleClick(i + 1)}
          >
            <div className={styles.top}>
              <h5 className={styles.title}>{acc.title}</h5>
              <KeyboardArrowDownIcon className={styles.icon} />
            </div>
            <div className={styles.content}>
              <ul>
                {acc.content.map((c, i) => (
                  <li dangerouslySetInnerHTML={{ __html: c }} />
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
