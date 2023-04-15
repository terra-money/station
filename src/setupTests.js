import "@testing-library/jest-dom";
import { Crypto } from "@peculiar/webcrypto";
import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

Enzyme.configure({ adapter: new Adapter() });
global.crypto = new Crypto();

jest.mock("./data/wallet", () => {
  const useAddress = () => {
    return "terra111111111111111111111111111111111111111";
  };

  return {
    useAddress: useAddress,
  };
});

jest.mock("@terra-money/wallet-provider", () => {
  const actual = jest.requireActual("@terra-money/wallet-provider");

  const useWallet = () => {
    return {
      status: "WALLET_CONNECTED",
      network: ["pisco-1"],
    };
  };

  return {
    ...actual,
    useWallet: useWallet,
  };
});

jest.mock("react-modal", () => {
  const TestReactModal = require("./app/__tests__/__mocks__/ReactModal.mock");
  return TestReactModal.default;
});

jest.mock("@ledgerhq/hw-transport-web-ble", () => ({}));

jest.mock("react-query", () => ({
  useQueryClient: () => {
    return {};
  },
}));

jest.mock("@terra-money/use-wallet", () => ({
  useConnectedWallet: () => {
    return {};
  },
  useWallet: () => {
    return {
      post: () => {},
    };
  },
}));

jest.mock("react-i18next", () => ({
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
    type: "3rdParty",
    init: () => {},
  },
}));
