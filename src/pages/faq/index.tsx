/*
 * @Author: lmk
 * @Date: 2022-06-07 15:57:28
 * @LastEditTime: 2022-06-07 17:30:29
 * @LastEditors: lmk
 * @Description:
 */
/**
 * @file  index
 * @date 2022-06-07
 */

import { Box, Typography } from "@mui/material"
import React from "react"

const FAQ = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h4"
        sx={{
          color: "#16161D",
          fontSize: 27,
        }}
      >
        MIS Staking FAQ
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontSize: 12,
          color: "#999",
          pt: 1.5,
        }}
      >
        updated at 2022-06-07
      </Typography>
      <Typography
        variant="h5"
        sx={{
          py: 3,
          color: "#16161D",
          fontSize: 17,
        }}
      >
        1.What is a Delegator?
      </Typography>
      <p style={{ fontSize: "15px", color: "#363636" }}>
        As an MIS delegator, you can stake your tokens with one or more
        Validators. In exchange for delegating you will earn a percentage of
        network transaction fees and also receive additional MIS from continuous
        inflation called block provision.
      </p>
      <Typography
        variant="h5"
        sx={{
          py: 3,
          color: "#16161D",
          fontSize: 17,
        }}
      >
        2.What is a Validator?
      </Typography>
      <p style={{ fontSize: "15px", color: "#363636" }}>
        Validators participate in consensus by broadcasting cryptographic
        signatures, or votes, to commit blocks. Tendermint requires a fixed
        known set of validators, where each validator is identified by their
        public key. Validators attempt to come to consensus one block at a time,
        where a block is a list of transactions.
      </p>
      <Typography
        variant="h5"
        sx={{
          py: 3,
          color: "#16161D",
          fontSize: 17,
        }}
      >
        3.Why should I delegate my MIS?
      </Typography>
      <p style={{ fontSize: "15px", color: "#363636" }}>
        If an MIS token holder chooses not to delegate to a Validator, they will
        neither receive a percentage of network transaction fees nor block
        provisions, and their percentage to the total amount of MIS will
        decrease over time from inflation.
      </p>
      <Typography
        variant="h5"
        sx={{
          py: 3,
          color: "#16161D",
          fontSize: 17,
        }}
      >
        4.What are the rewards for delegating MIS?
      </Typography>
      <p style={{ fontSize: "15px", color: "#363636" }}>
        Block rewards: about 7%~20% annual yield of the total MIS supply
      </p>
      <Typography
        variant="h5"
        sx={{
          py: 3,
          color: "#16161D",
          fontSize: 17,
        }}
      >
        5.When is the delegation taking effect? And how long does it take to
        start earning rewards after delegating?
      </Typography>
      <p style={{ fontSize: "15px", color: "#363636" }}>
        Delegating and rewards are effective immediately.
      </p>
      <Typography
        variant="h5"
        sx={{
          py: 3,
          color: "#16161D",
          fontSize: 17,
        }}
      >
        6.How do I check my rewards? And can rewards be unbound any time?
      </Typography>
      <p style={{ fontSize: "15px", color: "#363636" }}>
        You can check your real-time rewards on the home page of the Staking.
        Delegation can be unbound at any time.
      </p>
      <Typography
        variant="h5"
        sx={{
          py: 3,
          color: "#16161D",
          fontSize: 17,
        }}
      >
        7.How to get details about Validators?
      </Typography>
      <p style={{ fontSize: "15px", color: "#363636" }}>
        Go to Staking page, select the validator on the top, then choose one
        validator to view additional information.
      </p>
      <Typography
        variant="h5"
        sx={{
          py: 3,
          color: "#16161D",
          fontSize: 17,
        }}
      >
        8.Can I change a Validator at any time?
      </Typography>
      <p style={{ fontSize: "15px", color: "#363636" }}>
        Of course. You can change a validator any time after you staked. And it
        will take immediate effect.
      </p>
      <Typography
        variant="h5"
        sx={{
          py: 3,
          color: "#16161D",
          fontSize: 17,
        }}
      >
        9.Can I unbound my MIS after having delegated? And how long does it take
        to receive my MIS?
      </Typography>
      <p style={{ fontSize: "15px", color: "#363636" }}>
        Of course you can. And you will get your MIS back after 21 days.
      </p>
      <Typography
        variant="h5"
        sx={{
          py: 3,
          color: "#16161D",
          fontSize: 17,
        }}
      >
        10.Will the Validator charge a commission?
      </Typography>
      <p style={{ fontSize: "15px", color: "#363636" }}>
        The rewards of the validator is distributed between the validator and
        delegator. Validators may take some of the rewards as a commission
        before distributing the rewards to the delegator.
      </p>
      <Typography
        variant="h5"
        sx={{
          py: 3,
          color: "#16161D",
          fontSize: 17,
        }}
      >
        11. What risks do I take for delegating my MIS to validators？
      </Typography>
      <ol>
        <li>
          When evaluating Validators to stake with, you can think about three
          distinct buckets of questions: missed earnings, slashings, and
          commission rate.
        </li>
        <li>
          With missed earnings, you don’t lose any money but you don’t make as
          much as you could.
        </li>
        <li>With slashings, you lose money.</li>
        <li>
          With a higher commission rate, you receive less from the Validator.
        </li>
      </ol>
    </Box>
  )
}

export default FAQ
