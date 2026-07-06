import { NextResponse } from "next/server";
import { s3Client } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
    try {
        const { urls } = await request.json();

        if (!urls || !Array.isArray(urls)) {
            return NextResponse.json({ error: "Geçersiz URL listesi" }, { status: 400 });
        }

        const bucketName = process.env.R2_BUCKET_NAME;
        const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

        const deletePromises = urls.map(async (url) => {
            if (!url || typeof url !== 'string') return;

            // If the URL doesn't start with our current public URL, it might be an old link
            // We should skip R2 deletion for it but not fail the whole request
            if (!url.startsWith(publicUrl)) {
                console.warn("Skipping R2 delete for external or old URL:", url);
                return;
            }

            try {
                // Extract key from URL
                const key = url.replace(publicUrl, "").replace(/^\//, "");

                const command = new DeleteObjectCommand({
                    Bucket: bucketName,
                    Key: key,
                });

                return await s3Client.send(command);
            } catch (err) {
                console.error("Individual R2 file delete error:", err);
                // We don't throw here so other files can still be deleted
            }
        });

        await Promise.all(deletePromises);

        return NextResponse.json({ success: true, message: "İşlem tamamlandı" });
    } catch (error: any) {
        console.error("R2 deletion error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
