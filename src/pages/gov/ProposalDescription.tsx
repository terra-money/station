import { ProposalResult } from "data/queries/gov"
import React from "react"

const ProposalDescription = ({ proposal }: { proposal: ProposalResult }) => {
  if (!proposal.content) return null
  const { description } = proposal.content

  return <article>{parseText(description)}</article>
}

export default ProposalDescription

const parseText = (text: string) => {
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
    } else if (line.startsWith("- ")) {
      result.push(<li key={i}>{line.replace("- ", "")}</li>)
    } else {
      const lineResult: (React.ReactNode | string)[] = []
      const pattern =
        /\*\*(.*?)\*\*|`(.*?)`|(https?:\/\/[^\s]+)|\[(.*?)\]\((https?:\/\/[^\s]+)\)/g
      let match = pattern.exec(line)
      let lastIndex = 0

      while (match) {
        lineResult.push(line.slice(lastIndex, match.index))
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
            <a
              key={`${i}-${lineResult.length}`}
              href={match[3]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {match[3]}
            </a>
          )
        } else if (match[4] && match[5]) {
          result.push(
            <a
              key={`${i}-${lineResult.length}`}
              href={match[5]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {match[4]}
            </a>
          )
        }
        lastIndex = pattern.lastIndex
        match = pattern.exec(line)
      }
      lineResult.push(line.slice(lastIndex))

      result.push(<p key={i}>{lineResult}</p>)
      result.push(<br key={`${i}-br`} />)
    }
  })

  return result
}
