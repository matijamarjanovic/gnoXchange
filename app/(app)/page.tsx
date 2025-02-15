import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Ticket, Wallet } from "lucide-react";
import Link from "next/link";

const generateRandomStyles = (count: number) => {
  return Array.from({ length: count }, () => ({
    transform: `rotate(${Math.random() * 360}deg)`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
  }));
};

const walletStyles = generateRandomStyles(32);
const ticketStyles = generateRandomStyles(32);
const packageStyles = generateRandomStyles(32);

export default function Home() {
  return (
    <div className="flex items-start pt-16 h-full bg-transparent relative">
      <div className="flex flex-col gap-4 w-full items-center relative z-10">
        <Card className="w-[75vw] bg-gray-800 text-gray-400 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to GnoXchange</CardTitle>
          <CardDescription className="text-center">
            A decentralized exchange built on the gno.land chain
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>Experience seamless trading with enhanced security and efficiency on the gno.land ecosystem.</p>
        </CardContent>
      </Card>
        <Link href="/pools">
          <Card className="hover:bg-gray-900 transition-colors cursor-pointer w-[75vw] bg-gray-800 text-gray-400 border-none relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0">
                {walletStyles.map((style, i) => (
                  <Wallet
                    key={i}
                    size={24}
                    className="opacity-50 absolute"
                    style={style}
                  />
                ))}
              </div>
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl text-center">Liquidity Pools</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 text-center">
              <p>Instant automated trading with fair market prices</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tickets">
          <Card className="hover:bg-gray-900 transition-colors cursor-pointer w-[75vw] bg-gray-800 text-gray-400 border-none relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0">
                {ticketStyles.map((style, i) => (
                  <Ticket
                    key={i}
                    size={24}
                    className="opacity-50 absolute"
                    style={style}
                  />
                ))}
              </div>
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl text-center">P2P Trading</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 text-center">
              <p>Direct secure trading between users</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/nftmarket">
          <Card className="hover:bg-gray-900 transition-colors cursor-pointer w-[75vw] bg-gray-800 text-gray-400 border-none relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0">
                {packageStyles.map((style, i) => (
                  <Package
                    key={i}
                    size={24}
                    className="opacity-50 absolute"
                    style={style}
                  />
                ))}
              </div>
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl text-center">NFT Market</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 text-center">
              <p>Browse and trade NFTs seamlessly</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
