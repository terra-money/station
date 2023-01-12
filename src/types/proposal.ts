import { Vote } from "@terra-money/feather.js"

export interface TerraProposalItem {
  voter: string
  options: { option: Vote.Option; weight: string }[]
}
