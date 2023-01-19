import { Proposal } from "@terra-money/feather.js"
import xss from "xss"

const ProposalDescription = ({ proposal }: { proposal: Proposal }) => {
  if (!proposal.content) return null
  const { description } = proposal.content
  return <p dangerouslySetInnerHTML={{ __html: linkify(description) }} />
}

export default ProposalDescription

/* helpers */
const linkify = (text: string) => {
  return xss(
    text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    )
  )
}
