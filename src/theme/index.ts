
// src/theme/index.ts

import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
    },
    styles: {
        global: {
            body: {
                bg: 'black',
            },
        },
    },
});

export default theme;
