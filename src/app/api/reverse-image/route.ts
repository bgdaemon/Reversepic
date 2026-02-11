import { NextResponse } from "next/server";

function normalizeImageUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = trimmed.includes("://") ? new URL(trimmed) : new URL(`https://${trimmed}`);
    if (!/^https?:$/.test(url.protocol)) return null;
    return url;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageUrlParam = searchParams.get("imageUrl") ?? "";
  const imageUrl = normalizeImageUrl(imageUrlParam);
  if (!imageUrl) {
    return NextResponse.json({ message: "Invalid imageUrl" }, { status: 400 });
  }

  // Important: truly "free" reverse image search at scale requires an external provider.
  // Here we generate *links* to public reverse-image search UIs.
  const links = [
    {
      provider: "Google Images",
      url: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl.toString())}`,
    },
    {
      provider: "Bing Visual Search",
      url: `https://www.bing.com/images/search?q=imgurl:${encodeURIComponent(
        imageUrl.toString()
      )}&view=detailv2&iss=sbi`,
    },
    {
      provider: "Yandex Images",
      url: `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(imageUrl.toString())}`,
    },
    {
      provider: "TinEye",
      url: `https://tineye.com/search?url=${encodeURIComponent(imageUrl.toString())}`,
    },
  ];

  return NextResponse.json({ imageUrl: imageUrl.toString(), links });
}
