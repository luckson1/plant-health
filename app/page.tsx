"use client";

import { ChatList } from "@/components/chat_list";
import { ChatScrollAnchor } from "@/components/chat_scorll_anchor";
import { ImageDropzone } from "@/components/dropzone";
import { Button } from "@/components/ui/button";
import { IconArrowElbow } from "@/components/ui/icons";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useChat } from "ai/react";
import { useRef, useState } from "react";
import { client } from "@gradio/client";
import LoadingSVG from "@/components/loading_svg";
import { Plants } from "@/components/plants_covered";
import { nanoid } from "@/lib/utils";
type Result = {
  data: {
    label: string;
    confidences: {
      label: string;
      confidence: number;
    }[];
  }[];
};
const formRef = useRef<HTMLFormElement>(null);
export default function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
  } = useChat();

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      formRef.current?.requestSubmit();
      event.preventDefault();
    }
  };

  const [images, setImages] = useState<File[] | null>(null);
  const [imagePrediction, setImagePrediction] = useState<string>();
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [confidence, setConfidence] = useState<number>();
  const uploadToS3Bucket = async () => {
    if (!images) {
      return null;
    }

    const { data }: { data: { uploadUrl: string; key: string } } =
      await axios.get(`/api/upload`);

    const { uploadUrl, key } = data;

    await axios.put(uploadUrl, images[0]);

    return key;
  };

  const getPrediction = async () => {
    try {
      setImagePrediction(undefined);
      setIsPredictionLoading(true);
      const Key = await uploadToS3Bucket();
      if (!Key) return;
      const response: { data: { imageUrl: string } } = await axios.post(
        `/api/predict`,
        { Key }
      );
      const url = response.data.imageUrl;
      const response_0 = await fetch(url);
      const exampleImage = await response_0.blob();

      const app = await client("https://jacksonga-plant-disease.hf.space/");

      const result = (await app.predict("/predict", [exampleImage])) as Result;

      const prediction = result.data[0].label;
      const predictionConfidence = result?.data
        ?.at(0)
        ?.confidences?.at(0)?.confidence;

      if (prediction && predictionConfidence) {
        setImagePrediction(prediction);
        setIsPredictionLoading(false);
        setConfidence(Math.round(predictionConfidence * 100));
        const isSickLeaf = !prediction.includes("healthy");
        const id = nanoid();
        if (isSickLeaf)
          append({
            content: `What is ${prediction}, its symptoms, prevention and treatment measures`,
            id,
            role: "user",
          });
      }
      setIsPredictionLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsPredictionLoading(false);
    }
  };

  return (
    <main className="w-full h-full flex flex-col text-center px-4 mt-4 sm:mb-0 mb-8 py-4 lg:px-10 justify-center items-center">
      <div className="inline w-full max-w-xl mb-2 md:md-5">
        Chat with an AI Pathologist for leaf health diagnostics of these
        <Plants />
      </div>
      <div className="flex flex-1 w-full flex-col lg:flex-row  text-center  gap-x-5 xl:gap-x-0 space-y-10 ">
        <div className="w-full flex-col space-y-5 max-w-xs">
          {!imagePrediction && (
            <div className="inline text-xs text-start">
              {" "}
              * Upload an image of a{" "}
              <span className="font-extrabold">Single</span> leaf of any of
              these <Plants /> only
            </div>
          )}
          <ImageDropzone
            setImages={setImages}
            images={images}
            setImagePrediction={setImagePrediction}
          />
          <Button
            className="w-full"
            size={"lg"}
            onClick={async () => await getPrediction()}
            disabled={!images}
          >
            {isPredictionLoading ? (
              <div className="flex flex-row space-x-3">
                <LoadingSVG />
                Loading
              </div>
            ) : (
              "Determine leaf condition"
            )}
          </Button>
          {imagePrediction && (
            <p className="text-start">
              {imagePrediction.includes("healthy")
                ? `There's ${confidence}% chance this is a healthy ${imagePrediction.replace(
                    new RegExp("\\b" + "healthy" + "\\b", "gi"),
                    ""
                  )} leaf`
                : `There's ${confidence}% chance this leaf has ${imagePrediction}.`}
            </p>
          )}
        </div>

        <div className="flex flex-col w-full max-w-2xl  mx-auto stretch ">
          <ChatList messages={messages} />
          <ChatScrollAnchor trackVisibility={isLoading} />
          <form onSubmit={handleSubmit} ref={formRef} className="relative ">
            <Textarea
              onKeyDown={handleKeyDown}
              className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
              value={input}
              placeholder={
                imagePrediction?.includes("healthy") ||
                imagePrediction === undefined
                  ? "Ask me about any plant disease..."
                  : `Ask me about ${imagePrediction}`
              }
              onChange={handleInputChange}
            />
            <div className="absolute right-0 top-4 sm:right-4">
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || input === ""}
              >
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
