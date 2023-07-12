import { TooltipIcon } from "components/display"
import { Toggle } from "components/form"
import { ExternalLink } from "components/general"
import { ProposalResult } from "data/queries/gov"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

const ProposalDescription = ({ proposal }: { proposal: ProposalResult }) => {
  const [showLinks, setShowLinks] = useState(false)
  const { t } = useTranslation()
  if (!proposal.content) return null
  const { description } = proposal.content

  const parseText = (text: string) => {
    if (!text) return null
    const result: (React.ReactNode | string)[] = []
    const lines = text.split(/\\n|\n/)

    lines.forEach((line, i) => {
      // empty lines
      //if (!line) return

      if (line.startsWith("# ")) {
        result.push(<h1 key={i}>{line.replace("# ", "")}</h1>)
      } else if (line.startsWith("## ")) {
        result.push(<h2 key={i}>{line.replace("## ", "")}</h2>)
      } else if (line.startsWith("### ")) {
        result.push(<h3 key={i}>{line.replace("### ", "")}</h3>)
      } else {
        const lineResult: (React.ReactNode | string)[] = []
        const pattern =
          /\*\*(.*?)\*\*|`(.*?)`|(https?:\/\/[^\s]+)|\[(.*?)\]\((https?:\/\/[^\s]+)\)/g
        const fixedLine = line.startsWith("- ") ? line.replace("- ", "") : line
        let match = pattern.exec(fixedLine)
        let lastIndex = 0

        while (match) {
          lineResult.push(fixedLine.slice(lastIndex, match.index))
          if (match[1]) {
            // bold text
            lineResult.push(<b key={`${i}-${lineResult.length}`}>{match[1]}</b>)
          } else if (match[2]) {
            // code
            lineResult.push(
              <code key={`${i}-${lineResult.length}`}>{match[2]}</code>
            )
          } else if (match[3]) {
            // plain URL
            lineResult.push(
              showLinks || isLinkSafe(match[3]) ? (
                <ExternalLink
                  href={match[3]}
                  icon
                  key={`${i}-${lineResult.length}`}
                  style={{
                    color: isLinkSafe(match[3]) ? undefined : "var(--danger)",
                  }}
                >
                  {match[3]}
                </ExternalLink>
              ) : (
                <TooltipIcon
                  content={t(`This link has been hidden for security reasons.`)}
                >
                  <i>{t("Hidden link")}</i>
                </TooltipIcon>
              )
            )
          } else if (match[4] && match[5]) {
            result.push(
              showLinks || isLinkSafe(match[3]) ? (
                <ExternalLink
                  href={match[5]}
                  icon
                  key={`${i}-${lineResult.length}`}
                  style={{
                    color: isLinkSafe(match[5]) ? undefined : "var(--danger)",
                  }}
                >
                  {match[4]}
                </ExternalLink>
              ) : (
                <TooltipIcon
                  content={t(`This link has been hidden for security reasons.`)}
                >
                  <i>{t("hidden link")}</i>
                </TooltipIcon>
              )
            )
          }
          lastIndex = pattern.lastIndex
          match = pattern.exec(fixedLine)
        }
        lineResult.push(fixedLine.slice(lastIndex))

        if (line.startsWith("- ")) {
          result.push(<li key={i}>{lineResult}</li>)
        } else {
          result.push(<p key={i}>{lineResult}</p>)
        }
      }
    })

    return result
  }

  return (
    <>
      <section>
        <Toggle checked={showLinks} onChange={() => setShowLinks((l) => !l)}>
          {t("Show hidden links")}
        </Toggle>
      </section>
      <article>{parseText(description)}</article>
    </>
  )
}

export default ProposalDescription

function isLinkSafe(url: string) {
  try {
    const { protocol, hostname } = new URL(url)
    return (
      protocol === "https:" &&
      (hostname === "terra.money" || hostname.endsWith(".terra.money"))
    )
  } catch (e) {
    return false
  }
}
