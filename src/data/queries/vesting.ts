import { useQuery } from "react-query"
import axios from "axios"
import BigNumber from "bignumber.js"
import { isFuture, isPast } from "date-fns"
import { last } from "ramda"
import { useAddress, useChainID } from "../wallet"
import { useInterchainLCDClient } from "./lcdClient"

/* types */
interface Coin {
  denom: string
  amount: string
}

interface BaseResponse {
  base_vesting_account: {
    original_vesting: Coin[]
    delegated_free: Coin[]
    delegated_vesting: Coin[]
    end_time: string
  }
}

export enum VestingAccountTypes {
  Continuous = "/cosmos.vesting.v1beta1.ContinuousVestingAccount",
  Delayed = "/cosmos.vesting.v1beta1.DelayedVestingAccount",
  Periodic = "/cosmos.vesting.v1beta1.PeriodicVestingAccount",
}

interface ContinuousResponse extends BaseResponse {
  "@type": VestingAccountTypes.Continuous
  start_time: string
}

interface DelayedResponse extends BaseResponse {
  "@type": VestingAccountTypes.Delayed
}

interface PeriodicResponse extends BaseResponse {
  "@type": VestingAccountTypes.Periodic
  start_time: string
  vesting_periods: { length: string; amount: Coin[] }[]
}

export type Account = ContinuousResponse | DelayedResponse | PeriodicResponse

export interface ParsedVestingSchedule {
  type: "Continuous" | "Delayed" | "Periodic"
  schedule: VestingScheduleItem[]
  amount: { total: string; vested: string }
}

interface VestingScheduleItem {
  start?: Date
  end: Date
  toNow: "past" | "now" | "future"
  amount: string
  ratio?: number
}

/* helpers */
const getLunaAmount = (coins: Coin[]) =>
  coins.find(({ denom }) => denom === "uluna")?.amount ?? "0"

const getCurrentAmount = ({ start, end, amount }: VestingScheduleItem) => {
  if (!start) throw new Error("Start date is not defined")
  const total = end.getTime() - start.getTime()
  const current = Date.now() - start.getTime()
  const ratio = new BigNumber(current).div(total)
  return new BigNumber(amount).times(ratio).toString()
}

const getVested = (schedule: VestingScheduleItem[]) =>
  schedule.reduce((acc, cur) => {
    const { toNow, amount } = cur

    if (toNow === "past") return new BigNumber(acc).plus(amount).toString()
    if (toNow === "now")
      return new BigNumber(acc).plus(getCurrentAmount(cur)).toString()

    return acc
  }, "0")

/* parse */
export const parseVestingSchedule = (
  response: Account
): ParsedVestingSchedule => {
  if (response["@type"] === VestingAccountTypes.Continuous) {
    const { base_vesting_account, start_time } = response
    const { original_vesting, end_time } = base_vesting_account

    const start = new Date(Number(start_time) * 1000)
    const end = new Date(Number(end_time) * 1000)
    const toNow = isFuture(start) ? "future" : isPast(end) ? "past" : "now"
    const amount = getLunaAmount(original_vesting)
    const total = getLunaAmount(original_vesting)
    const schedule = [{ start, end, toNow, amount } as const]

    return {
      type: "Continuous",
      schedule,
      amount: { total, vested: getVested(schedule) },
    }
  } else if (response["@type"] === VestingAccountTypes.Delayed) {
    const { base_vesting_account } = response
    const { original_vesting, end_time } = base_vesting_account

    const end = new Date(Number(end_time) * 1000)
    const toNow = isPast(end) ? "past" : "future"
    const amount = getLunaAmount(original_vesting)
    const total = getLunaAmount(original_vesting)
    const schedule = [{ end, toNow, amount } as const]

    return {
      type: "Delayed",
      schedule,
      amount: { total, vested: getVested(schedule) },
    }
  }

  const { base_vesting_account, vesting_periods, start_time } = response
  const { original_vesting } = base_vesting_account

  const total = getLunaAmount(original_vesting)

  const schedule = vesting_periods.reduce<VestingScheduleItem[]>(
    (acc, { length, amount: coins }) => {
      const start = last(acc)?.end ?? new Date(Number(start_time) * 1000)
      const end = new Date(start.getTime() + Number(length) * 1000)
      const toNow = isFuture(start) ? "future" : isPast(end) ? "past" : "now"
      const amount = getLunaAmount(coins)
      const ratio = Number(amount) / Number(total)
      return [...acc, { start, end, toNow, amount, ratio }]
    },
    []
  )

  return {
    type: "Periodic",
    schedule,
    amount: { total, vested: getVested(schedule) },
  }
}

/* query */
export const queryAccounts = async (address: string, lcd: string) => {
  const path = "cosmos/auth/v1beta1/accounts"
  const { data } = await axios.get<{ account: Account }>(
    [path, address].join("/"),
    { baseURL: lcd }
  )

  return data.account
}

// TODO: make interchain
export const useAccount = () => {
  const address = useAddress()
  const chainID = useChainID()
  const lcd = useInterchainLCDClient()

  return useQuery(["accounts", address], async () => {
    if (!address) return null
    return await queryAccounts(address, lcd.config[chainID].lcd)
  })
}

export const isVestingAccount = (data: any) => {
  return Object.values(VestingAccountTypes ?? {}).includes(data["@type"])
}
