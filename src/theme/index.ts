// src/theme/index.ts

import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
    },
    styles: {
        global: {
            html: {
                color: 'white',
                bg: 'black',
            },
            body: {
                bg: 'black',
                color: 'white',
            },
        },
    },
});

export default theme;
