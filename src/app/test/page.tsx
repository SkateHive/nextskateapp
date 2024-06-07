import Email from 'vercel-email';
import { Button } from '@chakra-ui/react';
export const runtime = 'edge';


const sendEmail = async (email: string, text: string) => {
    await Email.send({
        to: 'vlad.testnet@gmail.com',
        from: 'thomas@turbando.com',
        subject: 'Hello World',
        text: 'Aquele 6x1 foi cagada',
    });
}


const emailPage = () => {
    return (
        <div>
            <Button onClick={() => sendEmail("email", 'Aquele 6x1 foi cagada')}>Send Email</Button>
        </div>
    )
}

export default emailPage;