import { useEffect, useState } from 'react';

export function useWalletConnection() {
    const [isConnected, setIsConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);

    useEffect(() => {
        if (!window.ethereum) {
            return;
        }

        const checkConnection = async () => {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts',
                });

                if (accounts.length > 0) {
                    setIsConnected(true);
                    setAddress(accounts[0]);

                    const newChainId = await window.ethereum.request({
                        method: 'eth_chainId',
                    });
                    const parsedChainId = parseInt(newChainId, 16);
                    setChainId(parsedChainId);
                }
            } catch (error) {
                console.error('Error checking connection:', error);
            }
        };

        checkConnection();

        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length > 0) {
                setIsConnected(true);
                setAddress(accounts[0]);
            } else {
                setIsConnected(false);
                setAddress(null);
            }
        };

        const handleChainChanged = (newChainHexId: string) => {
            const newChainId = parseInt(newChainHexId, 16);
            setChainId(newChainId);
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            if (window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, []);

    return {
        isConnected,
        address,
        chainId,
    };
}
