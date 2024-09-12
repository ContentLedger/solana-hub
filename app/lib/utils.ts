import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileNames(
  name: string,
  file: File
): {
  imageFileName: string;
  metadataFileName: string;
} {
  const supportedImageTypes: { [key: string]: string } = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
  };

  const contentType = file.type;
  console.log({ contentType });

  if (!supportedImageTypes[contentType]) {
    throw new Error("Unsupported file type");
  }
  console.log({ name });
  const formattedName = name
    .toLowerCase()
    .replace(/\./g, "-")
    .replace(/ /g, "-");
  const fileExtension = supportedImageTypes[contentType];

  const imageFileName = `${formattedName}${fileExtension}`;
  const metadataFileName = `${formattedName}.json`;

  return { imageFileName, metadataFileName };
}

const pluralRules = new Intl.PluralRules("en-US");

export function pluralize(count: number, singular: string, plural: string) {
  const grammaticalNumber = pluralRules.select(count);
  switch (grammaticalNumber) {
    case "one":
      return count + " " + singular;
    case "other":
      return count + " " + plural;
    default:
      throw new Error("Unknown: " + grammaticalNumber);
  }
}
