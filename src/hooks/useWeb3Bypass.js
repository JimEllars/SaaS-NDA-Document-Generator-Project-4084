import { useState, useEffect } from 'react';
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { getContract } from 'thirdweb';
import { createThirdwebClient } from 'thirdweb';
import { defineChain } from 'thirdweb';

const isWeb3Enabled = import.meta.env.VITE_ENABLE_WEB3 === 'true';

// Create a client
const client = isWeb3Enabled ? createThirdwebClient({
  clientId: "dummy-client-id", // Use a dummy client ID for now, or VITE_THIRDWEB_CLIENT_ID if it existed
}) : null;

const myChain = isWeb3Enabled ? defineChain(1) : null; // Mainnet

export const useWeb3Bypass = () => {
    // Always call hooks
    const account = useActiveAccount();
    const [hasToken, setHasToken] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    // Dummy contract address, only if web3 is enabled
    const contract = isWeb3Enabled ? getContract({
        client,
        chain: myChain,
        address: "0x0000000000000000000000000000000000000000",
    }) : null;

    const { data: balance, isLoading } = useReadContract(isWeb3Enabled ? {
        contract,
        method: "function balanceOf(address owner) view returns (uint256)",
        params: account ? [account.address] : undefined,
    } : { contract: null }); // Pass dummy options or handle it in a way that doesn't crash thirdweb hook

    useEffect(() => {
        if (!isWeb3Enabled) {
             setHasToken(false);
             setIsChecking(false);
             return;
        }

        if (!account) {
            setHasToken(false);
            setIsChecking(false);
            return;
        }

        setIsChecking(true);
        if (!isLoading) {
            // Check if balance is greater than 0
            // Since it's a dummy, let's just pretend we have it if account is connected for the sake of bypassing paywall testing.
            // In reality, it would be: setHasToken(balance && balance > 0n);
            setHasToken(true); // Always true for connected account in this dummy implementation
            setIsChecking(false);
        }
    }, [account, balance, isLoading]);

    if (!isWeb3Enabled) {
        return {
            hasToken: false,
            isChecking: false,
            client: null,
            account: null
        };
    }

    return {
        hasToken,
        isChecking,
        client,
        account
    };
};
