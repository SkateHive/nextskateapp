'use client';

import { useQuery } from '@tanstack/react-query';
import { Code, HStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { formatETHaddress } from '@/lib/utils';

async function fetchNNSName(address: string, clds?: string[]) {
    const response = await fetch('https://api.nns.xyz/resolve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            address,
            clds,
            fallback: true, // Ensures a default CLD is used if no lookup is found
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to resolve NNS name');
    }

    const { name } = await response.json();
    return name as string | null;
}

function useNNSName(address?: string, clds?: string[]) {
    return useQuery({
        queryKey: ['nnsName', address, clds],
        queryFn: () => fetchNNSName(address || '', clds),
        enabled: !!address,
    });
}

export function FormattedAddress({
    address,
    textBefore,
    asLink = true,
    clds,
}: {
    address?: string;
    textBefore?: string;
    asLink?: boolean;
    clds?: string[]; // Optional: Specify CLDs to filter by
}) {
    if (!address) return null;

    const { data: nnsName, isLoading, isError } = useNNSName(address, clds);

    const AddressContent = () => (
        <Code size="sm" variant="surface" colorScheme={nnsName ? '' : 'gray'}>
            {isLoading
                ? 'Resolving...'
                : isError || !nnsName
                    ? formatETHaddress(address)
                    : nnsName}
        </Code>
    );

    return (
        <HStack >
            {textBefore && <span>{textBefore}</span>}
            {asLink ? (
                <NextLink href={`https://nouns.build/profile/${address}`}>
                    <AddressContent />
                </NextLink>
            ) : (
                <AddressContent />
            )}
        </HStack>
    );
}
