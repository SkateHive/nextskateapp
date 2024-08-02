import React from "react";
import { Card, CardHeader, CardBody, Text, Center, HStack, Input } from "@chakra-ui/react";
import { useHiveUser } from "@/contexts/UserContext";
import { sendHiveOperation } from "@/lib/hive/server-functions";
import { Container } from "@chakra-ui/react";

export default function Pix() {
    return (
        <HStack>

            <Center mt={'20px'}>
                <Container
                    maxW="container.sm"
                >
                    <Card>
                        <CardHeader>
                            <Center>
                                Send HBD to Receive Pix:
                            </Center>
                        </CardHeader>
                        <CardBody>
                            <Input
                                placeholder="Digite sua chave pix"
                            />
                            <Text >
                                To use Pix, send a payment to the following address:
                            </Text>
                            <Text variant="body2" color="text.secondary">
                                <strong>
                                    0x
                                </strong>
                            </Text>
                        </CardBody>
                    </Card>
                </Container>
            </Center>
            <Center mt={'20px'}>
                <Container
                    maxW="container.sm"
                >
                    <Card>
                        <CardHeader>
                            <Center>
                                Enviar PIX Receber HBD:
                            </Center>
                        </CardHeader>
                        <CardBody>
                            <Input
                                placeholder="Digite sua chave pix"
                            />
                            <Text >
                                To use Pix, send a payment to the following address:
                            </Text>
                            <Text variant="body2" color="text.secondary">
                                <strong>
                                    0x
                                </strong>
                            </Text>
                        </CardBody>
                    </Card>
                </Container>
            </Center>
        </HStack>
    );
}