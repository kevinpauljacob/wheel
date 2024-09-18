import Image from "next/image";
import Link from "next/link";
import Logo from "/public/assets/smithii-logo.svg";

export const socials = [
  {
    name: "Twitter",
    href: "https://twitter.com/smithii",
    icon: "/assets/twitter.svg",
  },
  {
    name: "Discord",
    href: "https://discord.gg/smithii",
    icon: "/assets/discord.svg",
  },
  {
    name: "Telegram",
    href: "https://telegram.com/smithii",
    icon: "/assets/telegram.svg",
  },
];

export default function Footer() {
  return (
    <footer className="flex flex-col md:flex-row gap-4 justify-between items-center p-5 md:px-10 lg:px-14 xl:px-20 md:py-8">
      <div>
        <Image
          src={Logo}
          alt="Smithii Logo"
          width={175}
          height={175}
          className="w-[150px] h-[40px] md:w-[175px] md:h-[50px]"
        />
      </div>
      <p>© 2024 Smithii LTD | All rights reserved</p>
      <div className="hidden lg:flex items-center gap-4">
        {socials.map((social, index: number) => (
          <Link key={index} href={social.href}>
            <Image src={social.icon} alt={social.name} width={40} height={40} />
          </Link>
        ))}
      </div>
    </footer>
  );
}
