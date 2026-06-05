import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type MemoryImageProps = ImageProps & {
  src: string;
};

export function MemoryImage({ src, alt, className, fill, ...props }: MemoryImageProps) {
  const localImage = src.startsWith("data:") || src.startsWith("blob:");

  if (localImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={props.loading === "eager" ? "eager" : "lazy"}
        className={cn(fill && "absolute inset-0 h-full w-full", className)}
      />
    );
  }

  return <Image src={src} alt={alt} className={className} fill={fill} {...props} />;
}
