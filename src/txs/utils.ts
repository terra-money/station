import BigNumber from "bignumber.js"
import { readAmount, toAmount } from "@terra.kitchen/utils"
import { AuthInfo, Coin, Coins, CreateTxOptions, Dec, Fee, LCDClient, Numeric, SignerData, SignerOptions, SimulateResponse, Tx, TxBody } from "@terra-money/terra.js"
import { has } from "utils/num"

export const getPlaceholder = (decimals = 6) => "0.".padEnd(decimals + 2, "0")

export const toInput = (amount: BigNumber.Value, decimals = 6) =>
  new BigNumber(readAmount(amount, { decimals })).toNumber()

/* field array (coins) */
export interface CoinInput {
  input?: number
  denom: CoinDenom
}

export const getCoins = (coins: CoinInput[]) => {
  return new Coins(
    coins
      .map(({ input, denom }) => ({ amount: toAmount(input), denom }))
      .filter(({ amount }) => has(amount))
      .map(({ amount, denom }) => new Coin(denom, amount))
  )
}
export class MisesClient {
  lcd: LCDClient
  baseURL: string
  constructor(lcd: LCDClient, baseURL: string) {
    this.lcd = lcd;
    this.baseURL = baseURL;
  }
  public async create(
    signers: SignerOptions[],
    options: CreateTxOptions
  ): Promise<Tx> {
    let { fee } = options;
    const { msgs, memo, timeoutHeight } = options;

    const signerDatas: SignerData[] = [];
    for (const signer of signers) {
      let sequenceNumber = signer.sequenceNumber;
      let publicKey = signer.publicKey;

      if (!sequenceNumber || !publicKey) {
        const account = await this.lcd.auth.accountInfo(signer.address);
        if (!sequenceNumber) {
          sequenceNumber = account.getSequenceNumber();
        }

        if (!publicKey) {
          publicKey = account.getPublicKey();
        }
      }

      signerDatas.push({
        sequenceNumber,
        publicKey,
      });
    }

    if (fee === undefined) {
      fee = await this.estimateFee(signerDatas, options);
    }

    return new Tx(
      new TxBody(msgs, memo || '', timeoutHeight || 0),
      new AuthInfo([], fee),
      []
    );
  }
  /**
   * Estimates the transaction's fee by simulating it within the node
   * @param sourceAddress address that will pay the bill
   * @param msgs standard messages
   * @param options options for fee estimation
   */
   public async estimateFee(
    signers: SignerData[],
    options: CreateTxOptions
  ): Promise<Fee> {
    const gasPrices = options.gasPrices || this.lcd.config.gasPrices;
    const gasAdjustment =
      options.gasAdjustment || this.lcd.config.gasAdjustment;
    const feeDenoms = options.feeDenoms || ['uluna'];
    let gas = options.gas;
    let gasPricesCoins: Coins | undefined;

    if (gasPrices) {
      gasPricesCoins = new Coins(gasPrices);

      if (feeDenoms) {
        const gasPricesCoinsFiltered = gasPricesCoins.filter(c =>
          feeDenoms.includes(c.denom)
        );

        if (gasPricesCoinsFiltered.toArray().length > 0) {
          gasPricesCoins = gasPricesCoinsFiltered;
        }
      }
    }

    const txBody = new TxBody(options.msgs, options.memo || '');
    const authInfo = new AuthInfo([], new Fee(0, new Coins()));
    const tx = new Tx(txBody, authInfo, []);

    // fill empty signature
    tx.appendEmptySignatures(signers);

    // simulate gas
    if (!gas || gas === 'auto' || gas === '0') {
      gas = (await this.estimateGas(tx, { gasAdjustment })).toString();
    }

    const taxAmount = Coins.fromData([{
      amount: '0',
      denom: 'umis'
    }]);
    const feeAmount = gasPricesCoins
      ? taxAmount.add(gasPricesCoins.mul(gas).toIntCeilCoins())
      : taxAmount;

    return new Fee(Number.parseInt(gas), feeAmount, '', '');
  }

  public async estimateGas(
    tx: Tx,
    options?: {
      gasAdjustment?: Numeric.Input;
    }
  ): Promise<number> {
    const gasAdjustment =
      options?.gasAdjustment || this.lcd.config.gasAdjustment;

    const baseURL = this.baseURL;

    const simulateRes = await fetch(baseURL + "/cosmos/tx/v1beta1/simulate",{
      method:'post',
      body: JSON.stringify({tx_bytes: this.encode(tx)})
    }).then(res=>(res.json())).then(d => SimulateResponse.fromData(d))

    return new Dec(gasAdjustment).mul(simulateRes.gas_info.gas_used).toNumber();
  }

  /**
   * Encode a transaction to Amino-encoding
   * @param tx transaction to encode
   */
  public encode(tx: Tx): string {
    return this.lcd.tx.encode(tx)
  }
}