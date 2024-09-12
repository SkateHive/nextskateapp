'use client'
import LoginModal from "@/components/Hive/Login/LoginModal";
import Pix from "./wallet/components/pix";
import { useHiveUser } from "@/contexts/UserContext";
export default function Home() {
  const user = useHiveUser();

  return (
    <>
      {user.hiveUser ? (
        <Pix user={user.hiveUser} />
      ) : (
        <LoginModal isOpen={true} onClose={() => { }} />
      )
      }
    </>
  );
}
