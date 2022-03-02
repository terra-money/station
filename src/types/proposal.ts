import { Vote } from "@terra-money/terra.js"

export interface TerraProposalItem {
  voter: string
  options: { option: Vote.Option; weight: string }[]
}
