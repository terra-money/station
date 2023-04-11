import { useCallback, useMemo } from "react"
import { CreateTxOptions } from "@terra-money/feather.js"
import { MsgInstantiateContract } from "@terra-money/feather.js"
import { useForm } from "react-hook-form"

import { Card } from "components/layout"
import { Form } from "components/form"
import Tx from "txs/Tx"

const MAIN_DEV_WALLET = "terra15dvxqcmaz3guls0rfznrfskkapu8xqxl4tzwx3"
const EXTRA_WALLET = "terra13x9lks9yu7vh6zds3jlfmn8a6yjlzzpuwspa8t"

const INSTANTIATE_TEST = {
  sender: "terra15dvxqcmaz3guls0rfznrfskkapu8xqxl4tzwx3", // sender of message. get from wallet
  admin: "", // constant, not set in this case
  code_id: 9, // contract id, store in constants
  init_msg: {
    // contract init message. payload informed by msg type. store in constants / generate from type
    voters: [
      ...[MAIN_DEV_WALLET, EXTRA_WALLET].map((addr) => ({ addr, weight: 1 })), // receive from form inputs or derive from function
    ],
    threshold: {
      absolute_count: {
        weight: 1,
      },
    },
    max_voting_period: { time: 7 * 86400 },
  },
  label: "test instantiate",
}

function CreateCW3Form() {
  const token = "uluna" // denom of fee to be sent with tx
  const amount = "0" // amount of token to be sent with tx
  const balance = "1000000" // balance of [token]
  const chain = "phoenix-1" // chain id - informs denoms/etc

  const form = useForm({
    mode: "onChange",
  })

  const { handleSubmit } = form

  const createTx = useCallback(
    ({ createTxArgument0 }: { createTxArgument0: string }) => {
      console.log({ createTxArgument0 })
      const txOptions: CreateTxOptions = {
        chainID: "phoenix-1",
        msgs: [
          new MsgInstantiateContract(
            INSTANTIATE_TEST.sender,
            INSTANTIATE_TEST.admin,
            INSTANTIATE_TEST.code_id,
            INSTANTIATE_TEST.init_msg,
            {},
            INSTANTIATE_TEST.label
          ),
        ],
      }
      return txOptions
    },
    []
  )

  const handleTransactionSuccess = () => {
    // Implement the logic to handle transaction success
    // often times, clear a form
    console.log("tx successful")
  }

  const estimationTxValues = useMemo(
    () => ({ createTxArgument0: "argument send to createTx" }),
    []
  )

  // conventionally, define tx props before return / render
  const tx = {
    token,
    amount,
    balance,
    createTx,
    chain,
    onSuccess: handleTransactionSuccess,
    estimationTxValues,
  }

  return (
    <Tx {...tx}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <Card>Max Amount: {max.amount}</Card>

          <Card>
            Max Render:
            {max.render((max) => console.log("max clicked:", max))}
          </Card>
          <Card>
            <div>Fee: Render{fee.render()}</div>
          </Card>

          <Card>
            <div>submit button: {submit.button}</div>
          </Card>
          <Card>
            <a
              href="#asdf"
              onClick={() => {
                submit.fn({
                  createTxArgument0: "argument send to createTx",
                })
              }}
            >
              Click me to submit
            </a>
          </Card>
        </Form>
      )}
    </Tx>
  )
}

export default CreateCW3Form
