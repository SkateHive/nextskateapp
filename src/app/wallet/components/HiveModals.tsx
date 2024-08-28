import { Dispatch, SetStateAction } from 'react';
import HBDSavingsModal from './Modals/isDepositHbdSavingsModalOpened';
import HBDSendModal from './Modals/isHbdModalOpened';
import HiveModalOpen from './Modals/isHiveModalsOpen';
import HpDelegateModal from './Modals/isHPPowerModalOpened';
interface HiveModalsProps {
    isHbdModalOpened: boolean;
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
    isHbdModalOpened,
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
                isHiveModalOpened={isHiveModalOpened}
                setIsHiveModalOpened={setIsHiveModalOpened}
                isHivePowerModalOpened={isHivePowerModalOpened}
                setIsHivePowerModalOpened={setIsHivePowerModalOpened}
            />
            <HBDSavingsModal
                isDepositHbdSavingsModalOpened={isDepositHbdSavingsModalOpened}
                setIsDepositHbdSavingsModalOpened={setIsDepositHbdSavingsModalOpened}
                isWithdrawHbdModalOpened={isWithdrawHbdModalOpened}
                setIsWithdrawHbdModalOp={setIsWithdrawHbdModalOp}
            />
            <HpDelegateModal
                isHPPowerModalOpened={isHPPowerModalOpened}
                setIsHPPowerModalOpened={setIsHPPowerModalOpened}
                isHpDelegatesModalOpened={isHpDelegatesModalOpened}
                setIsHpDelegatesModalOpened={setIsHpDelegatesModalOpened}
            />
            <HBDSendModal
                isHbdModalOpened={isHbdModalOpened}
                setIsHbdModalOpened={setIsHbdModalOpened}
            />
        </>
    )
}

export default HiveModals;
