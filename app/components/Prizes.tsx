import Image from "next/image";
import localfont from "next/font/local";
import Card from "./Card";
import Background from "/public/assets/bg-sol.svg";

const titleFont = localfont({ src: "../fonts/lightmorning.ttf" });

export default function Prizes() {
  return (
    <section className="relative flex flex-col items-center min-h-screen px-5 sm:px-14 md:px-20 pt-4 pb-16">
      <div className="my-12 w-full">
        <h2
          className={`${titleFont.className} text-center text-3xl sm:text-5xl xl:text-6xl`}
        >
          Prizes Available
        </h2>
      </div>
      <div
        className="z-0 grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-4 border-[7px] border-secondary rounded-[15px] p-3 sm:p-5 "
        style={{
          background: "linear-gradient(10deg, #921C1DBF 0%, #E2AD4FCC 83%)",
        }}
      >
        {Array.from({ length: 18 }, (_, index: number) => (
          <Card key={index} />
        ))}
      </div>
      <Image
        className="-z-10 absolute top-0 left-0 object-cover lg:object-fill h-full w-full"
        src={Background}
        alt="Background asset"
        sizes="100vw"
      />
    </section>
  );
}
