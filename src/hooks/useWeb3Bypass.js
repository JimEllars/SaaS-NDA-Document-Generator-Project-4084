import { useState, useEffect } from 'react';
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { getContract } from 'thirdweb';
import { createThirdwebClient } from 'thirdweb';
import { defineChain } from 'thirdweb';

const isWeb3Enabled = import.meta.env.VITE_ENABLE_WEB3 === 'true';

export const useWeb3Bypass = () => {
    return {
        hasToken: false,
        isChecking: false,
        client: null,
        account: null
    };
};