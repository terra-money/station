const today = new Date()
const mockProposalDatetime1 = new Date(new Date().setDate(today.getDate() - 7))
const mockProposalDatetime2 = new Date(
  new Date().setDate(today.getDate() - 180)
)
const mockProposalDatetime3 = new Date(
  new Date().setDate(today.getDate() - 365)
)

const mockProposals = [
  {
    prop: {
      proposal_id: "1",
      content: {
        "@type": "/alliance.alliance.MsgCreateAllianceProposal",
        title: "New alliance created with sCorinno (3% Rewards)",
        description: "",
        denom:
          "ibc/D7AA592A1C1C00FE7C9E15F4BB7ADB4B779627DD3FBB3C877CD4DB27F56E35B4",
        reward_weight: "0.030000000000000000",
        take_rate: "0.000050000000000000",
        reward_change_rate: "1.000000000000000000",
        reward_change_interval: "0s",
        reward_weight_range: {
          min: "0",
          max: "0",
        },
      },
      status: "PROPOSAL_STATUS_PASSED",
      final_tally_result: {
        yes: "428570571427968",
        abstain: "0",
        no: "0",
        no_with_veto: "0",
      },
      submit_time: mockProposalDatetime1,
      deposit_end_time: mockProposalDatetime1,
      total_deposit: [
        {
          denom: "uatr",
          amount: "10000000",
        },
      ],
      voting_start_time: mockProposalDatetime1,
      voting_end_time: mockProposalDatetime1,
    },
    chain: "atreides-1",
  },
  {
    prop: {
      id: "1",
      messages: [
        {
          "@type": "/cosmos.gov.v1.MsgExecLegacyContent",
          content: {
            "@type": "/cosmos.params.v1beta1.ParameterChangeProposal",
            title: "Enable IBC transfer",
            description: "This proposal is to enable IBC transfers",
            changes: [
              {
                subspace: "transfer",
                key: "SendEnabled",
                value: "true",
              },
              {
                subspace: "transfer",
                key: "ReceiveEnabled",
                value: "true",
              },
            ],
          },
          authority: "mars10d07y265gmmuvt4z0w9aw880jnsr700j8l2urg",
        },
      ],
      status: "PROPOSAL_STATUS_PASSED",
      final_tally_result: {
        yes: "60000002000000",
        abstain: "0",
        no: "0",
        no_with_veto: "0",
      },
      submit_time: mockProposalDatetime2,
      deposit_end_time: mockProposalDatetime2,
      total_deposit: [
        {
          denom: "umars",
          amount: "10000000",
        },
      ],
      voting_start_time: mockProposalDatetime2,
      voting_end_time: mockProposalDatetime2,
      metadata:
        '{"title":"Enable IBC transfer","summary":"This proposal is to enable IBC transfers"}',
      proposal_id: "1",
      content: {
        "@type": "/cosmos.params.v1beta1.ParameterChangeProposal",
        title: "Enable IBC transfer",
        description: "This proposal is to enable IBC transfers",
        changes: [
          {
            subspace: "transfer",
            key: "SendEnabled",
            value: "true",
          },
          {
            subspace: "transfer",
            key: "ReceiveEnabled",
            value: "true",
          },
        ],
      },
    },
    chain: "harkonnen-1",
  },
  {
    prop: {
      proposal_id: "129",
      content: {
        "@type": "/cosmwasm.wasm.v1.StoreCodeProposal",
        title: "Astroport Factory",
        description: "Astroport Factory contract",
        run_as: "sei1yfnt79y82p5k5ue3u5q9p5w2sqy2zt6g8yy48h",
        wasm_byte_code: "H4sIAAAAAAAA/+y9C5Qd",
        instantiate_permission: {
          permission: "Everybody",
          address: "",
        },
      },
      status: "PROPOSAL_STATUS_PASSED",
      final_tally_result: {
        yes: "2428640657758",
        abstain: "0",
        no: "0",
        no_with_veto: "0",
      },
      submit_time: mockProposalDatetime3,
      deposit_end_time: mockProposalDatetime3,
      total_deposit: [
        {
          denom: "usei",
          amount: "10000000",
        },
      ],
      voting_start_time: mockProposalDatetime3,
      voting_end_time: mockProposalDatetime3,
    },
    chain: "ordos-1",
  },
]

const mockNetworks = {
  "atreides-1": {
    baseAsset: "uatr",
    chainID: "atreides-1",
    coinType: "118",
    gasAdjustment: 2.5,
    gasPrices: {
      uatr: 0,
    },
    ibc: {
      fromTerra: "channel-226",
      ics: {
        contract:
          "atreides1yyca08xqdgvjz0psg56z67ejh9xms6l436u8y58m82npdqqhmmtqmxgcku",
        fromTerra: "channel-230",
        toTerra: "channel-1",
      },
      icsFromTerra: {
        contract:
          "terra12havy0g3svy6jlnc0je3z4f0lujhkp8h79ux5myhy4ujufeczpzsr5w7lz",
        fromTerra: "channel-233",
        toTerra: "channel-2",
      },
      toTerra: "channel-0",
    },
    icon: "https://station-assets.terra.money/img/chains/Atreides.png",
    lcd: "https://atreides.terra.dev:1317",
    name: "Atreides",
    prefix: "atreides",
  },
  "corrino-1": {
    baseAsset: "ucor",
    chainID: "corrino-1",
    coinType: "118",
    gasAdjustment: 2.5,
    gasPrices: {
      ucor: 0,
    },
    ibc: {
      fromTerra: "channel-225",
      ics: {
        contract:
          "corrino1yyca08xqdgvjz0psg56z67ejh9xms6l436u8y58m82npdqqhmmtqmxgcku",
        fromTerra: "channel-231",
        toTerra: "channel-1",
      },
      icsFromTerra: {
        contract:
          "terra12havy0g3svy6jlnc0je3z4f0lujhkp8h79ux5myhy4ujufeczpzsr5w7lz",
        fromTerra: "channel-235",
        toTerra: "channel-2",
      },
      toTerra: "channel-0",
    },
    icon: "https://station-assets.terra.money/img/chains/Corrino.png",
    lcd: "https://corrino.terra.dev:1317",
    name: "Corrino",
    prefix: "corrino",
  },
  "harkonnen-1": {
    baseAsset: "uhar",
    chainID: "harkonnen-1",
    coinType: "118",
    gasAdjustment: 2.5,
    gasPrices: {
      uhar: 0,
    },
    ibc: {
      fromTerra: "channel-228",
      ics: {
        contract:
          "harkonnen1yyca08xqdgvjz0psg56z67ejh9xms6l436u8y58m82npdqqhmmtqswjsmm",
        fromTerra: "channel-232",
        toTerra: "channel-1",
      },
      icsFromTerra: {
        contract:
          "terra12havy0g3svy6jlnc0je3z4f0lujhkp8h79ux5myhy4ujufeczpzsr5w7lz",
        fromTerra: "channel-236",
        toTerra: "channel-2",
      },
      toTerra: "channel-0",
    },
    icon: "https://station-assets.terra.money/img/chains/Harkonnen.png",
    lcd: "https://harkonnen.terra.dev:1317",
    name: "Harkonnen",
    prefix: "harkonnen",
  },
  "ordos-1": {
    baseAsset: "uord",
    chainID: "ordos-1",
    coinType: "118",
    gasAdjustment: 2.5,
    gasPrices: {
      uord: 0,
    },
    ibc: {
      fromTerra: "channel-227",
      ics: {
        contract:
          "ordos1yyca08xqdgvjz0psg56z67ejh9xms6l436u8y58m82npdqqhmmtq56pc9e",
        fromTerra: "channel-229",
        toTerra: "channel-1",
      },
      icsFromTerra: {
        contract:
          "terra12havy0g3svy6jlnc0je3z4f0lujhkp8h79ux5myhy4ujufeczpzsr5w7lz",
        fromTerra: "channel-234",
        toTerra: "channel-2",
      },
      toTerra: "channel-0",
    },
    icon: "https://station-assets.terra.money/img/chains/Ordos.png",
    lcd: "https://ordos.terra.dev:1317",
    name: "Ordos",
    prefix: "ordos",
  },
  "pisco-1": {
    baseAsset: "uluna",
    chainID: "pisco-1",
    coinType: "330",
    gasAdjustment: 3.5,
    gasPrices: {
      uluna: 0.015,
    },
    icon: "https://station-assets.terra.money/img/chains/Terra.svg",
    lcd: "https://pisco-lcd.terra.dev",
    name: "Terra",
    prefix: "terra",
  },
}

export { mockProposals, mockNetworks }
