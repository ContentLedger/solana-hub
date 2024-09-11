import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PersonIcon } from "@radix-ui/react-icons";
import { useConnection } from "@solana/wallet-adapter-react";
import { usePrimaryDomain, useProfilePic } from "@bonfida/sns-react";
import { PublicKey } from "@solana/web3.js";

export type AvatarSNSProps = {
  publicKey: PublicKey;
};

export function AvatarSNS({ publicKey }: AvatarSNSProps) {
  const { connection } = useConnection();
  const { domain } = usePrimaryDomain(connection, publicKey);
  const { profileUrl } = useProfilePic(connection, domain);

  return (
    <Avatar className="w-6 h-6">
      <AvatarImage src={profileUrl || undefined} />
      <AvatarFallback>
        <PersonIcon />
      </AvatarFallback>
    </Avatar>
  );
}
