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
            if (!url.startsWith(publicUrl)) return;

            // Extract key from URL
            const key = url.replace(publicUrl, "").replace(/^\//, "");

            const command = new DeleteObjectCommand({
                Bucket: bucketName,
                Key: key,
            });

            return s3Client.send(command);
        });

        await Promise.all(deletePromises);

        return NextResponse.json({ success: true, message: "Dosyalar başarıyla silindi" });
    } catch (error: any) {
        console.error("R2 deletion error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
