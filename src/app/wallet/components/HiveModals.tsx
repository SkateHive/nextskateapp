import { Dispatch, SetStateAction } from 'react';
import HBDSendModal from './Modals/Hbd';
import HBDSavingsModal from './Modals/HbdSavings';
import HiveModalOpen from './Modals/Hive';
import HpDelegateModal from './Modals/HPPower';
interface HiveModalsProps {
    isSendHBD: boolean;
    setIsHbdModalOpened: Dispatch<SetStateAction<boolean>>;
    isDepositHbdSavingsModalOpened: boolean;
    setIsDepositHbdSavingsModalOpened: Dispatch<SetStateAction<boolean>>;
    isWithdrawHbdModalOpened: boolean;
    setIsWithdrawHbdModalOp: Dispatch<SetStateAction<boolean>>;
    isHPPowerModalOpened: boolean;
    setIsHPPowerModalOpened: Dispatch<SetStateAction<boolean>>;
    isHpDelegatesModalOpened: boolean;
    setIsHpDelegatesModalOpened: Dispatch<SetStateAction<boolean>>;
    isHiveModalOpened: boolean;
    setIsHiveModalOpened: Dispatch<SetStateAction<boolean>>;
    isHivePowerModalOpened: boolean;
    setIsHivePowerModalOpened: Dispatch<SetStateAction<boolean>>;
}
const HiveModals: React.FC<HiveModalsProps> = ({
    isSendHBD,
    setIsHbdModalOpened,
    isDepositHbdSavingsModalOpened,
    setIsDepositHbdSavingsModalOpened,
    isWithdrawHbdModalOpened,
    setIsWithdrawHbdModalOp,
    isHPPowerModalOpened,
    setIsHPPowerModalOpened,
    isHpDelegatesModalOpened,
    setIsHpDelegatesModalOpened,
    isHiveModalOpened,
    setIsHiveModalOpened,
    isHivePowerModalOpened,
    setIsHivePowerModalOpened
}) => {

    return (
        <>
            <HiveModalOpen
                isHive={isHiveModalOpened}
                onCloseHive={setIsHiveModalOpened}
                isHivePowerUp={isHivePowerModalOpened}
                onCloseHivePowerUp={setIsHivePowerModalOpened}
            />
            <HBDSavingsModal
                isDepositHbd={isDepositHbdSavingsModalOpened}
                onCloseDepositHbd={setIsDepositHbdSavingsModalOpened}
                isWithdrawHb={isWithdrawHbdModalOpened}
                onCloseWithdrawHbd={setIsWithdrawHbdModalOp}
            />
            <HpDelegateModal
                isHPPowerDown={isHPPowerModalOpened}
                onCloseHPPowerDown={setIsHPPowerModalOpened}
                isHpDelegates={isHpDelegatesModalOpened}
                onCloseHpDelegates={setIsHpDelegatesModalOpened}
            />
            <HBDSendModal
                isSendHBD={isSendHBD}
                onCloseSendHBD={setIsHbdModalOpened} 
            />
        </>
    )
}

export default HiveModals;
