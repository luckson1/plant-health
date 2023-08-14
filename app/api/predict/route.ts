import { S3 } from "aws-sdk";
import { client } from "@gradio/client";
import { NextResponse } from "next/server";

const s3 = new S3({
    apiVersion: "2006-03-01",
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.REGION,
    signatureVersion: "v4",
  });
export async function POST(req: Request) {

    const { Key } = await req.json() 
    const imageUrl = await s3.getSignedUrlPromise("getObject", {
        Bucket: process.env.BUCKET_NAME,
        Key: Key
      });
 

     
      return  NextResponse.json({imageUrl})
      
}