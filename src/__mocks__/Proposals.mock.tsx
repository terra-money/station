const today = new Date()
const mockProposalDatetime1 = new Date(new Date().setDate(today.getDate() - 7))
const mockProposalDatetime2 = new Date(
  new Date().setDate(today.getDate() - 180)
)
const mockProposalDatetime3 = new Date(
  new Date().setDate(today.getDate() - 365)
)

export const mockProposals = [
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
