import { Dec, Numeric, Denom } from "@terra-money/terra.js"
import { LCDClient } from "@terra-money/terra.js"

export type APIParams = Record<string, string | number | null | undefined>

export interface MintingParams {
  mint_denom: Denom
  inflation_rate_change: Dec
  inflation_max: Dec
  inflation_min: Dec
  goal_bonded: Dec
  blocks_per_year: number
}

export namespace MintingParams {
  export interface Data {
    mint_denom: string
    inflation_rate_change: string
    inflation_max: string
    inflation_min: string
    goal_bonded: string
    blocks_per_year: string
  }
}
export const useMintingApi = (lcd: LCDClient) => {
  return new MintingAPI(lcd)
}
export class MintingAPI {
  public constructor(public lcd: LCDClient) {}

  /**
   * Gets the current minting inflation value
   */
  public async inflation(params: APIParams = {}): Promise<Dec> {
    return this.lcd.apiRequester
      .get<{ inflation: Numeric.Input }>(`/minting/inflation`, params)
      .then((d) => new Dec(d.inflation))
  }

  /**
   * Gets the current minting annual provisions value
   */
  public async annualProvisions(params: APIParams = {}): Promise<Dec> {
    return this.lcd.apiRequester
      .getRaw<{ result: string }>(`/minting/annual-provisions`, params)
      .then((d) => {
        return new Dec(d.result)
      })
  }

  /**
   * Gets the current minting module's parameters.
   */
  public async parameters(params: APIParams = {}): Promise<MintingParams> {
    return this.lcd.apiRequester
      .get<{ params: MintingParams.Data }>(`/minting/params`, params)
      .then(({ params: d }) => ({
        mint_denom: d.mint_denom,
        inflation_rate_change: new Dec(d.inflation_rate_change),
        inflation_max: new Dec(d.inflation_max),
        inflation_min: new Dec(d.inflation_min),
        goal_bonded: new Dec(d.goal_bonded),
        blocks_per_year: Number.parseInt(d.blocks_per_year),
      }))
  }
}
