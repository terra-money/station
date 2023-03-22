import { useEffect, useState } from "react"
import nameMatcha from "@leapwallet/name-matcha"
import debounce from "lodash.debounce";

/**
 * Loopup address based on domain. 
 *
 * @param address 
 * @returns The terra address of the specified name, null if not resolvable.
 */
export const useNames = (recipient?: string) => {
  const [resolvedAddress, setResolvedAddress] = useState("");

  console.log("useNames", recipient);

  const [debouncedRecipient, setDebouncedRecipient] = useState(recipient);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedRecipient(recipient), 300);

    return () => clearTimeout(handler);
  }, [recipient]);


  useEffect(() => {
    debounce((async () => {
      if (!debouncedRecipient) {
        return;
      }
      const address = await nameMatcha.resolveAll(debouncedRecipient)
      const firstAddress = Object.values(address).find((value) => value !== null) || null;

      if (firstAddress) {
        setResolvedAddress(firstAddress);
      }
    }), 300)();
  }, [debouncedRecipient]);


  return resolvedAddress;
};