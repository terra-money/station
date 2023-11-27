import { useState } from "react"
import { Modal } from "components/feedback"
import { Button } from "components/general"
import { Checkbox } from "components/form"
import { FlexColumn } from "components/layout"
import styles from "./TermsOfUseModal.module.scss"

const TermsOfUseModal = () => {
  const [open, setOpen] = useState(true)
  const [checked, setChecked] = useState(false)

  const hasAcceptedCurrent = localStorage.getItem(
    "TermsOfUseAccepted_Oct-3-2023"
  )

  const handleAccept = () => {
    localStorage.setItem("TermsOfUseAccepted_Oct-3-2023", "true")
    setOpen(false)
  }

  if (hasAcceptedCurrent === "true") return null

  return (
    <Modal isOpen={open} title="Terms of Use">
      <FlexColumn gap={28} className={styles.content__container}>
        <p>
          Please check the box below to confirm your agreement to the{" "}
          <a
            href="https://drive.google.com/file/d/1A4B41Cy2lR0nQnlAVLGgjNcFParcbnA_/view?usp=drive_link"
            target="_blank"
            rel="noreferrer"
          >
            Terms of Use
          </a>{" "}
          and{" "}
          <a
            href="https://assets.website-files.com/611153e7af981472d8da199c/631ac874c79cf645a2f9b5ee_PrivacyPolicy.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>
          .
        </p>

        <div className={styles.confirmation__wrapper}>
          <Checkbox checked={checked} onClick={() => setChecked(!checked)} />
          <p className={styles.checkbox__text}>
            I have read and understand, and do hereby agree to be bound by the
            Terms of Use and Privacy Policy , including all future amendments
            thereto.
          </p>
        </div>

        <div className={styles.bottom__wrapper}>
          <div className={styles.button__wrapper}>
            <Button color="primary" disabled={!checked} onClick={handleAccept}>
              Accept & Continue
            </Button>
            <Button
              color="default"
              onClick={() => (window.location.href = "https://terra.money")}
            >
              Reject & Exit
            </Button>
          </div>
          <p className={styles.routing__warning}>
            Clicking <strong>"Reject & Exit"</strong> will route you to
            <a href="https://terra.money">
              {" "}
              <strong>terra.money</strong>
            </a>
          </p>
        </div>
      </FlexColumn>
    </Modal>
  )
}

export default TermsOfUseModal
