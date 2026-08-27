import Link from "next/link";
import Image from "next/image";

export interface ServiceGridItem {
  href: string;
  image: string;
  title: string;
}

export function ServiceGridTile({ href, image, title }: ServiceGridItem) {
  return (
    <Link href={href}>
      <div className="flex cursor-pointer flex-col items-center overflow-hidden rounded-2xl bg-white shadow-sm transition-transform active:scale-95">
        <div className="relative aspect-square w-full">
          <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 768px) 25vw, 150px" />
        </div>
        <p className="px-1 py-2 text-center text-xs font-medium text-gray-700">{title}</p>
      </div>
    </Link>
  );
}
