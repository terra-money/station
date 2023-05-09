import "@testing-library/jest-dom";
import { Crypto } from "@peculiar/webcrypto";
import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { mockNetworks } from "__mocks__/Networks.mock";
import { mockWhitelist } from "__mocks__/Whitelist.mock";
import { mockBankBalance } from "__mocks__/BankBalance.mock";
import { mockBalances } from "__mocks__/Balances.mock";
import { mockExchangeRates } from "__mocks__/ExchangeRates.mock";
import { mockSupportedFiatList } from "__mocks__/SupportedFiatList.mock";
import { mockInterchainAddresses } from "__mocks__/InterchainAddresses.mock";
import { mockCustomTokens } from "__mocks__/CustomTokens.mock";
import { mockCurrency } from "__mocks__/Currency.mock";

Enzyme.configure({ adapter: new Adapter() });
global.crypto = new Crypto();

const mockSetRecoilState = jest.fn();

jest.mock("recoil", () => ({
  useRecoilState: (value) => [value, mockSetRecoilState],
  atom: () => {},
}));

jest.mock("./data/wallet", () => {
  const mockUseNetworkName = () => {
    return "testnet";
  };

  const mockUseAddress = () => {
    return "terra111111111111111111111111111111111111111";
  };

  const mockUseChainID = () => {
    return "pisco-1";
  };

  const mockUseNetwork = () => {
    return mockNetworks;
  };

  const mockUseNetworkState = () => {
    const mockSetNetwork = jest.fn();
    return ["testnet", mockSetNetwork];
  };

  const mockUseNetworkOptions = () => [
    {
      value: "mainnet",
      label: "Mainnets",
    },
    {
      value: "testnet",
      label: "Testnets",
    },
    {
      value: "classic",
      label: "Terra Classic",
    },
    {
      value: "localterra",
      label: "LocalTerra",
    },
  ];

  // const mockUseDelegations = () => {
  //   return [];
  // };

  return {
    useNetworkName: mockUseNetworkName,
    useAddress: mockUseAddress,
    useChainID: mockUseChainID,
    useNetwork: mockUseNetwork,
    // useDelegations: mockUseDelegations,
    useNetworkState: mockUseNetworkState,
    useNetworkOptions: mockUseNetworkOptions,
  };
});

jest.mock("./data/queries/chains", () => {
  const actual = jest.requireActual("./data/queries/chains");

  const mockUseWhitelist = () => {
    return mockWhitelist;
  };

  return {
    ...actual,
    useWhitelist: mockUseWhitelist,
  };
});

jest.mock("./utils/localstorage", () => {
  const mockUseDisplayChains = () => {
    return { displayChains: ["pisco-1", "ares-1", "uni-5"] };
  };
  const mockUseSavedChain = () => {
    return { savedChain: "pisco-1", changeSavedChain: jest.fn() };
  };

  return {
    useDisplayChains: mockUseDisplayChains,
    useSavedChain: mockUseSavedChain,
  };
});

jest.mock("./data/settings/CustomTokens", () => {
  const mockUseCustomTokensCW20 = () => mockCustomTokens;

  return {
    useCustomTokensCW20: mockUseCustomTokensCW20,
  };
});

jest.mock("./data/settings/Currency", () => {
  const actual = jest.requireActual("./data/settings/Currency");
  const mockUseCurrency = () => mockCurrency;
  // const mockUseCurrencyState = () => [
  //   {
  //     id: "USD",
  //     name: "United States Dollar",
  //     symbol: "$",
  //   },
  //   mockSetRecoilState,
  // ];

  return {
    ...actual,
    useCurrency: mockUseCurrency,
  };
});

jest.mock("./data/settings/AddressBook", () => {
  const mockUseAddressBook = () => {
    return { list: [], remove: jest.fn() };
  };

  return {
    useAddressBook: mockUseAddressBook,
  };
});

jest.mock("./data/queries/bank", () => {
  const mockUseIsWalletEmpty = () => {
    return false;
  };

  const mockUseBankBalance = () => {
    return mockBankBalance;
  };

  const mockUseBalances = () => {
    return mockBalances;
  };

  return {
    useIsWalletEmpty: mockUseIsWalletEmpty,
    useBankBalance: mockUseBankBalance,
    useBalances: mockUseBalances,
  };
});

jest.mock("./auth/hooks/useAddress", () => {
  const useInterchainAddresses = () => {
    return mockInterchainAddresses;
  };

  return {
    useInterchainAddresses: useInterchainAddresses,
  };
});

jest.mock("./data/queries/coingecko", () => {
  const mockUseExchangeRates = () => {
    return mockExchangeRates;
  };

  const useSupportedFiatMock = () => {
    return {
      data: mockSupportedFiatList,
    };
  };

  const mockUseMemoizedCalcValue = () => {
    return (
      ({ amount, denom }) => {
        return Number(amount) * Number(mockExchangeRates[denom] ?? 0);
      },
      [mockExchangeRates]
    );
  };

  return {
    useExchangeRates: mockUseExchangeRates,
    useSupportedFiat: useSupportedFiatMock,
    useMemoizedCalcValue: mockUseMemoizedCalcValue,
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
  const TestReactModal = require("./__mocks__/ReactModal.mock");
  return TestReactModal.default;
});

jest.mock("lottie-react", () => ({
  Lottie: jest.fn(),
}));

jest.mock("./data/settings/Theme", () => {
  const mockUseThemeFavicon = () => "/static/media/favicon.1e08d51d.svg";

  return {
    useThemeFavicon: mockUseThemeFavicon,
  };
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
