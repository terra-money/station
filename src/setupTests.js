import '@testing-library/jest-dom';
import { Crypto } from '@peculiar/webcrypto';
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { WalletStatus } from '@terra-money/wallet-types';

Enzyme.configure({ adapter: new Adapter() });
//global.crypto = new Crypto();
// globalThis.crypto = require('crypto');

jest.mock('react-modal', () => ({
  ...jest.requireActual('react-modal'),
  setAppElement: () => {},
}));

jest.mock('@ledgerhq/hw-transport-web-ble', () => ({}));

jest.mock('@terra-money/wallet-provider', () => {
  const useWallet = () => {
    return {
      status: 'WALLET_CONNECTED',
    };
  };

  return {
    useWallet: useWallet,
  };
});

jest.mock('react-query', () => ({
  useQueryClient: () => {
    return {};
  },
}));

jest.mock('@terra-money/use-wallet', () => ({
  useConnectedWallet: () => {
    return {};
  },
}));

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));
