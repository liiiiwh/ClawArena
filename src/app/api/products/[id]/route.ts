import { getProductById } from "@/lib/kv";

// KV accessed via /api/kv edge function proxy

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    return Response.json(product);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
