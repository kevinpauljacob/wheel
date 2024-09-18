import Image from "next/image";

export default function SpinCard({ imageSrc, name, alt, index }) {
  return (
    <div
      className="bg-secondary rounded-2xl lg:w-[177px] lg:h-[203px] flex-shrink-0 p-2.5 lg:p-4 relative mr-4 card-container"
      style={{ width: "200px", marginRight: "16px" }}
    >
      <div className="relative mb-1 lg:mb-2 w-full">
        <Image
          src={imageSrc}
          alt={alt} // Use alt prop for accessibility
          width={200}
          height={200}
          className="w-[100px] h-full lg:w-[200px]"
        />
        <div className="absolute top-0 text-[10px] lg:text-base bg-secondary text-primary border border-[#FFE072] rounded-md lg:rounded-lg px-1 lg:px-2 lg:py-0.5">
          %0.5
        </div>
      </div>
      <p className="text-xs lg:text-base font-bold text-white">{name}</p>
      <div className="absolute top-0 right-0 text-white text-lg">{index}</div>
    </div>
  );
}
