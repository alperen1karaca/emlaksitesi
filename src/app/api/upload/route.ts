import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;
        const contentType = file.type || "application/octet-stream";

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: contentType,
        });

        await s3Client.send(command);

        const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error("R2 Upload Error:", error);
        return NextResponse.json({ error: "Dosya yükleme hatası: " + error.message }, { status: 500 });
    }
}
