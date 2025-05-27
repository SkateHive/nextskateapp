'use client';

import { useMemo } from 'react';

export interface AirdropUser {
    author: string;
}

export interface AirdropManagerProps {
    leaderboardData: any[];
    sortOption: string;
    limit: number;
}

export interface AirdropStats {
    totalUsers: number;
    afterSpecialFilter: number;
    afterUsernameValidation: number;
    afterEthValidation: number;
    finalFilteredUsers: number;
    limitedUsers: number;
}

export const useAirdropManager = ({ leaderboardData, sortOption, limit }: AirdropManagerProps) => {
    
    const processedData = useMemo(() => {
        // Early return if no data provided (optimization for when modal is closed)
        if (!leaderboardData || leaderboardData.length === 0) {
            return {
                users: [] as AirdropUser[],
                stats: {
                    totalUsers: 0,
                    afterSpecialFilter: 0,
                    afterUsernameValidation: 0,
                    afterEthValidation: 0,
                    finalFilteredUsers: 0,
                    limitedUsers: 0
                } as AirdropStats,
                userCount: { total: 0, limited: 0 }
            };
        }

        // Step 1: Initial data analysis
        let workingData = [...leaderboardData];
        const stats: AirdropStats = {
            totalUsers: workingData.length,
            afterSpecialFilter: 0,
            afterUsernameValidation: 0,
            afterEthValidation: 0,
            finalFilteredUsers: 0,
            limitedUsers: 0
        };

        // Step 2: Apply special filters
        if (sortOption === 'has_voted_in_witness') {
            workingData = workingData.filter(user => user.has_voted_in_witness === true);
        } else if (sortOption === 'airdrop_the_poor') {
            workingData = workingData.filter(user => {
                const totalHiveValue = (user.hive_balance || 0) + (user.hbd_savings_balance || 0) + (user.hp_balance || 0);
                const isPoor = totalHiveValue < 100;
                const hasLowNFTs = (user.skatehive_nft_balance || 0) < 5;
                const hasLowGnars = (user.gnars_balance || 0) < 1;
                
                return isPoor && hasLowNFTs && hasLowGnars;
            });
        }
        stats.afterSpecialFilter = workingData.length;

        // Step 3: Sort the data
        if (sortOption === 'airdrop_the_poor') {
            workingData.sort((a, b) => {
                const aTotalHive = (a.hive_balance || 0) + (a.hbd_savings_balance || 0) + (a.hp_balance || 0);
                const bTotalHive = (b.hive_balance || 0) + (b.hbd_savings_balance || 0) + (b.hp_balance || 0);
                return aTotalHive - bTotalHive;
            });
        } else {
            workingData.sort((a, b) => {
                const aVal = (a as any)[sortOption] ?? 0;
                const bVal = (b as any)[sortOption] ?? 0;
                
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return bVal - aVal; // Descending for numbers
                }
                
                if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
                    return bVal === aVal ? 0 : bVal ? 1 : -1;
                }
                
                return String(aVal).localeCompare(String(bVal));
            });
        }

        // Step 4: Username validation
        const invalidUsernames: string[] = [];
        
        workingData = workingData.filter(user => {
            const username = user.hive_author;
            
            // Check if username exists and is a string
            if (!username || typeof username !== 'string') {
                return false;
            }
            
            // Check username length (Hive usernames must be 3-16 characters)
            if (username.length < 3 || username.length > 16) {
                return false;
            }
            
            // Check for donator/donation patterns (case insensitive) - improved regex pattern
            const donatorPattern = /(donator|donation)/i;
            if (donatorPattern.test(username)) {
                return false;
            }
            
            // Additional checks for placeholder accounts
            const lowerUsername = username.toLowerCase();
            if (lowerUsername.startsWith('placeholder') || 
                lowerUsername.startsWith('temp') || 
                lowerUsername.includes('test')) {
                return false;
            }
            
            return true;
        });
        
        stats.afterUsernameValidation = workingData.length;

        // Step 5: ETH address validation
        const beforeEthFilter = workingData.length;
        const invalidEthAddresses: { user: string, reason: string, address: string }[] = [];
        
        workingData = workingData.filter(user => {
            const ethAddress = user.eth_address;
            
            if (!ethAddress) {
                invalidEthAddresses.push({ user: user.hive_author, reason: 'No ETH address', address: 'null' });
                return false;
            }
            
            if (typeof ethAddress !== 'string') {
                invalidEthAddresses.push({ user: user.hive_author, reason: 'Invalid type', address: String(ethAddress) });
                return false;
            }
            
            if (ethAddress.trim() === '') {
                invalidEthAddresses.push({ user: user.hive_author, reason: 'Empty string', address: ethAddress });
                return false;
            }
            
            if (ethAddress === 'null' || ethAddress === 'undefined') {
                invalidEthAddresses.push({ user: user.hive_author, reason: 'String null/undefined', address: ethAddress });
                return false;
            }
            
            if (!ethAddress.startsWith('0x')) {
                invalidEthAddresses.push({ user: user.hive_author, reason: 'No 0x prefix', address: ethAddress });
                return false;
            }
            
            if (ethAddress.length !== 42) {
                invalidEthAddresses.push({ user: user.hive_author, reason: `Wrong length (${ethAddress.length})`, address: ethAddress });
                return false;
            }
            
            // Check for placeholder addresses (zero address or other common placeholders)
            if (ethAddress === '0x0000000000000000000000000000000000000000' || 
                ethAddress.toLowerCase() === '0x0000000000000000000000000000000000000000' ||
                ethAddress === '0x000000' ||
                /^0x0+$/.test(ethAddress)) {
                invalidEthAddresses.push({ user: user.hive_author, reason: 'Placeholder/zero address', address: ethAddress });
                return false;
            }
            
            return true;
        });
        
        stats.afterEthValidation = workingData.length;

        // Step 6: Final validation and mapping
        stats.finalFilteredUsers = workingData.length;
        
        // Apply limit
        const limitedData = workingData.slice(0, limit);
        stats.limitedUsers = limitedData.length;
        
        // Map to final format
        const finalUsers: AirdropUser[] = limitedData.map(user => ({ author: user.hive_author }));
        
        // Calculate user count data
        let countFilteredUsers = [...leaderboardData];

        // Apply special filtering for count
        if (sortOption === 'has_voted_in_witness') {
            countFilteredUsers = countFilteredUsers.filter(user => user.has_voted_in_witness === true);
        } else if (sortOption === 'airdrop_the_poor') {
            countFilteredUsers = countFilteredUsers.filter(user => {
                const totalHiveValue = (user.hive_balance || 0) + (user.hbd_savings_balance || 0) + (user.hp_balance || 0);
                const isPoor = totalHiveValue < 100;
                const hasLowNFTs = (user.skatehive_nft_balance || 0) < 5;
                const hasLowGnars = (user.gnars_balance || 0) < 1;
                
                return isPoor && hasLowNFTs && hasLowGnars;
            });
        }

        // Apply validation filtering for count
        const validUsersForCount = countFilteredUsers.filter(user => {
            const hasValidUsername = user.hive_author && 
                                   typeof user.hive_author === 'string' &&
                                   user.hive_author.length >= 3 &&
                                   user.hive_author.length <= 16 && 
                                   !/(donator|donation)/i.test(user.hive_author) &&
                                   !user.hive_author.toLowerCase().startsWith('placeholder') &&
                                   !user.hive_author.toLowerCase().startsWith('temp') &&
                                   !user.hive_author.toLowerCase().includes('test');
            
            const hasEthAddress = user.eth_address && 
                                typeof user.eth_address === 'string' &&
                                user.eth_address.trim() !== '' && 
                                user.eth_address !== 'null' && 
                                user.eth_address !== 'undefined' &&
                                user.eth_address.startsWith('0x') &&
                                user.eth_address.length === 42 &&
                                user.eth_address !== '0x0000000000000000000000000000000000000000' &&
                                user.eth_address.toLowerCase() !== '0x0000000000000000000000000000000000000000' &&
                                user.eth_address !== '0x000000' &&
                                !/^0x0+$/.test(user.eth_address);
            
            return hasValidUsername && hasEthAddress;
        });

        const userCount = {
            total: validUsersForCount.length,
            limited: Math.min(validUsersForCount.length, limit)
        };
        
        return {
            users: finalUsers,
            stats,
            userCount
        };
    }, [leaderboardData, sortOption, limit]);

    return {
        airdropUsers: processedData.users,
        airdropStats: processedData.stats,
        userCount: processedData.userCount
    };
};
