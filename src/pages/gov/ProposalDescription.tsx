import { Proposal } from "@terra-money/terra.js"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import { ExternalLink, ExternalModalLink } from "components/general"
import xss from "xss"
import { useTranslation } from "react-i18next"

const ProposalDescription = ({ proposal }: { proposal: Proposal }) => {
  const { description } = proposal.content
  const { t } = useTranslation()
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = description.split(urlRegex)

  const render = () => {
    return parts.map((part, index) => {
      const url = xss((part.match(urlRegex) || [""])[0])
      const isWhitelistedUrl = isWhitelisted(url)

      return url ? (
        isWhitelistedUrl ? (
          <ExternalLink key={index} href={part}>
            {part}
          </ExternalLink>
        ) : (
          <ExternalModalLink
            key={index}
            href={part}
            modalTitle={t("External Link")}
            modalBody={
              <>
                <p>
                  The link <strong>{part}</strong> is provided by the proposal
                  author and references a website outside the Terra ecosystem.
                </p>
                <br />
                <p>
                  NEVER supply your seed phrase, password, or private key unless
                  you are absolutely certain you are interacting with a trusted
                  service. Releasing your seed phrase, password, or private key
                  to a malicious actor may result in the complete loss of your
                  wallet.
                </p>
              </>
            }
            modalButtonTitle={t("I understand, continue")}
            modalIcon={
              <WarningAmberIcon fontSize="inherit" className="danger" />
            }
          >
            {part}
          </ExternalModalLink>
        )
      ) : (
        <span key={index}>{part}</span>
      )
    })
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
