import '@testing-library/jest-dom';
import { Crypto } from '@peculiar/webcrypto';
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { WalletStatus } from '@terra-money/wallet-types';

Enzyme.configure({ adapter: new Adapter() });

global.crypto = new Crypto();
window.crypto = new Crypto();

jest.mock('jscrypto/SHA256', () => ({

}));

jest.mock('jscrypto/RIPEMD160', () => ({

}));

jest.mock('jscrypto/Base64', () => ({

}));

jest.mock('jscrypto/index.js', () => ({

}));

jest.mock('react-modal', () => ({
  ...jest.requireActual('react-modal'),
  setAppElement: () => {},
}));

jest.mock('@ledgerhq/hw-transport-web-ble', () => ({}));

jest.mock('@terra-money/wallet-provider', () => {
  const useWallet = () => {
    return {
      status: 'WALLET_CONNECTED',
      network: ['pisco-1']
    };
  };

  return {
    useWallet: useWallet,
    WalletStatus: {
      INITIALIZING: "INITIALIZING",
      WALLET_NOT_CONNECTED: "WALLET_NOT_CONNECTED",
      WALLET_CONNECTED: "WALLET_CONNECTED",
    },
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
