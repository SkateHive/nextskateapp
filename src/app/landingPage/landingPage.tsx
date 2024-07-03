import { Box, Flex, Heading, Image, Input, Button, Text } from '@chakra-ui/react';
import { initializeForms } from './utils'; // Adjust path as necessary

const LandingPage = () => {
  // Initialize forms on component mount
  initializeForms();

  return (
    <Box bg="#000000" h="100vh" display="flex" justifyContent="center" alignItems="center">
      <Box maxW="800px" w="80%" bg="#000000" p="20px" borderRadius="8px" boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)">
        <Flex justifyContent="space-between" alignItems="flex-start" className="content">
          <Box className="left" textAlign="center" mr="20px" flex="1">
            <Image src="https://beta.skatehive.app/skatehive_square_green.png" alt="Welcome Image" borderRadius="8px" maxW="100%" />
            <Text mt="10px" fontSize="16px" color="#c7c6c6">Decentralized skateboarding community.</Text>
          </Box>
          <Box className="right" flex="1" mt="30px">
            <form id="auth-form">
              <Heading as="h2" fontSize="20px" mb="10px" color="#00ff22">Log In</Heading>
              <Flex alignItems="center" className="form-group" mb="15px">
                <Text fontSize="14px" color="#919191">@</Text>
                <Input type="text" id="login-hive" name="login-hive" placeholder="Hive Name" />
                <Button type="submit" variant="solid" bg="#4caf50" color="white" ml="10px">Log In</Button>
              </Flex>
              <Text className="or-divider" mt="96px" textAlign="center" fontStyle="italic" color="#b8b8b8">First time?</Text>
              <Flex alignItems="center" className="form-group">
                <Input type="password" id="login-password" name="login-password" placeholder="Public Posting Key" />
              </Flex>
            </form>
            <Text className="or-divider" mt="10px" textAlign="center" fontStyle="italic" color="#b8b8b8">or...</Text>
            <Button variant="solid" bg="#008cba" color="white" mt="10px" w="100%">Sign Up</Button>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

export default LandingPage;