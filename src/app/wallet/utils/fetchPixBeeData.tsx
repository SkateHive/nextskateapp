import axios from "axios";

export const fetchPixBeeData = async () => {
    try {
        const response = await axios.get(`https://aphid-glowing-fish.ngrok-free.app/skatebank`, {
            headers: {
                "ngrok-skip-browser-warning": "69420",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

// useEffect(() => {
//     const fetchPixBeeData = async () => {
//         try {
//             const response = await fetch('https://aphid-glowing-fish.ngrok-free.app/hbdticker');
//             const data = await response.json();
//             setPixBeeData(data);
//             setCurrentHBDPrice(parseFloat(data.HBDPriceBRL) || 0);
//         } catch (error) {
//             console.error("Failed to fetch updated PixBee data:", error);
//         }
//     };

//     const interval = setInterval(() => {
//         setCountdown(prevCountdown => prevCountdown - 1);
//     }, 1000);

//     if (countdown === 0) {
//         fetchPixBeeData();
//         setCountdown(30); // Reseta o countdown após a atualização
//     }

//     return () => clearInterval(interval);
// }, [countdown]);

export const formatCPF = (cpf: string) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

export const formatCNPJ = (cnpj: string) => cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');

export const formatTelephone = (telephone: string) => telephone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

export const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
};

export const validatePhone = (phone: string) => {

    const cleanPhone = phone.replace(/[^\d]+/g, '');

    const phoneRegex = /^\d{10,11}$/;

    if (!phoneRegex.test(cleanPhone)) {
        return false;
    }

    if (/^(\d)\1+$/.test(cleanPhone)) {
        return false;
    }

    return true;
};

export const formatRandomKey = (key: string) => {
    // Remove qualquer caractere não hexadecimal
    const cleanKey = key.replace(/[^a-fA-F0-9]/g, '');

    // Adiciona traços no formato UUID
    return cleanKey.length === 32
        ? `${cleanKey.slice(0, 8)}-${cleanKey.slice(8, 12)}-${cleanKey.slice(12, 16)}-${cleanKey.slice(16, 20)}-${cleanKey.slice(20)}`
        : cleanKey;
};
