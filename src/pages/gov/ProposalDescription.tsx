import { Fragment, useState } from "react"
import { useTranslation } from "react-i18next"
import xss from "xss"
import { Proposal } from "@terra-money/terra.js"
import { ExternalLink } from "components/general"
import { Grid } from "components/layout"
import { TooltipIcon } from "components/display"
import { Checkbox, FormHelp, FormWarning } from "components/form"
import { isExempted, isWhitelisted, URL_REGEX } from "utils/gov"

const ProposalDescription = ({ proposal }: { proposal: Proposal }) => {
  const { description } = proposal.content

  const { t } = useTranslation()
  const [showOriginal, setShowOriginal] = useState(false)

  const parts = description.split(URL_REGEX)

  const showCheckbox = !!parts.filter(
    (part) => part.match(URL_REGEX) && !isWhitelisted(part) && !isExempted(part)
  ).length

  const renderPart = (part: string) => {
    const url = xss(part.match(URL_REGEX)?.[0] ?? "")

    if (!url) return part
    if (isExempted(url)) return part

    if (isWhitelisted(url))
      return (
        <ExternalLink href={part} icon={true}>
          {part}
        </ExternalLink>
      )

    if (showOriginal) return part

    const tooltip = (
      <TooltipIcon
        content={t(
          `A potential reference to a website outside the Terra ecosystem (${part}) was not displayed in the proposal description. See guidance below if you intend to visit this website.`
        )}
      >
        <i>{t("external link")}</i>
      </TooltipIcon>
    )

    return <>[{tooltip}]</>
  }

  return (
    <Grid gap={20}>
      <p>
        {parts.map((part, index) => (
          <Fragment key={index}>{renderPart(part)}</Fragment>
        ))}
      </p>

      {showCheckbox && (
        <Grid gap={4}>
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
          <Checkbox
            checked={showOriginal}
            onChange={() => setShowOriginal(!showOriginal)}
          >
            {t("Display original proposal description")}
          </Checkbox>
        </Grid>
      )}
    </Grid>
  )
}

export default ProposalDescription
