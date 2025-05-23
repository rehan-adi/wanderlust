import { pinecone } from "../../../lib/pinecone";
import { getTextEmbedding } from "@/utils/embedding";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          message: "Search query is required",
        },
        { status: 400 }
      );
    }

    const embedding = await getTextEmbedding(query);

    const index = pinecone.Index("image-embeddings");

    const queryResponse = await index.query({
      vector: embedding,
      includeMetadata: true,
      topK: 2,
    });

    return NextResponse.json({
      result: queryResponse.matches.map((match) => ({
        id: match.id,
        score: match.score,
        prompt: match.metadata?.prompt,
        imageUrl: match.metadata?.imageUrl,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to search",
        error: error,
      },
      { status: 500 }
    );
  }
};
