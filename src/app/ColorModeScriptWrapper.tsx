// src/app/ColorModeScriptWrapper.tsx

import { ColorModeScript } from '@chakra-ui/react';
import theme from '../theme';

const ColorModeScriptWrapper = () => {
    return <ColorModeScript initialColorMode={theme.config.initialColorMode} />;
};

export default ColorModeScriptWrapper;
