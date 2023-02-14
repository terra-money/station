import '@testing-library/jest-dom';
import { Crypto } from "@peculiar/webcrypto"
global.crypto = new Crypto()

jest.mock('react-modal', () => ({
    ...jest.requireActual('react-modal'),
    setAppElement: () => { },
}));

jest.mock('@ledgerhq/hw-transport-web-ble', () => ({}));
