import S3 from "aws-sdk/clients/s3";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";


const s3 = new S3({
  apiVersion: "2006-03-01",
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION,
  signatureVersion: "v4",
});


export async function GET() {
  const Key = nanoid();

  try {


     

      const s3Params = {
        Bucket:process.env.BUCKET_NAME,
        Key,
        Expires: 60,
      
      };
      const uploadUrl = await s3.getSignedUrlPromise("putObject", s3Params);
    return  NextResponse.json({
        uploadUrl,
        key: Key,
      });
    
  
  } catch (error) {
    console.log(error);
  }
}
