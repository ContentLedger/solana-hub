import { NextRequest, NextResponse } from "next/server";
import { AkordUploader } from "@/lib/akordUploader";
import { formatFileNames } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const metadata = JSON.parse(formData.get("metadata") as string);

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const { imageFileName, metadataFileName } = formatFileNames(
    metadata.name,
    file
  );

  if (process.env.FAKE_UPLOADS) {
    console.warn("Skipping upload to Akord, simulating upload...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return NextResponse.json({
      metadataUrl: `https://fake.uploads/${metadataFileName}`,
      imageUrl: `https://fake.uploads/${imageFileName}`,
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploader = new AkordUploader();

  const [imageUrl] = await uploader.uploadFile([
    {
      buffer,
      fileName: imageFileName,
      contentType: file.type,
    },
  ]);

  const metadataUrl = await uploader.uploadJson(metadataFileName, {
    name: metadata.name,
    symbol: "solana_hub",
    description: metadata.description,
    image: imageUrl,
    attributes: [{ trait_type: "Version", value: "1.0.0" }],
    properties: {
      files: [
        {
          type: file.type,
          uri: imageUrl,
        },
      ],
    },
    seller_fee_basis_points: 500,
    collection: {
      name: "Solana Hub",
      family: "Solana Hub",
    },
    creators: [
      {
        address: metadata.creator,
        share: 100,
      },
    ],
  });

  return NextResponse.json({ metadataUrl, imageUrl });
}
