const today = new Date()
const mockHistoryDatetime = new Date(new Date().setDate(today.getDate() - 180))

export const mockHistory = [
  {
    height: "4418020",
    txhash: "1126F13EAD4ECBC590478A6C055271297044A8E57B6908E2844D7B964D064E67",
    codespace: "",
    code: 0,
    data: "0A300A292F6962632E6170706C69636174696F6E732E7472616E736665722E76312E4D73675472616E73666572120308E503",
    raw_log:
      '[{"events":[{"type":"coin_received","attributes":[{"key":"receiver","value":"terra1mfqnlqz5hh7wzy2lcfmw82s5aqtx2l9efafqqr"},{"key":"amount","value":"1000000000ibc/6286E04D56224087C69BBAEEB78D82312ADE0167A6D340CB71C01BD16056F67D"}]},{"type":"coin_spent","attributes":[{"key":"spender","value":"terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp"},{"key":"amount","value":"1000000000ibc/6286E04D56224087C69BBAEEB78D82312ADE0167A6D340CB71C01BD16056F67D"}]},{"type":"ibc_transfer","attributes":[{"key":"sender","value":"terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp"},{"key":"receiver","value":"corrino197v3teuqkty7rcj6yx32h9a0xpllzmxrmtssgg"}]},{"type":"message","attributes":[{"key":"action","value":"/ibc.applications.transfer.v1.MsgTransfer"},{"key":"sender","value":"terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp"},{"key":"module","value":"ibc_channel"},{"key":"module","value":"transfer"}]},{"type":"send_packet","attributes":[{"key":"packet_data","value":"{\\"amount\\":\\"1000000000\\",\\"denom\\":\\"transfer/channel-227/uord\\",\\"receiver\\":\\"corrino197v3teuqkty7rcj6yx32h9a0xpllzmxrmtssgg\\",\\"sender\\":\\"terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp\\"}"},{"key":"packet_data_hex","value":"7b22616d6f756e74223a2231303030303030303030222c2264656e6f6d223a227472616e736665722f6368616e6e656c2d3232372f756f7264222c227265636569766572223a22636f7272696e6f3139377633746575716b74793772636a36797833326839613078706c6c7a6d78726d7473736767222c2273656e646572223a22746572726131386a366b6735356139363076306c3834356d786567366b307238766675783574736578646b70227d"},{"key":"packet_timeout_height","value":"0-0"},{"key":"packet_timeout_timestamp","value":"1677760735377000000"},{"key":"packet_sequence","value":"485"},{"key":"packet_src_port","value":"transfer"},{"key":"packet_src_channel","value":"channel-225"},{"key":"packet_dst_port","value":"transfer"},{"key":"packet_dst_channel","value":"channel-0"},{"key":"packet_channel_ordering","value":"ORDER_UNORDERED"},{"key":"packet_connection","value":"connection-282"}]},{"type":"transfer","attributes":[{"key":"recipient","value":"terra1mfqnlqz5hh7wzy2lcfmw82s5aqtx2l9efafqqr"},{"key":"sender","value":"terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp"},{"key":"amount","value":"1000000000ibc/6286E04D56224087C69BBAEEB78D82312ADE0167A6D340CB71C01BD16056F67D"}]}]}]',
    logs: [
      {
        msg_index: 0,
        log: "",
        events: [
          {
            type: "coin_received",
            attributes: [
              {
                key: "receiver",
                value: "terra1mfqnlqz5hh7wzy2lcfmw82s5aqtx2l9efafqqr",
              },
              {
                key: "amount",
                value:
                  "1000000000ibc/6286E04D56224087C69BBAEEB78D82312ADE0167A6D340CB71C01BD16056F67D",
              },
            ],
          },
          {
            type: "coin_spent",
            attributes: [
              {
                key: "spender",
                value: "terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp",
              },
              {
                key: "amount",
                value:
                  "1000000000ibc/6286E04D56224087C69BBAEEB78D82312ADE0167A6D340CB71C01BD16056F67D",
              },
            ],
          },
          {
            type: "ibc_transfer",
            attributes: [
              {
                key: "sender",
                value: "terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp",
              },
              {
                key: "receiver",
                value: "corrino197v3teuqkty7rcj6yx32h9a0xpllzmxrmtssgg",
              },
            ],
          },
          {
            type: "message",
            attributes: [
              {
                key: "action",
                value: "/ibc.applications.transfer.v1.MsgTransfer",
              },
              {
                key: "sender",
                value: "terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp",
              },
              {
                key: "module",
                value: "ibc_channel",
              },
              {
                key: "module",
                value: "transfer",
              },
            ],
          },
          {
            type: "send_packet",
            attributes: [
              {
                key: "packet_data",
                value:
                  '{"amount":"1000000000","denom":"transfer/channel-227/uord","receiver":"corrino197v3teuqkty7rcj6yx32h9a0xpllzmxrmtssgg","sender":"terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp"}',
              },
              {
                key: "packet_data_hex",
                value:
                  "7b22616d6f756e74223a2231303030303030303030222c2264656e6f6d223a227472616e736665722f6368616e6e656c2d3232372f756f7264222c227265636569766572223a22636f7272696e6f3139377633746575716b74793772636a36797833326839613078706c6c7a6d78726d7473736767222c2273656e646572223a22746572726131386a366b6735356139363076306c3834356d786567366b307238766675783574736578646b70227d",
              },
              {
                key: "packet_timeout_height",
                value: "0-0",
              },
              {
                key: "packet_timeout_timestamp",
                value: "1677760735377000000",
              },
              {
                key: "packet_sequence",
                value: "485",
              },
              {
                key: "packet_src_port",
                value: "transfer",
              },
              {
                key: "packet_src_channel",
                value: "channel-225",
              },
              {
                key: "packet_dst_port",
                value: "transfer",
              },
              {
                key: "packet_dst_channel",
                value: "channel-0",
              },
              {
                key: "packet_channel_ordering",
                value: "ORDER_UNORDERED",
              },
              {
                key: "packet_connection",
                value: "connection-282",
              },
            ],
          },
          {
            type: "transfer",
            attributes: [
              {
                key: "recipient",
                value: "terra1mfqnlqz5hh7wzy2lcfmw82s5aqtx2l9efafqqr",
              },
              {
                key: "sender",
                value: "terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp",
              },
              {
                key: "amount",
                value:
                  "1000000000ibc/6286E04D56224087C69BBAEEB78D82312ADE0167A6D340CB71C01BD16056F67D",
              },
            ],
          },
        ],
      },
    ],
    info: "",
    gas_wanted: "228735",
    gas_used: "98482",
    tx: {
      "@type": "/cosmos.tx.v1beta1.Tx",
      body: {
        messages: [
          {
            "@type": "/ibc.applications.transfer.v1.MsgTransfer",
            source_port: "transfer",
            source_channel: "channel-225",
            token: {
              denom:
                "ibc/6286E04D56224087C69BBAEEB78D82312ADE0167A6D340CB71C01BD16056F67D",
              amount: "1000000000",
            },
            sender: "terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp",
            receiver: "corrino197v3teuqkty7rcj6yx32h9a0xpllzmxrmtssgg",
            timeout_height: {
              revision_number: "0",
              revision_height: "0",
            },
            timeout_timestamp: "1677760735377000000",
            memo: "",
          },
        ],
        memo: "",
        timeout_height: "0",
        extension_options: [],
        non_critical_extension_options: [],
      },
      auth_info: {
        signer_infos: [
          {
            public_key: {
              "@type": "/cosmos.crypto.secp256k1.PubKey",
              key: "AujLhuwPS1H02v1NkxBoLKGvpn9JZPaDrnnuAWnl0ffx",
            },
            mode_info: {
              single: {
                mode: "SIGN_MODE_DIRECT",
              },
            },
            sequence: "8",
          },
        ],
        fee: {
          amount: [
            {
              denom: "uluna",
              amount: "3432",
            },
          ],
          gas_limit: "228735",
          payer: "",
          granter: "",
        },
      },
      signatures: [
        "XLADqjpe9BjpnHiedRr97gVdN1uD6MWiehzgrZQ20r4Fb4S2kDexpFXRETMTz9nfD7ErCBmErulnGmidHlAAZA==",
      ],
    },
    timestamp: mockHistoryDatetime,
    events: [
      {
        type: "coin_spent",
        attributes: [
          {
            key: "c3BlbmRlcg==",
            value:
              "dGVycmExOGo2a2c1NWE5NjB2MGw4NDVteGVnNmswcjh2ZnV4NXRzZXhka3A=",
            index: true,
          },
          {
            key: "YW1vdW50",
            value: "MzQzMnVsdW5h",
            index: true,
          },
        ],
      },
      {
        type: "coin_received",
        attributes: [
          {
            key: "cmVjZWl2ZXI=",
            value:
              "dGVycmExN3hwZnZha20yYW1nOTYyeWxzNmY4NHoza2VsbDhjNWxrYWVxZmE=",
            index: true,
          },
          {
            key: "YW1vdW50",
            value: "MzQzMnVsdW5h",
            index: true,
          },
        ],
      },
      {
        type: "transfer",
        attributes: [
          {
            key: "cmVjaXBpZW50",
            value:
              "dGVycmExN3hwZnZha20yYW1nOTYyeWxzNmY4NHoza2VsbDhjNWxrYWVxZmE=",
            index: true,
          },
          {
            key: "c2VuZGVy",
            value:
              "dGVycmExOGo2a2c1NWE5NjB2MGw4NDVteGVnNmswcjh2ZnV4NXRzZXhka3A=",
            index: true,
          },
          {
            key: "YW1vdW50",
            value: "MzQzMnVsdW5h",
            index: true,
          },
        ],
      },
      {
        type: "message",
        attributes: [
          {
            key: "c2VuZGVy",
            value:
              "dGVycmExOGo2a2c1NWE5NjB2MGw4NDVteGVnNmswcjh2ZnV4NXRzZXhka3A=",
            index: true,
          },
        ],
      },
      {
        type: "tx",
        attributes: [
          {
            key: "ZmVl",
            value: "MzQzMnVsdW5h",
            index: true,
          },
          {
            key: "ZmVlX3BheWVy",
            value:
              "dGVycmExOGo2a2c1NWE5NjB2MGw4NDVteGVnNmswcjh2ZnV4NXRzZXhka3A=",
            index: true,
          },
        ],
      },
      {
        type: "tx",
        attributes: [
          {
            key: "YWNjX3NlcQ==",
            value:
              "dGVycmExOGo2a2c1NWE5NjB2MGw4NDVteGVnNmswcjh2ZnV4NXRzZXhka3AvOA==",
            index: true,
          },
        ],
      },
      {
        type: "tx",
        attributes: [
          {
            key: "c2lnbmF0dXJl",
            value:
              "WExBRHFqcGU5QmpwbkhpZWRScjk3Z1ZkTjF1RDZNV2llaHpnclpRMjByNEZiNFMya0RleHBGWFJFVE1UejluZkQ3RXJDQm1FcnVsbkdtaWRIbEFBWkE9PQ==",
            index: true,
          },
        ],
      },
      {
        type: "message",
        attributes: [
          {
            key: "YWN0aW9u",
            value: "L2liYy5hcHBsaWNhdGlvbnMudHJhbnNmZXIudjEuTXNnVHJhbnNmZXI=",
            index: true,
          },
        ],
      },
      {
        type: "coin_spent",
        attributes: [
          {
            key: "c3BlbmRlcg==",
            value:
              "dGVycmExOGo2a2c1NWE5NjB2MGw4NDVteGVnNmswcjh2ZnV4NXRzZXhka3A=",
            index: true,
          },
          {
            key: "YW1vdW50",
            value:
              "MTAwMDAwMDAwMGliYy82Mjg2RTA0RDU2MjI0MDg3QzY5QkJBRUVCNzhEODIzMTJBREUwMTY3QTZEMzQwQ0I3MUMwMUJEMTYwNTZGNjdE",
            index: true,
          },
        ],
      },
      {
        type: "coin_received",
        attributes: [
          {
            key: "cmVjZWl2ZXI=",
            value:
              "dGVycmExbWZxbmxxejVoaDd3enkybGNmbXc4MnM1YXF0eDJsOWVmYWZxcXI=",
            index: true,
          },
          {
            key: "YW1vdW50",
            value:
              "MTAwMDAwMDAwMGliYy82Mjg2RTA0RDU2MjI0MDg3QzY5QkJBRUVCNzhEODIzMTJBREUwMTY3QTZEMzQwQ0I3MUMwMUJEMTYwNTZGNjdE",
            index: true,
          },
        ],
      },
      {
        type: "transfer",
        attributes: [
          {
            key: "cmVjaXBpZW50",
            value:
              "dGVycmExbWZxbmxxejVoaDd3enkybGNmbXc4MnM1YXF0eDJsOWVmYWZxcXI=",
            index: true,
          },
          {
            key: "c2VuZGVy",
            value:
              "dGVycmExOGo2a2c1NWE5NjB2MGw4NDVteGVnNmswcjh2ZnV4NXRzZXhka3A=",
            index: true,
          },
          {
            key: "YW1vdW50",
            value:
              "MTAwMDAwMDAwMGliYy82Mjg2RTA0RDU2MjI0MDg3QzY5QkJBRUVCNzhEODIzMTJBREUwMTY3QTZEMzQwQ0I3MUMwMUJEMTYwNTZGNjdE",
            index: true,
          },
        ],
      },
      {
        type: "message",
        attributes: [
          {
            key: "c2VuZGVy",
            value:
              "dGVycmExOGo2a2c1NWE5NjB2MGw4NDVteGVnNmswcjh2ZnV4NXRzZXhka3A=",
            index: true,
          },
        ],
      },
      {
        type: "send_packet",
        attributes: [
          {
            key: "cGFja2V0X2RhdGE=",
            value:
              "eyJhbW91bnQiOiIxMDAwMDAwMDAwIiwiZGVub20iOiJ0cmFuc2Zlci9jaGFubmVsLTIyNy91b3JkIiwicmVjZWl2ZXIiOiJjb3JyaW5vMTk3djN0ZXVxa3R5N3JjajZ5eDMyaDlhMHhwbGx6bXhybXRzc2dnIiwic2VuZGVyIjoidGVycmExOGo2a2c1NWE5NjB2MGw4NDVteGVnNmswcjh2ZnV4NXRzZXhka3AifQ==",
            index: true,
          },
          {
            key: "cGFja2V0X2RhdGFfaGV4",
            value:
              "N2IyMjYxNmQ2Zjc1NmU3NDIyM2EyMjMxMzAzMDMwMzAzMDMwMzAzMDMwMjIyYzIyNjQ2NTZlNmY2ZDIyM2EyMjc0NzI2MTZlNzM2NjY1NzIyZjYzNjg2MTZlNmU2NTZjMmQzMjMyMzcyZjc1NmY3MjY0MjIyYzIyNzI2NTYzNjU2OTc2NjU3MjIyM2EyMjYzNmY3MjcyNjk2ZTZmMzEzOTM3NzYzMzc0NjU3NTcxNmI3NDc5Mzc3MjYzNmEzNjc5NzgzMzMyNjgzOTYxMzA3ODcwNmM2YzdhNmQ3ODcyNmQ3NDczNzM2NzY3MjIyYzIyNzM2NTZlNjQ2NTcyMjIzYTIyNzQ2NTcyNzI2MTMxMzg2YTM2NmI2NzM1MzU2MTM5MzYzMDc2MzA2YzM4MzQzNTZkNzg2NTY3MzY2YjMwNzIzODc2NjY3NTc4MzU3NDczNjU3ODY0NmI3MDIyN2Q=",
            index: true,
          },
          {
            key: "cGFja2V0X3RpbWVvdXRfaGVpZ2h0",
            value: "MC0w",
            index: true,
          },
          {
            key: "cGFja2V0X3RpbWVvdXRfdGltZXN0YW1w",
            value: "MTY3Nzc2MDczNTM3NzAwMDAwMA==",
            index: true,
          },
          {
            key: "cGFja2V0X3NlcXVlbmNl",
            value: "NDg1",
            index: true,
          },
          {
            key: "cGFja2V0X3NyY19wb3J0",
            value: "dHJhbnNmZXI=",
            index: true,
          },
          {
            key: "cGFja2V0X3NyY19jaGFubmVs",
            value: "Y2hhbm5lbC0yMjU=",
            index: true,
          },
          {
            key: "cGFja2V0X2RzdF9wb3J0",
            value: "dHJhbnNmZXI=",
            index: true,
          },
          {
            key: "cGFja2V0X2RzdF9jaGFubmVs",
            value: "Y2hhbm5lbC0w",
            index: true,
          },
          {
            key: "cGFja2V0X2NoYW5uZWxfb3JkZXJpbmc=",
            value: "T1JERVJfVU5PUkRFUkVE",
            index: true,
          },
          {
            key: "cGFja2V0X2Nvbm5lY3Rpb24=",
            value: "Y29ubmVjdGlvbi0yODI=",
            index: true,
          },
        ],
      },
      {
        type: "message",
        attributes: [
          {
            key: "bW9kdWxl",
            value: "aWJjX2NoYW5uZWw=",
            index: true,
          },
        ],
      },
      {
        type: "ibc_transfer",
        attributes: [
          {
            key: "c2VuZGVy",
            value:
              "dGVycmExOGo2a2c1NWE5NjB2MGw4NDVteGVnNmswcjh2ZnV4NXRzZXhka3A=",
            index: true,
          },
          {
            key: "cmVjZWl2ZXI=",
            value:
              "Y29ycmlubzE5N3YzdGV1cWt0eTdyY2o2eXgzMmg5YTB4cGxsem14cm10c3NnZw==",
            index: true,
          },
        ],
      },
      {
        type: "message",
        attributes: [
          {
            key: "bW9kdWxl",
            value: "dHJhbnNmZXI=",
            index: true,
          },
        ],
      },
    ],
  },
]
