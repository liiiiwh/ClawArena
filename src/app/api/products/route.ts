import { getProductsSorted, upsertProduct, deleteProduct } from "@/lib/kv";
import { requireAdmin } from "@/lib/auth";
import type { Product } from "@/types";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search")?.toLowerCase();

    let products = await getProductsSorted();

    if (category && category !== "all") {
      products = products.filter((p) => p.category === category);
    }

    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.company.toLowerCase().includes(search) ||
          p.tagline.toLowerCase().includes(search) ||
          p.tags.some((t) => t.toLowerCase().includes(search)),
      );
    }

    return Response.json(products);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const product = (await request.json()) as Product;

    if (!product.id || !product.name) {
      return Response.json(
        { error: "Product must have id and name" },
        { status: 400 },
      );
    }

    await upsertProduct(product);
    return Response.json({ success: true, id: product.id });
  } catch (error) {
    return Response.json(
      { error: "Failed to save product" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = (await request.json()) as { id: string };
    if (!id) {
      return Response.json(
        { error: "Product id is required" },
        { status: 400 },
      );
    }

    await deleteProduct(id);
    return Response.json({ success: true, id });
  } catch (error) {
    return Response.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
