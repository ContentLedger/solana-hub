import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  const metadata = JSON.parse(formData.get("metadata") as string);

  console.log({ file, metadata });

  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });

  return NextResponse.json({ metadataUrl: "", imageUrl: "" });
}
