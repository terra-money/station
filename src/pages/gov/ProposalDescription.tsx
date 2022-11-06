import { Proposal } from "@terra-money/terra.js"
import { TooltipIcon } from "components/display"
import { Checkbox, FormHelp, FormWarning } from "components/form"
import { ExternalLink } from "components/general"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import styles from "./ProposalDescription.module.scss"
import xss from "xss"

const ProposalDescription = ({ proposal }: { proposal: Proposal }) => {
  const { description } = proposal.content
  const { t } = useTranslation()
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = description.split(urlRegex)
  const [isPropRedacted, setIsPropRedacted] = useState(false)

  const render = () => {
    let externalLinkCount = 0

    return (
      <section>
        <p>
          {parts.map((part, index) => {
            const url = xss((part.match(urlRegex) || [""])[0])
            const isWhitelistedUrl = isWhitelisted(url)
            externalLinkCount += url && !isWhitelistedUrl ? 1 : 0

            return url ? (
              isWhitelistedUrl ? (
                <ExternalLink key={index} href={part} icon={true}>
                  {part}
                </ExternalLink>
              ) : (
                <span key={index}>
                  {isPropRedacted ? (
                    part
                  ) : (
                    <span>
                      [
                      <TooltipIcon
                        content={t(
                          "References to websites outside the Terra ecosystem are not displayed in the proposal description"
                        )}
                      >
                        <em>{t("external link")}</em>
                      </TooltipIcon>
                      ]
                    </span>
                  )}
                </span>
              )
            ) : (
              <span key={index}>{part}</span>
            )
          })}
        </p>

        {externalLinkCount > 0 && (
          <div className={styles.mt30}>
            <FormHelp>
              {t(
                "References to websites outside the Terra ecosystem are not displayed in the proposal description"
              )}
            </FormHelp>
            <FormWarning>
              {t(
                "Never supply your seed phrase, password, or private key to an external website unless you are absolutely certain you are interacting with a trusted service"
              )}
            </FormWarning>
            <div>
              <Checkbox
                className={styles.mt10}
                checked={isPropRedacted}
                onChange={() => setIsPropRedacted(!isPropRedacted)}
              >
                {t("Display original proposal description")}
              </Checkbox>
            </div>
          </div>
        )}
      </section>
    )
  }

  return <p>{render()}</p>
}

export default ProposalDescription

/* helpers */
const whitelist = [/https?:\/\/[^.]+\.terra\.money\/[^\s]+/g]

const isWhitelisted = (url: string) => {
  for (let j = 0; j < whitelist.length; j++) {
    if (url?.match(whitelist[j])?.length) {
      return true
    }
  }
  return false
}
